export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  error?: any;
}

export function formatResponse<T>(success: boolean, message: string, data?: T, meta?: any): ApiResponse<T> {
  return {
    success,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
  };
}
