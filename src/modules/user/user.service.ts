import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSpecification } from './user.specification';
import { PageRequest } from '../../common/dto/page-request.dto';
import {
  createPaginatedResponse,
  PaginatedResponseDto,
} from '../../common/dto/pagination.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async search(
    id: string | undefined,
    name: string | undefined,
    email: string | undefined,
    isActive: boolean | undefined,
    pageRequest: PageRequest,
  ): Promise<PaginatedResponseDto<any>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    UserSpecification.matchId(queryBuilder, id);
    UserSpecification.matchName(queryBuilder, name);
    UserSpecification.matchEmail(queryBuilder, email);
    UserSpecification.matchIsActive(queryBuilder, isActive);

    const [users, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(pageRequest.page * pageRequest.size)
      .take(pageRequest.size)
      .getManyAndCount();

    const serializedUsers = instanceToPlain(users);
    const transformedUsers = plainToInstance(
      User,
      serializedUsers,
    ) as unknown as User[];

    return createPaginatedResponse(transformedUsers, total, pageRequest);
  }

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || Role.USER,
    });

    const savedUser = await this.userRepository.save(user);
    return instanceToPlain(savedUser);
  }

  async findOne(id: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return instanceToPlain(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.delete(id);
  }
}
