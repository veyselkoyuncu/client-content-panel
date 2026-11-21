import type { Migration } from 'kysely/migration';
import * as initialSchema from './001_initial_schema.js';
import * as addContentLink from './002_add_content_link.js';
import * as contentStatusEvents from './003_content_status_events.js';

export const migrations: Record<string, Migration> = {
  '001_initial_schema': initialSchema,
  '002_add_content_link': addContentLink,
  '003_content_status_events': contentStatusEvents,
};
