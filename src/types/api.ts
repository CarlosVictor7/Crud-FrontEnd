export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface ApiErrorShape {
  success?: boolean;
  message?: string;
  error?: string;
}
