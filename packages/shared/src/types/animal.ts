export interface Animal {
  id: string;
  name: string;
  species: string;
  age: number | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnimalInput {
  name: string;
  species: string;
  age?: number;
  description?: string;
}

export interface Pagination {
  hasNextPage: boolean;
  nextCursor: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
