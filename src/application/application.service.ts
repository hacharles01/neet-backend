import { Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../utils/error.utils';
import { conflictError, createSuccessResponse, notFoundError } from '../utils/response.utils';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(createApplicationDto: CreateApplicationDto) {
    try {
      // Check if application with same nationalId exists
      const existingApplication = await this.prisma.application.findUnique({
        where: { nationalId: createApplicationDto.nationalId },
      });

      if (existingApplication) {
        return conflictError('Application with this national ID already exists');
      }

      const application = await this.prisma.application.create({
        data: {
          ...createApplicationDto,
          status: createApplicationDto.status || ApplicationStatus.PENDING,
        },
      });

      return createSuccessResponse('Application created successfully', application);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'ApplicationService',
        'create',
        'Failed to create application',
      );
    }
  }

  async findAll() {
    try {
      const applications = await this.prisma.application.findMany({
        orderBy: { appliedAt: 'desc' },
      });
      return createSuccessResponse('Applications retrieved successfully', applications);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'ApplicationService',
        'findAll',
        'Failed to retrieve applications',
      );
    }
  }

  async findOne(id: number) {
    try {
      const application = await this.prisma.application.findUnique({
        where: { id },
      });

      if (!application) {
        return notFoundError('Application not found');
      }

      return createSuccessResponse('Application retrieved successfully', application);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'ApplicationService',
        'findOne',
        'Failed to retrieve application',
      );
    }
  }

  async update(id: number, updateApplicationDto: UpdateApplicationDto) {
    try {
      const existingApplication = await this.prisma.application.findUnique({
        where: { id },
      });

      if (!existingApplication) {
        return notFoundError('Application not found');
      }

      // Check if new nationalId is unique (if provided)
      if (updateApplicationDto.nationalId && updateApplicationDto.nationalId !== existingApplication.nationalId) {
        const duplicateNationalId = await this.prisma.application.findUnique({
          where: { nationalId: updateApplicationDto.nationalId },
        });
        if (duplicateNationalId) {
          return conflictError('Application with this national ID already exists');
        }
      }

      const updatedApplication = await this.prisma.application.update({
        where: { id },
        data: updateApplicationDto,
      });

      return createSuccessResponse('Application updated successfully', updatedApplication);
    } catch (error) {
      if (error.code === 'P2002') {
        return conflictError('Application with this national ID already exists');
      }
      return this.errorHandler.handleError(
        error,
        'ApplicationService',
        'update',
        'Failed to update application',
      );
    }
  }

  async remove(id: number) {
    try {
      const existingApplication = await this.prisma.application.findUnique({
        where: { id },
      });

      if (!existingApplication) {
        return notFoundError('Application not found');
      }

      await this.prisma.application.delete({
        where: { id },
      });

      return createSuccessResponse('Application deleted successfully', null);
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        'ApplicationService',
        'remove',
        'Failed to delete application',
      );
    }
  }
}