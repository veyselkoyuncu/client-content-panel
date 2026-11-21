import { type Kysely, sql } from 'kysely';

const STATUS_CHECK = (column: string) => sql`${sql.ref(column)} IN ('draft', 'in_review', 'published')`;

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('content_status_events')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('content_id', 'uuid', (col) => col.notNull().references('contents.id').onDelete('cascade'))
    .addColumn('from_status', 'varchar(20)', (col) => col.check(STATUS_CHECK('from_status')))
    .addColumn('to_status', 'varchar(20)', (col) => col.notNull().check(STATUS_CHECK('to_status')))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('set null'))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('content_status_events_content_idx')
    .on('content_status_events')
    .columns(['content_id', 'created_at'])
    .execute();
  await db.schema.createIndex('content_status_events_created_idx').on('content_status_events').column('created_at').execute();

  await sql`
    INSERT INTO content_status_events (content_id, from_status, to_status, created_at)
    SELECT id, NULL, 'draft', created_at FROM contents
    UNION ALL
    SELECT id, 'draft', 'in_review', created_at + (updated_at - created_at) / 2 FROM contents WHERE status IN ('in_review', 'published')
    UNION ALL
    SELECT id, 'in_review', 'published', updated_at FROM contents WHERE status = 'published'
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('content_status_events').execute();
}
