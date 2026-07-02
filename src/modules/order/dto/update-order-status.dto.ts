import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: 'SHIPPED' })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}
