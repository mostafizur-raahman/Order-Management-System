import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const user = request.user;

    // Log incoming request payload
    this.logger.log(
      `[Request] ${method} ${url} | User: ${user?.id || 'Public'} | Payload: ${JSON.stringify(body)}`,
    );

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `[Response] ${method} ${url} completed in ${Date.now() - now}ms`,
        );
      }),
    );
  }
}
