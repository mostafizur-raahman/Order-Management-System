import { SelectQueryBuilder } from 'typeorm';
import { User } from './entities/user.entity';

export class UserSpecification {
  static matchId(
    queryBuilder: SelectQueryBuilder<User>,
    id: string | undefined,
  ): SelectQueryBuilder<User> {
    if (id) {
      return queryBuilder.andWhere('user.id = :id', { id });
    }
    return queryBuilder;
  }

  static matchName(
    queryBuilder: SelectQueryBuilder<User>,
    name: string | undefined,
  ): SelectQueryBuilder<User> {
    if (name) {
      return queryBuilder.andWhere('user.name ILIKE :name', {
        name: `%${name}%`,
      });
    }
    return queryBuilder;
  }

  static matchEmail(
    queryBuilder: SelectQueryBuilder<User>,
    email: string | undefined,
  ): SelectQueryBuilder<User> {
    if (email) {
      return queryBuilder.andWhere('user.email ILIKE :email', {
        email: `%${email}%`,
      });
    }
    return queryBuilder;
  }

  static matchRole(
    queryBuilder: SelectQueryBuilder<User>,
    role: string | undefined,
  ): SelectQueryBuilder<User> {
    if (role) {
      return queryBuilder.andWhere('user.role = :role', { role });
    }
    return queryBuilder;
  }

  static matchIsActive(
    queryBuilder: SelectQueryBuilder<User>,
    isActive: boolean | undefined,
  ): SelectQueryBuilder<User> {
    if (isActive !== undefined && isActive !== null) {
      return queryBuilder.andWhere('user.is_active = :isActive', { isActive });
    }
    return queryBuilder;
  }

  static matchBanned(
    queryBuilder: SelectQueryBuilder<User>,
    banned: boolean | undefined,
  ): SelectQueryBuilder<User> {
    if (banned !== undefined && banned !== null) {
      return queryBuilder.andWhere('user.banned = :banned', { banned });
    }
    return queryBuilder;
  }

  static commonSearch(
    queryBuilder: SelectQueryBuilder<User>,
    searchKey: string | undefined,
  ): SelectQueryBuilder<User> {
    if (searchKey && searchKey.trim().length > 0) {
      return queryBuilder.andWhere(
        `(user.name ILIKE :searchKey OR user.email ILIKE :searchKey OR CAST(user.id AS TEXT) ILIKE :searchKey)`,
        { searchKey: `%${searchKey}%` },
      );
    }
    return queryBuilder;
  }
}
