import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderRepository extends Repository<Order> {
  constructor(private dataSource: DataSource) {
    super(Order, dataSource.createEntityManager());
  }

  async findByOrderId(orderId: string): Promise<Order | null> {
    return this.findOne({
      where: { orderId },
      relations: { user: true, createdBy: true, updatedBy: true, items: true },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return this.findOne({
      where: { id },
      relations: { user: true, createdBy: true, updatedBy: true, items: true },
    });
  }

  // Helper to count orders for sequence generation
  async countTodayOrdersByPrefix(prefix: string): Promise<number> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return this.createQueryBuilder('order')
      .where('order.orderId LIKE :prefix', { prefix: `${prefix}%` })
      .andWhere('order.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .getCount();
  }
}
