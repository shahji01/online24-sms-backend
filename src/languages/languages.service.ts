import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Language } from './Language.entity';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language) private langRepo: Repository<Language>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: { translations: { lang_code: string; lang_name: string }[] }) {
    try {
      if (!Array.isArray(dto.translations) || dto.translations.length === 0) {
        return {
          success: false,
          message: 'Invalid payload. "translations" must be a non-empty array.',
        };
      }

      // Duplicate check
      const duplicateCheck = await this.langRepo
        .createQueryBuilder('l')
        .where(
          dto.translations
            .map(
              (_, idx) =>
                `(l.lang_code = :lang_code${idx} AND l.lang_name = :lang_name${idx})`,
            )
            .join(' OR '),
        )
        .setParameters(
          Object.assign(
            {},
            ...dto.translations.map((t, idx) => ({
              [`lang_code${idx}`]: t.lang_code,
              [`lang_name${idx}`]: t.lang_name,
            })),
          ),
        )
        .getMany();

      if (duplicateCheck.length > 0) {
        return {
          success: false,
          message: `Some translations already exist: ${duplicateCheck
            .map(d => `${d.lang_name} (${d.lang_code})`)
            .join(', ')}`,
        };
      }

      // Save all translations
      const newLanguages = dto.translations.map(t =>
        this.langRepo.create({
          lang_code: t.lang_code,
          lang_name: t.lang_name,
        }),
      );

      await this.langRepo.save(newLanguages);

      return {
        success: true,
        message: 'Languages created successfully.',
        data: { translations: newLanguages },
      };
    } catch (error) {
      console.error('Error creating Languages:', error);
      return {
        success: false,
        message: 'Failed to create Languages.',
        error: error?.message || error,
      };
    }
  }

  async findAll(status?: number) {
    if (status !== undefined) {
      return await this.dataSource.query(
        `SELECT * FROM languages WHERE status = ?`,
        [status],
      );
    }
    return await this.dataSource.query(`SELECT * FROM languages`);
  }

  async update(
    id: number,
    translation: { lang_code?: string; lang_name?: string },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const existing = await this.langRepo.findOne({ where: { id } });

      if (!existing) {
        return {
          success: false,
          message: `Language with ID ${id} not found.`,
        };
      }

      // Duplicate check if lang_code and lang_name are provided
      if (translation.lang_code && translation.lang_name) {
        const duplicate = await this.langRepo.findOne({
          where: {
            lang_code: translation.lang_code,
            lang_name: translation.lang_name,
          },
        });

        if (duplicate && duplicate.id !== id) {
          return {
            success: false,
            message: `Duplicate translation exists for language "${translation.lang_code}" and name "${translation.lang_name}".`,
          };
        }
      }

      Object.assign(existing, translation);
      await this.langRepo.save(existing);

      return {
        success: true,
        message: 'Language updated successfully.',
      };
    } catch (error) {
      console.error('Error updating language:', error);
      return {
        success: false,
        message: 'Failed to update Language.',
      };
    }
  }
}
