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
  ) { }

  async create(createApplicationDto: CreateApplicationDto) {
    try {
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

  // async findAll(
  //   page: number = 1,
  //   limit: number = 1000,
  //   search?: string,
  //   status?: ApplicationStatus,
  // ) {
  //   try {
  //     const skip = (page - 1) * limit;
  //     const where: any = {};

  //     // Build search conditions only if search term is provided
  //     if (search && search.trim()) {
  //       const searchTerm = search.trim();

  //       where.OR = [
  //         { firstName: { contains: searchTerm, mode: 'insensitive' } },
  //         { lastName: { contains: searchTerm, mode: 'insensitive' } },
  //         { email: { contains: searchTerm, mode: 'insensitive' } },
  //         { nationalId: { contains: searchTerm, mode: 'insensitive' } },
  //         { registrationType: { contains: searchTerm, mode: 'insensitive' } },

  //       ];
  //     }

  //     // Add status filter if provided and valid
  //     if (status && status !== 'All') {
  //       where.status = status;
  //     }

  //     // Execute queries
  //     const [applications, total] = await Promise.all([
  //       this.prisma.application.findMany({
  //         where,
  //         orderBy: { appliedAt: 'desc' },
  //         skip,
  //         take: limit,
  //       }),
  //       this.prisma.application.count({ where }),
  //     ]);

  //     return createSuccessResponse('Applications retrieved successfully', {
  //       applications,
  //       total,
  //       page,
  //       limit,
  //       totalPages: Math.ceil(total / limit),
  //       hasNextPage: page < Math.ceil(total / limit),
  //       hasPrevPage: page > 1,
  //     });
  //   } catch (error) {
  //     console.error('Error in findAll:', error);
  //     return this.errorHandler.handleError(
  //       error,
  //       'ApplicationService',
  //       'findAll',
  //       'Failed to retrieve applications',
  //     );
  //   }
  // }

  async findAll(
      page: number = 1,
      limit: number = 1000,
      search?: string,
      status?: ApplicationStatus,
    ) {
      try {
        const skip = (page - 1) * limit;
        const where: any = { AND: [] }; 

        // Add status filter if provided and valid
        if (status && status !== 'All') {
          where.AND.push({ status }); 
        }

        // Build search conditions only if search term is provided
        if (search && search.trim()) {
          const searchTerm = search.trim();
          const searchConditions = {
            OR: [
              { firstName: { contains: searchTerm, mode: 'insensitive' } },
              { lastName: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
              { nationalId: { contains: searchTerm, mode: 'insensitive' } },
              { registrationType: { contains: searchTerm, mode: 'insensitive' } },
            ],
          };
          where.AND.push(searchConditions); 
        }

    
        // Execute queries
        const [applications, total] = await Promise.all([
          this.prisma.application.findMany({
            where: where.AND.length > 0 ? where : {}, 
            orderBy: { appliedAt: 'desc' },
            skip,
            take: limit,
          }),
          this.prisma.application.count({
            where: where.AND.length > 0 ? where : {},
          }),
        ]);

        return createSuccessResponse('Applications retrieved successfully', {
          applications,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        });
      } catch (error) {
        console.error('Error in findAll:', error);
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