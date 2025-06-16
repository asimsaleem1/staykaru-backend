import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../schema/user.schema';

@ApiTags('users')
@Controller('users')
// @UseGuards(AuthGuard, RolesGuard) // Temporarily disabled for testing
// @ApiBearerAuth('JWT-auth') // Temporarily disabled for testing
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        phone: '+1234567890',
        address: '123 Main St',
        created_at: '2025-05-28T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all users',
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          created_at: '2025-05-28T10:00:00.000Z',
        },
      ],
    },
  })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Return a user',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        phone: '+1234567890',
        address: '123 Main St',
        created_at: '2025-05-28T10:00:00.000Z',
        updated_at: '2025-05-28T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'John Updated',
        message: 'User updated successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.userService.delete(id);
    return { message: 'User deleted successfully' };
  }
}
