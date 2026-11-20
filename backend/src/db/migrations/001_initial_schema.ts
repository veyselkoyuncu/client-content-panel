import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db);

  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('email', 'varchar(254)', (col) => col.notNull())
    .addColumn('name', 'varchar(120)', (col) => col.notNull())
    .addColumn('password_hash', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`CREATE UNIQUE INDEX users_email_unique ON users (lower(email))`.execute(db);

  await db.schema
    .createTable('sessions')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('token_hash', 'char(64)', (col) => col.notNull().unique())
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema.createIndex('sessions_user_id_idx').on('sessions').column('user_id').execute();

  await db.schema
    .createTable('clients')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(120)', (col) => col.notNull().check(sql`char_length(btrim(name)) >= 2`))
    .addColumn('contact_name', 'varchar(120)')
    .addColumn('email', 'varchar(254)')
    .addColumn('phone', 'varchar(30)')
    .addColumn('website', 'varchar(255)')
    .addColumn('industry', 'varchar(80)')
    .addColumn('notes', 'varchar(2000)')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`CREATE UNIQUE INDEX clients_name_unique ON clients (lower(name COLLATE "tr-x-icu"))`.execute(db);

  await db.schema
    .createTable('contents')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) =>
      col.notNull().references('clients.id').onDelete('restrict'),
    )
    .addColumn('title', 'varchar(200)', (col) => col.notNull().check(sql`char_length(btrim(title)) >= 3`))
    .addColumn('type', 'varchar(20)', (col) =>
      col.notNull().check(sql`type IN ('social_post', 'blog_post', 'web_page', 'other')`),
    )
    .addColumn('status', 'varchar(20)', (col) =>
      col
        .notNull()
        .defaultTo('draft')
        .check(sql`status IN ('draft', 'in_review', 'published')`),
    )
    .addColumn('body', 'varchar(10000)')
    .addColumn('due_date', 'date')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema.createIndex('contents_client_id_idx').on('contents').column('client_id').execute();
  await db.schema.createIndex('contents_status_idx').on('contents').column('status').execute();
  await db.schema.createIndex('contents_updated_at_idx').on('contents').column('updated_at').execute();

  for (const table of ['users', 'clients', 'contents']) {
    await sql`
      CREATE TRIGGER ${sql.raw(`${table}_set_updated_at`)}
      BEFORE UPDATE ON ${sql.table(table)}
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `.execute(db);
  }
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('contents').execute();
  await db.schema.dropTable('clients').execute();
  await db.schema.dropTable('sessions').execute();
  await db.schema.dropTable('users').execute();
  await sql`DROP FUNCTION set_updated_at()`.execute(db);
}
