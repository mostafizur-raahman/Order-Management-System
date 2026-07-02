import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PageRequest } from '../../common/dto/page-request.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { API_PREFIX } from 'src/constants/project.constant';

@ApiTags('Products')
@ApiBearerAuth()
@Controller(`${API_PREFIX}/products`)
@UseGuards(RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Search and filter products with pagination' })
  @ApiQuery({ name: 'id', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'searchKey', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of products' })
  async findAll(
    @Res() res: Response,
    @Query('id') id?: string,
    @Query('name') name?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('searchKey') searchKey?: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    return res
      .status(HttpStatus.OK)
      .send(
        await this.productService.search(
          id,
          name,
          category,
          minPrice,
          maxPrice,
          searchKey,
          new PageRequest(page, size),
        ),
      );
  }

  @Get('/:id')
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Res() res: Response, @Param('id') id: string) {
    return res
      .status(HttpStatus.OK)
      .send(await this.productService.findById(id));
  }

  @Post('/create')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 409, description: 'Product already exists' })
  async create(
    @Res() res: Response,
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: any,
  ) {
    return res
      .status(HttpStatus.CREATED)
      .send(await this.productService.create(createProductDto, user));
  }

  @Patch('/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: any,
  ) {
    return res
      .status(HttpStatus.OK)
      .send(await this.productService.update(id, updateProductDto, user));
  }

  @Delete('/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Res() res: Response, @Param('id') id: string) {
    await this.productService.remove(id);
    return res
      .status(HttpStatus.OK)
      .send({ message: 'Product deleted successfully' });
  }
}
