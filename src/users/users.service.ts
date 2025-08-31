import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CloudinaryService } from '../utils/cloudinary.service';
import { ErrorHandlerService } from '../utils/error.utils';
import { ServiceResponse, createSuccessResponse, notFoundError } from '../utils/response.utils';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  // PRIVATE HELPER METHODS

  private async checkEmailExists(email: string, excludeId?: number): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== excludeId) {
      throw new ConflictException(`Email ${email} already exists`);
    }
  }

  private async findUserOrThrow(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private validateUserRole(role: Role): void {
    if (!Object.values(Role).includes(role)) {
      throw new BadRequestException(`Invalid role: ${role}. Valid roles are: ${Object.values(Role).join(', ')}`);
    }
  }

  // PUBLIC API METHODS

  async create(
    userData: Prisma.UserCreateInput,
    file?: Express.Multer.File
  ): Promise<ServiceResponse> {
    try {
      this.validateUserRole(userData.role);
      await this.checkEmailExists(userData.email);

      const hashedPassword = await this.hashPassword(userData.password);

      let avatarUrl: string | undefined;
      if (file) {
        avatarUrl = await this.cloudinaryService.uploadImage(file);
      }

      const newUser = await this.prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role,
          isActive: Boolean(userData.isActive ?? true),
          ...(avatarUrl && { avatar: avatarUrl }),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return createSuccessResponse('User created successfully', newUser);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'create',
        'Failed to create user'
      );
    }
  }

  async findAll(
    skip?: number,
    take?: number,
    orderBy?: Prisma.UserOrderByWithRelationInput,
    where?: Prisma.UserWhereInput,
  ): Promise<ServiceResponse> {
    try {
      const users = await this.prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const totalCount = await this.prisma.user.count({ where });

      return createSuccessResponse('Users retrieved successfully', {
        totalCount,
        page: skip ? Math.floor(skip / (take || 10)) + 1 : 1,
        pageSize: take || users.length,
        users,
      });
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'findAll',
        'Failed to retrieve users'
      );
    }
  }

  async findOne(id: number): Promise<ServiceResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return notFoundError(`User with ID ${id} not found`);
      }

      return createSuccessResponse('User retrieved successfully', user);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'findOne',
        'Failed to retrieve user'
      );
    }
  }

  async update(
    id: number,
    updateData: Prisma.UserUpdateInput,
    file?: Express.Multer.File,
  ): Promise<ServiceResponse> {
    try {
      await this.findUserOrThrow(id);

      if (updateData.email && typeof updateData.email === 'string') {
        await this.checkEmailExists(updateData.email, id);
      }

      if (updateData.role && typeof updateData.role === 'string') {
        this.validateUserRole(updateData.role as Role);
      }

      let avatarUrl: string | undefined;
      if (file) {
        avatarUrl = await this.cloudinaryService.uploadImage(file);
      }

      const userUpdateData: Prisma.UserUpdateInput = {
        email: updateData.email,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        phone: updateData.phone,
        role: updateData.role,
        isActive: updateData.isActive,
      };

      if (updateData.password && typeof updateData.password === 'string') {
        userUpdateData.password = await this.hashPassword(updateData.password);
      }

      if (avatarUrl) {
        userUpdateData.avatar = avatarUrl;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: userUpdateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return createSuccessResponse('User updated successfully', updatedUser);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'update',
        'Failed to update user'
      );
    }
  }

  async remove(id: number): Promise<ServiceResponse> {
    try {
      await this.findUserOrThrow(id);

      await this.prisma.user.delete({
        where: { id },
      });

      return createSuccessResponse('User deleted successfully');
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'UsersService',
        'remove',
        'Failed to delete user'
      );
    }
  }
}