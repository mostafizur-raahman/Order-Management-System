import { SelectQueryBuilder } from 'typeorm';
import { Order } from './entities/order.entity';

export class OrderSpecification {
  static matchId(
    queryBuilder: SelectQueryBuilder<Order>,
    id: string | undefined,
  ): SelectQueryBuilder<Order> {
    if (id) {
      return queryBuilder.andWhere('order.id = :id', { id });
    }
    return queryBuilder;
  }

  static matchOrderId(
    queryBuilder: SelectQueryBuilder<Order>,
    orderId: string | undefined,
  ): SelectQueryBuilder<Order> {
    if (orderId) {
      return queryBuilder.andWhere('order.orderId ILIKE :orderId', {
        orderId: `%${orderId}%`,
      });
    }
    return queryBuilder;
  }

  static matchStatus(
    queryBuilder: SelectQueryBuilder<Order>,
    status: string | undefined,
  ): SelectQueryBuilder<Order> {
    if (status) {
      return queryBuilder.andWhere('order.status = :status', { status });
    }
    return queryBuilder;
  }

  static matchIsPaid(
    queryBuilder: SelectQueryBuilder<Order>,
    isPaid: boolean | undefined,
  ): SelectQueryBuilder<Order> {
    if (isPaid !== undefined && isPaid !== null) {
      return queryBuilder.andWhere('order.isPaid = :isPaid', { isPaid });
    }
    return queryBuilder;
  }

  static matchUserId(
    queryBuilder: SelectQueryBuilder<Order>,
    userId: string | undefined,
  ): SelectQueryBuilder<Order> {
    if (userId) {
      // Uses the actual DB column name defined in @JoinColumn({ name: 'user_id' })
      return queryBuilder.andWhere('order.user_id = :userId', { userId });
    }
    return queryBuilder;
  }

  static matchMinAmount(
    queryBuilder: SelectQueryBuilder<Order>,
    minAmount: number | undefined,
  ): SelectQueryBuilder<Order> {
    if (minAmount !== undefined && minAmount !== null) {
      return queryBuilder.andWhere('order.totalAmount >= :minAmount', {
        minAmount,
      });
    }
    return queryBuilder;
  }

  static matchMaxAmount(
    queryBuilder: SelectQueryBuilder<Order>,
    maxAmount: number | undefined,
  ): SelectQueryBuilder<Order> {
    if (maxAmount !== undefined && maxAmount !== null) {
      return queryBuilder.andWhere('order.totalAmount <= :maxAmount', {
        maxAmount,
      });
    }
    return queryBuilder;
  }

  static commonSearch(
    queryBuilder: SelectQueryBuilder<Order>,
    searchKey: string | undefined,
  ): SelectQueryBuilder<Order> {
    if (searchKey && searchKey.trim().length > 0) {
      return queryBuilder.andWhere(
        `(order.orderId ILIKE :searchKey OR CAST(order.id AS TEXT) ILIKE :searchKey)`,
        { searchKey: `%${searchKey}%` },
      );
    }
    return queryBuilder;
  }
}
