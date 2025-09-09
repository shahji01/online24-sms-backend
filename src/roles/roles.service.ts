import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Permission } from "src/entities/Permission.entity";
import { Role } from "src/entities/role.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Permission) private permRepo: Repository<Permission>,
  ) {}

  async create(roleDto: { role_name: string; permissionIds?: number[] }) {
    try {
      const existingRole = await this.roleRepo.findOne({
        where: { role_name: roleDto.role_name },
      });

      if (existingRole) {
        throw new ConflictException(`Role name "${roleDto.role_name}" already exists.`);
      }

      const role = this.roleRepo.create({ role_name: roleDto.role_name });

      // Attach permissions if provided
      if (roleDto.permissionIds?.length) {
        const permissions = await this.permRepo.findBy({
          id: In(roleDto.permissionIds),
        });
        role.permissions = permissions;
      }

      const savedRole = await this.roleRepo.save(role);

      return {
        success: true,
        message: 'Role created successfully.',
        data: savedRole,
      };
    } catch (error) {
      console.error('Error creating role:', error);
      return {
        success: false,
        message: 'Failed to create role.',
        error: error.message || error,
      };
    }
  }

  findAll() {
    return this.roleRepo.find();
  }

  findOne(id: number) {
    return this.roleRepo.findOne({ where: { id } });
  }

  async update(id: number, roleDto: { role_name: string; permissionIds: number[] }) {
    try {
      const role = await this.roleRepo.findOne({ where: { id } });
      if (!role) throw new NotFoundException('Role not found');

      // 🔍 Check for uniqueness of role_name excluding the current ID
      const existingRole = await this.roleRepo.findOne({
        where: {
          role_name: roleDto.role_name,
        },
      });

      if (existingRole && existingRole.id !== id) {
        throw new ConflictException(`Role name "${roleDto.role_name}" already exists.`);
      }

      role.role_name = roleDto.role_name;

      // Set permissions
      if (roleDto.permissionIds?.length) {
        role.permissions = await this.permRepo.findByIds(roleDto.permissionIds);
      } else {
        role.permissions = [];
      }

      const updateRole = await this.roleRepo.save(role);

      return {
        success: true,
        message: 'Role updated successfully.',
        data: updateRole,
      };
    } catch (error) {
      console.error('Error updating role:', error);
      return {
        success: false,
        message: 'Failed to update role.',
        error: error.message || error,
      };
    }
  }

//   async remove(id: number) {
//     const role = await this.roleRepo.findOne({ where: { id } });
//     return this.roleRepo.remove(role);
//   }
}
