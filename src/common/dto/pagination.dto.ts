import { PageRequest } from './page-request.dto';

export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;

  constructor(data: T[], total: number, pageRequest: PageRequest) {
    this.data = data;
    this.total = total;
    this.page = pageRequest.page;
    this.size = pageRequest.size;
    this.totalPages = Math.ceil(total / pageRequest.size);
  }
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  pageRequest: PageRequest,
): PaginatedResponseDto<T> {
  return new PaginatedResponseDto(data, total, pageRequest);
}
