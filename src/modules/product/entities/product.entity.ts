import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { ExecutorSerializer } from 'src/common/dto/executor-user.serializer';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'category', type: 'varchar' })
  category: string;

  @Column({ name: 'price', type: 'float' })
  price: number;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Transform(({ value }) => ExecutorSerializer.serialize(value), {
    toPlainOnly: true,
  })
  @ManyToOne(() => User, { eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Transform(({ value }) => ExecutorSerializer.serialize(value), {
    toPlainOnly: true,
  })
  @ManyToOne(() => User, { eager: false, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
