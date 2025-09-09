import {
  Injectable,
  CanActivate,
  ExecutionContext
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    const userRoles = user.roles?.map((r: any) => r.role_name) || [];

    return requiredRoles.some(role => userRoles.includes(role));
  }
}
