import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import type { ContentStatus, ContentType } from '../modules/contents/content.constants.js';

type CreatedAt = ColumnType<Date, Date | undefined, never>;
type UpdatedAt = ColumnType<Date, Date | undefined, never>;

export interface UsersTable {
  id: Generated<string>;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
}

export interface SessionsTable {
  id: Generated<string>;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: CreatedAt;
}

export interface ClientsTable {
  id: Generated<string>;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  notes: string | null;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
}

export interface ContentsTable {
  id: Generated<string>;
  clientId: string;
  title: string;
  type: ContentType;
  status: ColumnType<ContentStatus, ContentStatus | undefined, ContentStatus>;
  body: string | null;
  link: string | null;
  dueDate: string | null;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
}

export interface Database {
  users: UsersTable;
  sessions: SessionsTable;
  clients: ClientsTable;
  contents: ContentsTable;
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;

export type Client = Selectable<ClientsTable>;
export type NewClient = Insertable<ClientsTable>;
export type ClientUpdate = Updateable<ClientsTable>;

export type Content = Selectable<ContentsTable>;
export type NewContent = Insertable<ContentsTable>;
export type ContentUpdate = Updateable<ContentsTable>;
