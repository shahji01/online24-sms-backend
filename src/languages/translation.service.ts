import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { log } from 'console';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly openAiKey = process.env.OPENAI_API_KEY;

  private readonly libreTranslateUrl = 'https://libretranslate.de/translate';
  private readonly myMemoryUrl = 'https://api.mymemory.translated.net/get';

  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const sources = [
      () => this.tryOpenAI(text, sourceLang, targetLang),
      () => this.tryLibreTranslate(text, sourceLang, targetLang),
      () => this.tryMyMemory(text, sourceLang, targetLang),
    ];

    for (const source of sources) {
      try {
        return await source();
      } catch (err) {
        this.logger.warn(`Translation attempt failed: ${err.message}`);
      }
    }

    this.logger.error('All translation sources failed');
    return text;
  }

  private async tryOpenAI(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!this.openAiKey) throw new Error('OpenAI API key not configured');

    const langMap: Record<string, string> = { en: 'English', ar: 'Arabic', ur: 'Urdu' };
    const targetName = langMap[targetLang] || targetLang;
    const prompt = `Translate to ${targetName}: ${text}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a translator. Return only the translation.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || text;
  }

  private async tryLibreTranslate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const response = await fetch(this.libreTranslateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: sourceLang, target: targetLang }),
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translatedText;
  }

  private async tryMyMemory(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const url = `${this.myMemoryUrl}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MyMemory: ${response.statusText}`);
    }

    const data = await response.json();
    return data.responseData.translatedText;
  }
}
