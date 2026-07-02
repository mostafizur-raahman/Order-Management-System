import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PageRequest {
  @ApiPropertyOptional({
    default: 0,
    minimum: 0,
    description: 'Page number (0-indexed)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page: number = 0;

  @ApiPropertyOptional({
    default: 10,
    minimum: 1,
    description: 'Items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size: number = 10;

  constructor(page?: number, size?: number) {
    this.page = page ?? 0;
    this.size = size ?? 10;
  }
}
