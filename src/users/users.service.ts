import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Param,
  Body
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity'; // Corrected path
import * as bcrypt from 'bcryptjs';
import { Permission } from 'src/entities/Permission.entity';
import { Role } from 'src/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Permission)
    private permRepo: Repository<Permission>,

    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) { }

  async findOneByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    try {
      const user = await this.usersRepository.findOne({
        where: { email },

        select: ['id','type', 'name', 'email', 'image', 'password', 'status', 'phone', 'dob', 'address', 'created_date'] // Explicitly select fields
      });

      return user || null; // Explicitly return null if not found
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findByIdWithRolesAndPermissions(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'permissions'], // adjust if nested via roles.permissions
    });
  }

  async create(name: string, email: string, password: string, phone: string, role_id?: number): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    const phoneNO = await this.usersRepository.find({
      where: {
        phone: phone,
      },
    });
    if (phoneNO.length !== 0) {
      throw new BadRequestException('phone No Alraedy Exists');
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const now = new Date();
    const user = this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      created_date: now.toDateString()
    });

    return this.usersRepository.save(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findOneByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async updateResetPasswordToken(email: string, token: string, expiry: Date): Promise<void> {
    await this.usersRepository.update(
      { email },
      {
        reset_password_code: token,
        reset_password_expiry: expiry
      }
    );
  }

  async email_validate(email: string): Promise<any | null> {
    const user = await this.findOneByEmail(email);
    return user;
  }

  async findById(id: number): Promise<any | null> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user_roles', 'role', 'role.id = user.role_id')
      .where('user.id = :id', { id }) // <- only works if `id` is a number and matches
      .select([
        'user.id AS id',
        'user.type AS type',
        'user.name AS name',
        'user.email AS email',
        'user.phone AS phone',
        'role.role_name AS roleName',
      ])
      .getRawOne();

    return user ?? null;
  }

  // --- get user list start --

  async getAllUsers() {
    let users = await this.usersRepository.find();

    if (users.length != 0) {
      return { data: users };
    } else {
      return { data: (users = []) };
    }
  }

  async getList(): Promise<
    { id: number; name: string; email: string; phone: string; roleName: string }[]
  > {
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user_roles', 'role', 'role.id = user.role_id')
      .select([
        'user.id        AS id',
        'user.type      AS type',
        'user.name      AS name',
        'user.email     AS email',
        'user.phone     AS phone',
        'role.role_name AS roleName',
      ])
      .getRawMany();
  }
  // --- get user list end --



  // --- soft delete start --

  async delProfile(id: number) {
    const result = await this.usersRepository.update(id, { status: 2 });
    return result ?? null;
  }

  // --- soft delete end

  // --- reactive profile start --

  async active(id: number): Promise<any | null> {
    const result = await this.usersRepository.update(id, { status: 1 });
    return result ?? null;
  }

  // --- reactive profile end

  // --- update user start --

  async updateUser(
    id: number,
    payload: {
      name?: string;
      email?: string;
      phone?: string;
      dob?: string;
      address?: string;
    },
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    if (payload.name !== undefined) user.name = payload.name;
    if (payload.email !== undefined) user.email = payload.email;
    if (payload.phone !== undefined) user.phone = payload.phone;
    if (payload.dob !== undefined) user.dob = payload.dob;
    if (payload.address !== undefined) user.address = payload.address;

    return this.usersRepository.save(user);
  }

  async updateStatus(id: number, status: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    user.status = status;
    return this.usersRepository.save(user);
  }

  async changeImage(id: number, img: any) {
    console.log(img)
    await this.usersRepository.update(id, { image: img });
    const result = await this.usersRepository.find({ where: { id } });

    return result ?? null;
  }

  async assignPermissionToUser(userId: number, permissionIds: number[]) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const permissions = await this.permRepo.findBy({ id: In(permissionIds) });

    // Overwrite existing permissions instead of adding new ones
    user.permissions = permissions;

    return await this.usersRepository.save(user);
  }

  async assignRolesToUser(userId: number, roleIds: number[]) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.roleRepo.findBy({
      id: In(roleIds),
    });

    if (!roles.length) {
      throw new NotFoundException('No valid roles found');
    }

    user.roles = roles;
    await this.usersRepository.save(user);

    return {
      success: true,
      message: 'Roles assigned successfully',
      userId: user.id,
      roles: roles.map((r) => r.role_name),
    };
  }




}