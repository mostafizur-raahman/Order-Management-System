import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductRepository } from '../product/product.repository';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { OrderIdGeneratorService } from './order-id-generator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, User])],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    OrderIdGeneratorService,
    ProductRepository,
  ],
  exports: [OrderService],
})
export class OrderModule {}
