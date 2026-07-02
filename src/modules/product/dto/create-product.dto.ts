import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Electronics', description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(0, { message: 'Stock cannot be negative' })
  stockQuantity?: number;
}
