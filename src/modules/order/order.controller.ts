import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
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
  ApiParam,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PageRequest } from '../../common/dto/page-request.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { API_PREFIX } from 'src/constants/project.constant';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller(`${API_PREFIX}/orders`)
@UseGuards(RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/create')
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Create a new order with automatic stock reduction',
  })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Empty items or insufficient stock',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async create(
    @Res() res: Response,
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: any,
  ) {
    return res
      .status(HttpStatus.CREATED)
      .send(await this.orderService.createOrder(createOrderDto, user));
  }

  @Get('my-orders')
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Get all orders for the logged-in user with filters',
  })
  @ApiQuery({
    name: 'orderId',
    required: false,
    description: 'Filter by human-readable order ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by order status (e.g., PENDING, SHIPPED)',
  })
  @ApiQuery({
    name: 'isPaid',
    required: false,
    description: 'Filter by payment status (true/false)',
  })
  @ApiQuery({
    name: 'searchKey',
    required: false,
    description: 'Global search across order IDs',
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
    description: 'Paginated list of user orders retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getMyOrders(
    @Res() res: Response,
    @CurrentUser() user: any,
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
    @Query('isPaid') isPaid?: string,
    @Query('searchKey') searchKey?: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    const parsedIsPaid =
      isPaid === 'true' ? true : isPaid === 'false' ? false : undefined;

    return res
      .status(HttpStatus.OK)
      .send(
        await this.orderService.getMyOrders(
          user.id,
          orderId,
          status,
          parsedIsPaid,
          searchKey,
          new PageRequest(page, size),
        ),
      );
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all orders with advanced filters (Admin only)',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    description: 'Filter by exact internal UUID',
  })
  @ApiQuery({
    name: 'orderId',
    required: false,
    description: 'Filter by human-readable order ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by order status',
  })
  @ApiQuery({
    name: 'isPaid',
    required: false,
    description: 'Filter by payment status (true/false)',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by specific user UUID',
  })
  @ApiQuery({
    name: 'minAmount',
    required: false,
    type: Number,
    description: 'Minimum total amount',
  })
  @ApiQuery({
    name: 'maxAmount',
    required: false,
    type: Number,
    description: 'Maximum total amount',
  })
  @ApiQuery({
    name: 'searchKey',
    required: false,
    description: 'Global search across order IDs',
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
    description: 'Paginated list of all orders retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async findAll(
    @Res() res: Response,
    @Query('id') id?: string,
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
    @Query('isPaid') isPaid?: string,
    @Query('userId') userId?: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
    @Query('searchKey') searchKey?: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    const parsedIsPaid =
      isPaid === 'true' ? true : isPaid === 'false' ? false : undefined;

    return res
      .status(HttpStatus.OK)
      .send(
        await this.orderService.getAllOrders(
          id,
          orderId,
          status,
          parsedIsPaid,
          userId,
          minAmount,
          maxAmount,
          searchKey,
          new PageRequest(page, size),
        ),
      );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Get order details by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Order details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async findOne(@Res() res: Response, @Param('id') id: string) {
    return res
      .status(HttpStatus.OK)
      .send(await this.orderService.getOrderById(id));
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Order UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot update a cancelled order',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateStatus(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    return res
      .status(HttpStatus.OK)
      .send(
        await this.orderService.updateOrderStatus(
          id,
          updateOrderStatusDto,
          user,
        ),
      );
  }

  @Patch(':id/cancel')
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', description: 'Order UUID', type: String })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot cancel a delivered order',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async cancel(
    @Res() res: Response,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return res
      .status(HttpStatus.OK)
      .send(await this.orderService.cancelOrder(id, user));
  }
}
