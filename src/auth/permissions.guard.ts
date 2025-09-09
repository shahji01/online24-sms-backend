import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false; // If there's no user, deny access
    }

    // Ensure roles and permissions exist on user object before accessing them
    const rolePermissions = user.roles?.flatMap((role: any) =>
      role.permissions?.map((p: any) => p.permission_name) || []
    ) || [];

    const userPermissions = user.permissions?.map((p: any) => p.permission_name) || [];

    const allPermissions = [...new Set([...rolePermissions, ...userPermissions])];

    return requiredPermissions.some(perm => allPermissions.includes(perm));
  }
}