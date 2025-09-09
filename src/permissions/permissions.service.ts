import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Permission } from "src/entities/Permission.entity";
import { Repository } from "typeorm";

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission) private permRepo: Repository<Permission>
  ) {}

  async create(dto: { permission_name: string }) {
  try {
    const existing = await this.permRepo.findOneBy({
      permission_name: dto.permission_name,
    });

    if (existing) {
      return {
        success: false,
        message: 'Permission name already exists.',
      };
    }

    const permission = this.permRepo.create(dto);
    const saved = await this.permRepo.save(permission);

    return {
      success: true,
      message: 'Permission created successfully.',
      data: saved,
    };
  } catch (error) {
    console.error('Error creating permission:', error);
    return {
      success: false,
      message: 'Failed to create permission.',
      error: error.message || error,
    };
  }
}

  findAll() {
    return this.permRepo.find();
  }

  findOne(id: number) {
    return this.permRepo.findOne({ where: { id } });
  }

  async update(id: number, dto: { permission_name: string }) {
    try {
      const perm = await this.permRepo.findOne({ where: { id } });
      if (!perm) {
        throw new NotFoundException('Permission not found.');
      }

      // Check if the new permission_name already exists (excluding current)
      const existing = await this.permRepo.findOne({
        where: {
          permission_name: dto.permission_name,
        },
      });

      if (existing && existing.id !== id) {
        return {
          success: false,
          message: 'Permission name already exists.',
        };
      }

      perm.permission_name = dto.permission_name;
      const updated = await this.permRepo.save(perm);

      return {
        success: true,
        message: 'Permission updated successfully.',
        data: updated,
      };
    } catch (error) {
      console.error('Error updating permission:', error);
      return {
        success: false,
        message: 'Failed to update permission.',
        error: error.message || error,
      };
    }
  }

  

//   async remove(id: number) {
//     const perm = await this.permRepo.findOne({ where: { id } });
//     return this.permRepo.remove(perm);
//   }
}
