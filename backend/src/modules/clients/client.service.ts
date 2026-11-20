import type { DB } from '../../db/database.js';
import { isForeignKeyViolation, isUniqueViolation } from '../../shared/db-errors.js';
import { conflict, notFound } from '../../shared/errors.js';
import type { CreateClientInput, ListClientsQuery, UpdateClientInput } from './client.schemas.js';
import * as repository from './client.repository.js';

const CLIENT_NOT_FOUND = 'Müşteri bulunamadı.';

const nameTaken = () =>
  conflict('CLIENT_NAME_TAKEN', 'Bu isimde bir müşteri zaten var.', [
    { field: 'name', message: 'Bu isimde bir müşteri zaten var.' },
  ]);

const hasContents = (count: number) =>
  conflict('CLIENT_HAS_CONTENTS', `Bu müşteriye bağlı ${count} içerik var. Önce içerikleri silmelisiniz.`);

export function listClients(db: DB, query: ListClientsQuery) {
  return repository.list(db, query.q);
}

export async function getClient(db: DB, id: string) {
  const client = await repository.findById(db, id);
  if (!client) {
    throw notFound(CLIENT_NOT_FOUND);
  }
  return client;
}

export async function createClient(db: DB, input: CreateClientInput) {
  try {
    const created = await repository.insert(db, input);
    return getClient(db, created.id);
  } catch (error) {
    if (isUniqueViolation(error, 'clients_name_unique')) {
      throw nameTaken();
    }
    throw error;
  }
}

export async function updateClient(db: DB, id: string, input: UpdateClientInput) {
  try {
    const updated = await repository.update(db, id, input);
    if (!updated) {
      throw notFound(CLIENT_NOT_FOUND);
    }
    return getClient(db, id);
  } catch (error) {
    if (isUniqueViolation(error, 'clients_name_unique')) {
      throw nameTaken();
    }
    throw error;
  }
}

export async function deleteClient(db: DB, id: string) {
  const contentCount = await repository.countContents(db, id);
  if (contentCount > 0) {
    throw hasContents(contentCount);
  }
  try {
    const deleted = await repository.remove(db, id);
    if (!deleted) {
      throw notFound(CLIENT_NOT_FOUND);
    }
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw hasContents(await repository.countContents(db, id));
    }
    throw error;
  }
}
