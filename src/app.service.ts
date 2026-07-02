import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      projectName: 'Order Management System',
      projectVersion: 'v1',
    };
  }
}
