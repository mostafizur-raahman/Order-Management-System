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
  @ApiOperation({ summary: 'Create a new order' })
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
  @ApiQuery({ name: 'orderId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'isPaid', required: false })
  @ApiQuery({ name: 'searchKey', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
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
  @ApiOperation({ summary: 'Get all orders with filters (Admin only)' })
  @ApiQuery({ name: 'id', required: false })
  @ApiQuery({ name: 'orderId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'isPaid', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'minAmount', required: false, type: Number })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number })
  @ApiQuery({ name: 'searchKey', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
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
  @ApiOperation({ summary: 'Get order by ID' })
  async findOne(@Res() res: Response, @Param('id') id: string) {
    return res
      .status(HttpStatus.OK)
      .send(await this.orderService.getOrderById(id));
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
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
