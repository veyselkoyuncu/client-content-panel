import type { FastifyError, FastifyInstance } from 'fastify';
import { AppError } from './errors.js';

export function registerErrorHandling(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError | AppError, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: { code: error.code, message: error.message, details: error.details },
      });
    }

    const statusCode = error.statusCode ?? 500;
    if (statusCode >= 400 && statusCode < 500) {
      return reply.status(statusCode).send({
        error: { code: 'BAD_REQUEST', message: 'İstek işlenemedi. Gönderilen veriyi kontrol edin.' },
      });
    }

    request.log.error({ err: error }, 'Unhandled error');
    return reply.status(500).send({
      error: { code: 'INTERNAL_ERROR', message: 'Beklenmeyen bir hata oluştu.' },
    });
  });

  app.setNotFoundHandler((request, reply) =>
    reply.status(404).send({
      error: { code: 'NOT_FOUND', message: `${request.method} ${request.url} bulunamadı.` },
    }),
  );
}
