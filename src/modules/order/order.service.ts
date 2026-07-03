import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductRepository } from '../product/product.repository';
import { instanceToPlain } from 'class-transformer';
import { PageRequest } from '../../common/dto/page-request.dto';
import {
  createPaginatedResponse,
  PaginatedResponseDto,
} from '../../common/dto/pagination.dto';
import { OrderIdGeneratorService } from './order-id-generator.service';
import { OrderSpecification } from './order.specification';
import { DataSource } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import {
  InvalidRequestException,
  ResourceNotFoundException,
} from 'src/exceptions';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly orderIdGenerator: OrderIdGeneratorService,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(dto: CreateOrderDto, user: any): Promise<any> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderItems: OrderItem[] = [];
      let totalAmount = 0;

      for (const itemDto of dto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new ResourceNotFoundException(
            `Product with ID ${itemDto.productId} not found`,
          );
        }
        if (product.stockQuantity < itemDto.quantity) {
          throw new InvalidRequestException(
            `Insufficient stock for product: ${product.name}. Available: ${product.stockQuantity}`,
          );
        }

        // reduce the stock
        product.stockQuantity -= itemDto.quantity;
        await queryRunner.manager.save(product);

        const orderItem = new OrderItem();
        orderItem.productName = product.name;
        orderItem.category = product.category;
        orderItem.quantity = itemDto.quantity;
        orderItem.price = product.price;

        orderItems.push(orderItem);
        totalAmount += product.price * itemDto.quantity;
      }

      const orderId = await this.orderIdGenerator.generateOrderId(
        orderItems,
        user.id,
      );

      const order = new Order();
      order.orderId = orderId;
      order.user = user;
      order.items = orderItems;
      order.totalAmount = totalAmount;
      order.status = OrderStatus.PENDING;
      order.isPaid = false;
      order.createdBy = user;

      const savedOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return instanceToPlain(savedOrder);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyOrders(
    userId: string,
    orderId: string | undefined,
    status: string | undefined,
    isPaid: boolean | undefined,
    searchKey: string | undefined,
    pageRequest: PageRequest,
  ): Promise<PaginatedResponseDto<any>> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.createdBy', 'createdBy');

    OrderSpecification.matchUserId(queryBuilder, userId);

    OrderSpecification.matchOrderId(queryBuilder, orderId);
    OrderSpecification.matchStatus(queryBuilder, status);
    OrderSpecification.matchIsPaid(queryBuilder, isPaid);
    OrderSpecification.commonSearch(queryBuilder, searchKey);

    const [orders, total] = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip(pageRequest.page * pageRequest.size)
      .take(pageRequest.size)
      .getManyAndCount();

    return createPaginatedResponse(orders, total, pageRequest);
  }

  async getAllOrders(
    id: string | undefined,
    orderId: string | undefined,
    status: string | undefined,
    isPaid: boolean | undefined,
    userId: string | undefined,
    minAmount: number | undefined,
    maxAmount: number | undefined,
    searchKey: string | undefined,
    pageRequest: PageRequest,
  ): Promise<PaginatedResponseDto<any>> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.createdBy', 'createdBy');

    OrderSpecification.matchId(queryBuilder, id);
    OrderSpecification.matchOrderId(queryBuilder, orderId);
    OrderSpecification.matchStatus(queryBuilder, status);
    OrderSpecification.matchIsPaid(queryBuilder, isPaid);
    OrderSpecification.matchUserId(queryBuilder, userId);
    OrderSpecification.matchMinAmount(queryBuilder, minAmount);
    OrderSpecification.matchMaxAmount(queryBuilder, maxAmount);
    OrderSpecification.commonSearch(queryBuilder, searchKey);

    const [orders, total] = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip(pageRequest.page * pageRequest.size)
      .take(pageRequest.size)
      .getManyAndCount();

    return createPaginatedResponse(orders, total, pageRequest);
  }

  async getOrderById(id: string): Promise<any> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new ResourceNotFoundException(`Order not found with id ${id}`);
    }
    return instanceToPlain(order);
  }

  async updateOrderStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    updatedBy: any,
  ): Promise<any> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new ResourceNotFoundException(`Order not found with id ${id}`);
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Cannot update status of a cancelled/delivered order',
      );
    }

    const updatedOrder = new Order();
    updatedOrder.id = order.id;
    updatedOrder.orderId = order.orderId;
    updatedOrder.user = order.user;
    updatedOrder.items = order.items;
    updatedOrder.totalAmount = order.totalAmount;
    updatedOrder.isPaid = order.isPaid;
    updatedOrder.transactionId = order.transactionId;
    updatedOrder.createdBy = order.createdBy;

    updatedOrder.status = dto.status;
    updatedOrder.updatedBy = updatedBy;

    const savedOrder = await this.orderRepository.save(updatedOrder);
    return instanceToPlain(savedOrder);
  }

  async cancelOrder(id: string, cancelledBy: any): Promise<any> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new ResourceNotFoundException(`Order not found with id ${id}`);
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel a delivered order');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot cancel a cancle order');
    }

    order.status = OrderStatus.CANCELLED;
    order.updatedBy = cancelledBy;

    const savedOrder = await this.orderRepository.save(order);
    return instanceToPlain(savedOrder);
  }
}
