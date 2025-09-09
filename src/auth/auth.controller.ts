import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  UseGuards,
  Req,
  BadRequestException,
  Get,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UserToken } from './save-token.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { MailService } from './mail.service';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
@Controller('auth')
export class AuthController {
  jwtService: any;
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private readonly mailService: MailService,
    @InjectRepository(User)
        private usersRepository: Repository<User>,
  ) { }

  @UseGuards(LocalAuthGuard)
  @Post('admin-login')
  async adminLogin(@Req() req, @Res() res: Response) {
    const user = req.user;

    if (user.status === 2) {
      return res.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: 'User Blocked or Not Exist',
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save verification code to DB
    await this.authService.saveVerificationCode(user.email, code);

    // Send code to email
    await this.mailService.sendVerificationCode(user.email, code);

    return res.status(HttpStatus.OK).json({
      status: true,
      message: 'Verification code sent to email',
      data: {
        email: user.email,
      },
    });
  }

  

  @Post('verify-code')
  async verifyCode(
    @Body() body: { email: string; code: string },
    @Res() res: Response,
  ) {
    const { email, code } = body;

    const isValid = await this.authService.verifyCode(email, code);
    if (!isValid) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: false,
        message: 'Invalid or expired verification code',
      });
    }

    const user = await this.authService.findByEmail(email);
    const result = await this.authService.login(user);

    return res.status(HttpStatus.OK).json({
      status: true,
      message: 'Login successful',
      data: result,
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res() res: Response) {

    if (req.user.status == 2) {
      return res.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: 'User Blocked or Not Exist',
      });
    }
    const result = await this.authService.login(req.user);
    return res.status(HttpStatus.OK).json({
      status: true,
      message: 'Login successful',
      data: result,
    });
  }

  @Get('check-token')
  @UseGuards(JwtAuthGuard)
  async validateToken(@Req() req) {
    const token = req.headers['authorization'].split(' ')[1];
    const found = await this.authService.userTokenValidation(token);
    if (!found) {
      return {
        message: 'Token not found',
        status: false,
      };
    }

    return {
      message: 'Token valid',
      status: true,
      data: found,
    };
  }

  @Post('insert-token')
  async insertToken(@Body() body: { userId: number; token: string; deviceId: string }) {
    try {
      const newToken = await this.authService.insertUserToken(
        body.userId,
        body.token,
        body.deviceId,
      );

      return {
        status: true,
        message: 'Token saved successfully',
      };
    } catch (error) {
      return {
        status: false,
        message: 'Failed to save token',
      };
    }
  }


  @Delete('remove-token')
  @UseGuards(JwtAuthGuard)
  async removetoken(@Req() req) {
    const token = req.headers['authorization'].split(' ')[1];
    const removed = await this.authService.removeUserToken(token);
    if (removed) {
      return { status: true, message: 'Logout successful' };
    } else {
      return { status: false, message: 'Token not found or already removed' };
    }
  }


  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string, @Res() res: Response) {
    if (!email) throw new BadRequestException('Email is required');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) throw new BadRequestException('User not found');

    user.reset_password_code = code;
    user.reset_password_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await this.usersRepository.save(user);

    await this.authService.sendResetCodeEmail(email, code);

    return res.status(HttpStatus.OK).json({
      status: true,
      message: 'Reset code sent to your email.',
      data: {
        email: email
      }
    });
  }

  @Post('verify-reset-code')
  async verifyResetCode(
    @Body('email') email: string,
    @Body('code') code: string,
    @Res() res: Response,
  ) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (
      !user ||
      user.reset_password_code !== code
    ) {
      throw new BadRequestException('Invalid or expired code');
    }

    return res.status(HttpStatus.OK).json({
      status: true,
      message: 'Code verified',
      data: {
        email: email
      }
    });
  }

  @Post('reset-password')
async resetPassword(
  @Body('email') email: string,
  @Body('confimPassword') confirmPassword: string,
  @Body('newPassword') newPassword: string,
  @Res() res: Response,
) {
  // Input validation
  if (!email || !confirmPassword || !newPassword) {
    throw new BadRequestException('Email, Confirm Password, and New Password are required');
  }

  if (newPassword !== confirmPassword) {
    throw new BadRequestException('New Password and Confirm Password do not match');
  }

  // Find user by email
  const user = await this.usersRepository.findOne({ where: { email } });

  if (!user) {
    throw new BadRequestException('User not found');
  }

  // Hash and update password
  user.password = await bcrypt.hash(newPassword, 10);
  user.reset_password_code = '';
  //user.reset_password_expiry = null;

  await this.usersRepository.save(user);

  // Return success response
  return res.status(HttpStatus.OK).json({
    status: true,
    message: 'Password has been successfully reset',
  });
}
}
