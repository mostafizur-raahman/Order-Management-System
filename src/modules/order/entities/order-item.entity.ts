import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'product_name', type: 'varchar' })
  productName: string;

  @Column({ name: 'category', type: 'varchar' })
  category: string;

  @Column({ name: 'quantiry', type: 'int' })
  quantity: number;

  @Column({ name: 'price', type: 'float' })
  price: number;
}
