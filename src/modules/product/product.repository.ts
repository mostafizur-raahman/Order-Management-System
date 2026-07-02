import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductRepository extends Repository<Product> {
  constructor(private dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Product | null> {
    return this.findOne({ where: { name } });
  }

  async findById(id: string): Promise<Product | null> {
    return this.findOne({
      where: { id },
      relations: {
        createdBy: true,
        updatedBy: true,
      },
    });
  }
}
