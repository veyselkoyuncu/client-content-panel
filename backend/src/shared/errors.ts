export interface FieldError {
  field: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly details?: FieldError[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (message = 'Kayıt bulunamadı.') => new AppError(404, 'NOT_FOUND', message);

export const conflict = (code: string, message: string, details?: FieldError[]) =>
  new AppError(409, code, message, details);

export const validationError = (details: FieldError[], message = 'Gönderilen bilgiler geçersiz.') =>
  new AppError(400, 'VALIDATION_ERROR', message, details);

export const unauthorized = (message = 'Bu işlem için giriş yapmalısınız.') =>
  new AppError(401, 'UNAUTHORIZED', message);
