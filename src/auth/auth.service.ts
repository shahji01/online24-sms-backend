import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserToken } from './save-token.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,

    @InjectRepository(UserToken)
    private tokenRepo: Repository<UserToken>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,


  ) { }

  async saveVerificationCode(email: string, code: string) {
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await this.usersRepository.update({ email }, {
      two_fa_code: code,
      two_fa_expiry: expiry
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user || user.two_fa_code !== code) return false;

    const now = new Date();
    if (!user.two_fa_expiry || user.two_fa_expiry < now) return false;

    await this.usersRepository.update(
      { email },
      {
        two_fa_code: '',
        two_fa_expiry: '',
      },
    );
    return true;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {


    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const userDetails = {
      id: user.id,
      name: user.name,
      image: user.image, // if available
      email: user.email, // if available
      status: user.status, // if available
      address: user.address ?? '', // if available
      dob: user.dob ?? '', // if available
      phone: user.phone ?? '', // if available
      seperatePermission: user.permissions ?? '',
      roles: user.roles || [], // if using roles
    };
    return {
      access_token: accessToken,
      user: userDetails,
    };
  }

  async userTokenValidation(token) {
    const found = await this.tokenRepo.findOneBy({ token });
    if (!found) {
      return false;
    }
    else {
      const user = await this.usersRepository.findOne({
        where: { id: found.userId },
        select: ['id', 'name', 'email', 'image', 'status', 'phone', 'address', 'created_date']
      });
      return user
    }
  }

  async insertUserToken(userId: number, token: string, deviceId: string): Promise<UserToken> {
    const newToken = this.tokenRepo.create({
      userId,
      token,
      deviceId,
      createdAt: new Date(),
    });
    return await this.tokenRepo.save(newToken);
  }

  async removeUserToken(token: string): Promise<boolean> {
    const found = await this.tokenRepo.findOneBy({ token });
    if (!found) return false;
    await this.tokenRepo.remove(found);
    return true;
  }

  async sendResetPasswordEmail(email: string, resetLink: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'tech@akegroup.co.nz',
        pass: 'lchvhaqyjpxzbffo',
      },
    });

    await transporter.sendMail({
      from: '"Support" <your_email@gmail.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });
  }

  async sendResetCodeEmail(email: string, code: string): Promise<void> {
    const frontendURL = `http://localhost:5173/verify-reset-code?email=${encodeURIComponent(email)}`;
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'tech@akegroup.co.nz',
        pass: 'lchvhaqyjpxzbffo',
      },
    });

    await transporter.sendMail({
      from: '"Support" <support@example.com>',
      to: email,
      subject: 'Your Password Reset Code',
      html: `<h3>Password Reset Code</h3><p>Your code: <strong>${code}</strong></p><p>It expires in 10 minutes.</p><p>
        <a href="${frontendURL}" style="display:inline-block;background:#4CAF50;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
      </p>`,
      
    });
  }

}
