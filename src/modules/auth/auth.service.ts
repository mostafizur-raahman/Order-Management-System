import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { UserRepository } from '../user/user.repository';
import { InvalidAuthenticationException } from 'src/exceptions/invalid-authentication.exception';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ResourceAlreadyExistException } from 'src/exceptions/resource-already-exist.exception';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmailWithPassword(
      loginDto.email,
    );

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    console.log('is password', isPasswordValid);

    if (!isPasswordValid) {
      throw new InvalidAuthenticationException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    if (user.banned) {
      throw new UnauthorizedException('Account is banned');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }
  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findByEmail(createUserDto.email);
    if (user) {
      throw new ResourceAlreadyExistException(
        `User already exists with this ${user.email}`,
      );
    }
    const newUser = new User();
    newUser.name = createUserDto.name;
    newUser.email = createUserDto.email;
    newUser.password = await bcrypt.hash(createUserDto.password, 10);

    const savedUser = await this.userRepository.save(newUser);

    return savedUser;
  }
}
