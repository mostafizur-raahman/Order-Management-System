import { SelectQueryBuilder } from 'typeorm';
import { Product } from './entities/product.entity';

export class ProductSpecification {
  static matchId<T extends Record<string, any>>(
    queryBuilder: SelectQueryBuilder<T>,
    id: string | undefined,
  ): SelectQueryBuilder<T> {
    if (id) {
      return queryBuilder.andWhere('product.id = :id', { id });
    }
    return queryBuilder;
  }

  static matchName<T extends Record<string, any>>(
    queryBuilder: SelectQueryBuilder<T>,
    name: string | undefined,
  ): SelectQueryBuilder<T> {
    if (name) {
      return queryBuilder.andWhere('product.name ILIKE :name', {
        name: `%${name}%`,
      });
    }
    return queryBuilder;
  }

  static matchCategory<T extends Record<string, any>>(
    queryBuilder: SelectQueryBuilder<T>,
    category: string | undefined,
  ): SelectQueryBuilder<T> {
    if (category) {
      return queryBuilder.andWhere('product.category ILIKE :category', {
        category: `%${category}%`,
      });
    }
    return queryBuilder;
  }

  static matchMinPrice<T extends Record<string, any>>(
    queryBuilder: SelectQueryBuilder<T>,
    minPrice: number | undefined,
  ): SelectQueryBuilder<T> {
    if (minPrice !== undefined && minPrice !== null) {
      return queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }
    return queryBuilder;
  }

  static matchMaxPrice<T extends Record<string, any>>(
    queryBuilder: SelectQueryBuilder<T>,
    maxPrice: number | undefined,
  ): SelectQueryBuilder<T> {
    if (maxPrice !== undefined && maxPrice !== null) {
      return queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }
    return queryBuilder;
  }

  static commonSearch<T extends Record<string, any>>(
    queryBuilder: SelectQueryBuilder<T>,
    searchKey: string | undefined,
  ): SelectQueryBuilder<T> {
    if (searchKey && searchKey.trim().length > 0) {
      return queryBuilder.andWhere(
        `(product.name ILIKE :searchKey OR product.category ILIKE :searchKey OR CAST(product.id AS TEXT) ILIKE :searchKey)`,
        { searchKey: `%${searchKey}%` },
      );
    }
    return queryBuilder;
  }
}
