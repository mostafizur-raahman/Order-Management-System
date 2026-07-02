import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { Role } from '../../common/enums/role.enum';
import { ENV } from '../../config/env.config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async onModuleInit() {
    if (!ENV.ENABLE_SEEDER) {
      this.logger.log('Seeder is disabled. Skipping...');
      return;
    }

    this.logger.log('Starting database seeder...');
    await this.seed();
    this.logger.log('Seeder completed successfully');
  }

  private async seed() {
    await this.seedAdmin();
    await this.seedUser();
  }

  private async seedAdmin() {
    const existingAdmin = await this.userRepository.findOne({
      where: { email: ENV.SEED_ADMIN_EMAIL },
    });

    if (existingAdmin) {
      this.logger.log(`Admin user already exists: ${ENV.SEED_ADMIN_EMAIL}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(ENV.SEED_ADMIN_PASSWORD, 10);

    const admin = this.userRepository.create({
      name: 'Super Admin',
      email: ENV.SEED_ADMIN_EMAIL,
      role: Role.ADMIN,
      password: hashedPassword,
      isActive: true,
      banned: false,
    });

    await this.userRepository.save(admin);
    this.logger.log(`Admin user created: ${ENV.SEED_ADMIN_EMAIL}`);
  }

  private async seedUser() {
    const existingUser = await this.userRepository.findOne({
      where: { email: ENV.SEED_USER_EMAIL },
    });

    if (existingUser) {
      this.logger.log(`Regular user already exists: ${ENV.SEED_USER_EMAIL}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(ENV.SEED_USER_PASSWORD, 10);

    const user = this.userRepository.create({
      name: 'Regular user',
      email: ENV.SEED_USER_EMAIL,
      role: Role.USER,
      password: hashedPassword,
      isActive: true,
      banned: false,
    });

    await this.userRepository.save(user);
    this.logger.log(`Regular user created: ${ENV.SEED_USER_EMAIL}`);
  }
}
