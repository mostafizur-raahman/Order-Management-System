import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrderIdGeneratorService {
  constructor(private readonly orderRepository: OrderRepository) {}

  /**
   * Generates a unique, human-readable Order ID.
   * Format: [CATEGORY]-[CUSTOMER_ID]-[YYMMDD]-[SEQUENCE]
   * Example: FIS-9844-260703-0001
   */
  async generateOrderId(items: OrderItem[], userId: string): Promise<string> {
    if (!items || items.length === 0) {
      throw new Error('Cannot generate Order ID without items');
    }

    // 1. Get Category Prefix
    const firstItemCategory = items[0].category || 'GEN';
    const prefix = this.getCategoryPrefix(firstItemCategory);

    // 2. Get Customer Identifier (First 4 chars of the user's UUID)
    // e.g., "9844405d-a05d-4219..." becomes "9844"
    const customerSnippet = userId
      .replace(/-/g, '')
      .substring(0, 4)
      .toUpperCase();

    // 3. Get Date in YYMMDD format
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // 4. Get Sequence Number for today
    const sequencePrefix = `${prefix}-${customerSnippet}-${dateStr}`;
    const count =
      await this.orderRepository.countTodayOrdersByPrefix(sequencePrefix);
    const sequence = (count + 1).toString().padStart(4, '0');

    // 5. Combine
    return `${sequencePrefix}-${sequence}`;
  }

  private getCategoryPrefix(category: string): string {
    const cleanCategory = category.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (cleanCategory.length >= 3) {
      return cleanCategory.substring(0, 3);
    }
    return cleanCategory.padEnd(3, 'X');
  }
}
