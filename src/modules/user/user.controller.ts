import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { PageRequest } from '../../common/dto/page-request.dto';
import type { Response } from 'express';
import { API_PREFIX } from 'src/constants/project.constant';

@ApiTags('Users')
@ApiBearerAuth()
@Controller(`${API_PREFIX}/users`)
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Search and filter users with pagination (Admin only)',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    description: 'Filter by exact user ID',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by name (partial match)',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filter by email (partial match)',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status (true/false)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 0)',
  })
  @ApiQuery({
    name: 'size',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of users retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async findAll(
    @Res() res: Response,
    @Query('id') id?: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ): Promise<any> {
    const parsedIsActive =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    return res
      .status(HttpStatus.OK)
      .send(
        await this.userService.search(
          id,
          name,
          email,
          parsedIsActive,
          new PageRequest(page, size),
        ),
      );
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID', type: String })
  @ApiResponse({ status: 200, description: 'User found successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async findOne(@Res() res: Response, @Param('id') id: string) {
    return res.status(HttpStatus.OK).send(await this.userService.findOne(id));
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User with this email already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async create(@Res() res: Response, @Body() createUserDto: CreateUserDto) {
    return res
      .status(HttpStatus.CREATED)
      .send(await this.userService.createUser(createUserDto));
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user details (Admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID', type: String })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return res
      .status(HttpStatus.OK)
      .send(await this.userService.update(id, updateUserDto));
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID', type: String })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async remove(@Res() res: Response, @Param('id') id: string) {
    await this.userService.remove(id);
    return res
      .status(HttpStatus.OK)
      .send({ message: 'User deleted successfully' });
  }
}
