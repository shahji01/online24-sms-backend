import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  Res,
  Param,
  Put,
  Request,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Interface } from 'readline';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { log } from 'console';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  //@UseGuards(JwtAuthGuard)
  @Post('register')
  async create(

    @Body() body: { name: string; email: string; password: string; phone: string; role_id: number },
    @Res() res: Response,
  ) {
    try {
      const { name, email, password, phone, role_id } = body;
      const newUser = await this.usersService.create(name, email, password, phone, role_id);
      return res.status(HttpStatus.CREATED).json({
        status: true,
        message: 'User registered successfully',
        data: {
          id: newUser.id,
          email: newUser.email,
        },
      });
    }
    catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: 'User registration failed',
        error: error.message || 'An error occurred',
      });
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body() body: { status: number },
    @Res() res: Response,
  ) {
    const updatedUser = await this.usersService.updateStatus(+id, body.status);

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return res.status(HttpStatus.OK).json({
      status: true,
      message: 'User status updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-permission-user-wise')
  async getPermissionUserWise(@Req() req, @Res() res: Response) {
    const userId = req.user?.userId;

    const user = await this.usersService.findByIdWithRolesAndPermissions(userId);

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: 'User not found',
      });
    }

    const userDetails = {
      id: user.id,
      type: user.type,
      name: user.name,
      image: user.image ?? '',
      email: user.email ?? '',
      status: user.status ?? '',
      address: user.address ?? '',
      dob: user.dob ?? '',
      phone: user.phone ?? '',
      seperatePermission: user.permissions ?? '',
      roles: user.roles ?? [],
    };

    return res.status(HttpStatus.OK).json({
      status: true,
      message: 'User fetched successfully',
      data: userDetails,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req, @Res() res: Response) {
    const userId = Number(req.body.id);

    const user = await this.usersService.findById(userId);

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: 'User not found',
      });
    }

    return res.status(HttpStatus.OK).json({
      status: true,
      message: 'Profile fetched successfully',
      data: {
        id: user.id,
        name: user.name,
        role: user.roleName,
        email: user.email,
      },
    });
  }

  // --- get user list start --
  @Get('getList') // final route: GET /users/getList
  async getList(@Res() res: Response) {
    const users = await this.usersService.getList();

    if (!users.length) {
      return res.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: 'No users found',
      });
    }

    return res.status(HttpStatus.OK).json({
      status: true,
      message: 'Users fetched successfully',
      data: users,
    });
  }

  @Get('get-all-users') // final route: GET /users/getList
  async getAllUsers(@Res() res: Response) {
    const users = await this.usersService.getAllUsers();

    return res.status(HttpStatus.OK).json({
      status: true,
      message: 'Users fetched successfully',
      data: users,
    });
  }
  // --- get user list end --


  // --- soft delete start --

  @Post('delete')
  async delete(@Req() req, @Res() res: Response) {
    const userId = Number(req.body.id);

    const user = await this.usersService.delProfile(userId);

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: 'User not found',
      });
    }

    return res.status(HttpStatus.OK).json({
      status: true,
      message: 'Deleted Successfully',

    });
  }
  // --- soft delte end --

  // --- reactivte start --

  @Post('reactive')
  async reactive(@Req() req, @Res() res: Response) {
    const userId = Number(req.body.id);

    const user = await this.usersService.active(userId);

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        status: false,
        message: 'User not found',
      });
    }

    return res.status(HttpStatus.OK).json({
      status: true,
      message: 'Active Successfully',

    });
  }
  // --- reactive end --

  // --- update user start --
  @Patch('updateUser/:id')
  async updateUser(
    @Param('id') id: number,
    @Body()
    body: {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
    },
    @Res() res: Response,
  ) {
    const updatedUser = await this.usersService.updateUser(+id, body);

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return res.status(HttpStatus.OK).json({
      status: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  }


  @UseGuards(JwtAuthGuard)
  @Post('delete-my-profile')
  async deleteMyProfile(@Request() req) {
    const id = req.body.id;
    const user = await this.usersService.delProfile(id);
    return {
      message: "User Profile Delete Successfully...!"
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('change-profile')
  // @UseInterceptors(
  //   FileInterceptor('upload_image',
  //     {
  //       storage: UploadService.storage,
  //       fileFilter: UploadService.fileFilter,
  //     },
  //   ),
  // )
  // async changesProfileImage(@UploadedFile() file: Express.Multer.File, @Request() req) {
  //   if (!file) {
  //     return { message: "select Image" }
  //   }
  //   const image = `uploads/${file.filename}`;
  //   const id = req.user.userId;
  //   const data = await this.usersService.changeImage(id, image);
  //   return {
  //     message: "User Profile Image Changes Successfully...!",
  //     data : data
  //   }
  // }

  @Post(':id/permissions')
  async assignPermission(
    @Param('id') id: string,
    @Body() dto: { permissionIds: number[] }
  ) {
    const userId = parseInt(id, 10);
    const result = await this.usersService.assignPermissionToUser(userId, dto.permissionIds);
    return {
      success: true,
      message: 'Permissions assigned successfully',
      data: result,
    };
  }

    @Post(':id/roles')
    async assignRoles(
      @Param('id', ParseIntPipe) userId: number,
      @Body() dto: AssignRolesDto,
    ) {
      return this.usersService.assignRolesToUser(userId, dto.roleIds);
    }
}
