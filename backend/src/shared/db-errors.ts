interface PostgresError {
  code: string;
  constraint?: string;
}

function isPostgresError(error: unknown): error is PostgresError {
  return typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string';
}

export const isUniqueViolation = (error: unknown, constraint: string) =>
  isPostgresError(error) && error.code === '23505' && error.constraint === constraint;

export const isForeignKeyViolation = (error: unknown) => isPostgresError(error) && error.code === '23503';
