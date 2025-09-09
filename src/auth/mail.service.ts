// mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  async sendVerificationCode(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'bidecbackenddeveloper@gmail.com',
        pass: 'vamqgismqxmkxsrt',
      },
    });

    await transporter.sendMail({
      from: 'noreply@yourdomain.com',
      to: email,
      subject: 'Your verification code',
      text: `Your 2FA code is: ${code}`,
    });
  }
}
