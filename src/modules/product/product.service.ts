import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductSpecification } from './product.specification';
import { PageRequest } from '../../common/dto/page-request.dto';
import {
  createPaginatedResponse,
  PaginatedResponseDto,
} from '../../common/dto/pagination.dto';
import { Product } from './entities/product.entity';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ResourceAlreadyExistException } from '../../exceptions';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(productDto: CreateProductDto, createdBy: any): Promise<any> {
    const existingProduct = await this.productRepository.findByName(
      productDto.name,
    );
    if (existingProduct) {
      throw new ResourceAlreadyExistException(
        `Product with name: ${productDto.name} already exists.`,
      );
    }

    const product = new Product();
    product.name = productDto.name;
    product.category = productDto.category;
    product.price = productDto.price;
    product.stockQuantity = productDto.stockQuantity ?? 0;
    product.createdBy = createdBy;

    const savedProduct = await this.productRepository.save(product);
    return instanceToPlain(savedProduct);
  }

  async search(
    id: string | undefined,
    name: string | undefined,
    category: string | undefined,
    minPrice: number | undefined,
    maxPrice: number | undefined,
    searchKey: string | undefined,
    pageRequest: PageRequest,
  ): Promise<PaginatedResponseDto<any>> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.createdBy', 'createdBy')
      .leftJoinAndSelect('product.updatedBy', 'updatedBy');

    ProductSpecification.matchId(queryBuilder, id);
    ProductSpecification.matchName(queryBuilder, name);
    ProductSpecification.matchCategory(queryBuilder, category);
    ProductSpecification.matchMinPrice(queryBuilder, minPrice);
    ProductSpecification.matchMaxPrice(queryBuilder, maxPrice);
    ProductSpecification.commonSearch(queryBuilder, searchKey);

    const [products, total] = await queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip(pageRequest.page * pageRequest.size)
      .take(pageRequest.size)
      .getManyAndCount();

    const serializedProducts = instanceToPlain(products);
    const transformedProducts = plainToInstance(
      Product,
      serializedProducts,
    ) as unknown as Product[];

    return createPaginatedResponse(transformedProducts, total, pageRequest);
  }

  async findById(id: string): Promise<any> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product not found with id ${id}`);
    }
    return instanceToPlain(product);
  }

  async update(
    id: string,
    productDto: UpdateProductDto,
    updatedBy: any,
  ): Promise<any> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product not found with id: ${id}`);
    }

    if (productDto.name) {
      const duplicateProduct = await this.productRepository.findByName(
        productDto.name,
      );
      if (duplicateProduct && duplicateProduct.id !== id) {
        throw new ResourceAlreadyExistException(
          `Product already exists with name: ${productDto.name}`,
        );
      }
    }

    const product = new Product();
    product.id = existingProduct.id;
    product.name = productDto.name ?? existingProduct.name;
    product.category = productDto.category ?? existingProduct.category;
    product.price = productDto.price ?? existingProduct.price;
    product.stockQuantity =
      productDto.stockQuantity ?? existingProduct.stockQuantity;
    product.createdBy = existingProduct.createdBy; // Preserve original creator
    product.updatedBy = updatedBy;

    const updatedProduct = await this.productRepository.save(product);
    return instanceToPlain(updatedProduct);
  }

  async remove(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product not found with id: ${id}`);
    }
    await this.productRepository.remove(product);
  }
}
