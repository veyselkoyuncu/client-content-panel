import { z } from 'zod';
import { loadEnv } from '../config/env.js';
import { hashPassword } from '../modules/auth/password.js';
import type { ContentStatus, ContentType } from '../modules/contents/content.constants.js';
import { createDatabase } from './database.js';

const seedEnv = z
  .object({
    SEED_ADMIN_EMAIL: z.email(),
    SEED_ADMIN_PASSWORD: z.string().min(8),
    SEED_ADMIN_NAME: z.string().min(2).default('Selin Aksoy'),
  })
  .parse(process.env);

const istanbulDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' });

function dayOffset(days: number): string {
  return istanbulDate.format(new Date(Date.now() + days * 24 * 60 * 60 * 1000));
}

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);

const clients = [
  { key: 'deniz', name: 'Deniz Kahve', industry: 'Yiyecek & İçecek', contactName: 'Ayşe Demir', email: 'ayse.demir@example.com', phone: '+90 532 410 22 18', website: 'https://example.com/deniz-kahve' },
  { key: 'atlas', name: 'Atlas Mobilya', industry: 'Perakende', contactName: 'Murat Kaya', email: 'murat.kaya@example.com', phone: '+90 533 287 64 05', website: 'https://example.com/atlas-mobilya' },
  { key: 'mavi', name: 'Mavi Diş Kliniği', industry: 'Sağlık', contactName: 'Dr. Elif Yıldız', email: 'elif.yildiz@example.com', phone: '+90 242 316 45 90', website: null },
  { key: 'kuzey', name: 'Kuzey Otomotiv', industry: 'Otomotiv', contactName: 'Burak Şahin', email: 'burak.sahin@example.com', phone: '+90 216 555 12 34', website: 'https://example.com/kuzey-otomotiv' },
  { key: 'lina', name: 'Lina Kozmetik', industry: 'Güzellik', contactName: 'Zeynep Arslan', email: 'zeynep.arslan@example.com', phone: null, website: 'https://example.com/lina-kozmetik' },
  { key: 'pera', name: 'Pera Hukuk', industry: 'Hukuk', contactName: 'Av. Can Öztürk', email: 'can.ozturk@example.com', phone: '+90 212 444 78 21', website: null },
  { key: 'ege', name: 'Ege Butik Otel', industry: 'Turizm', contactName: 'Deniz Aydın', email: 'deniz.aydin@example.com', phone: '+90 252 612 33 70', website: null, notes: 'Yeni anlaşma. İçerik takvimi ay sonunda paylaşılacak.' },
] as const;

type ClientKey = (typeof clients)[number]['key'];

interface SeedContent {
  client: ClientKey;
  title: string;
  type: ContentType;
  status: ContentStatus;
  due: number | null;
  updated: number;
  body?: string;
  link?: string;
}

const contents: SeedContent[] = [
  { client: 'deniz', title: 'Kış menüsü lansmanı – Carousel', type: 'social_post', status: 'in_review', due: 2, updated: 1, link: 'https://example.com/drive/kis-menusu-carousel', body: '5 görsellik carousel. Fiyatlar müşteriden onay bekliyor. Yayın saati 19.00.' },
  { client: 'deniz', title: 'Barista ile 1 dakika', type: 'social_post', status: 'in_review', due: 3, updated: 5 },
  { client: 'deniz', title: 'Filtre kahve demleme rehberi', type: 'blog_post', status: 'draft', due: 7, updated: 20 },
  { client: 'deniz', title: 'Yılbaşı hediye seti sayfası', type: 'web_page', status: 'draft', due: 11, updated: 30 },
  { client: 'deniz', title: 'Kahve çekirdeğinin hikâyesi', type: 'blog_post', status: 'published', due: -10, updated: 240, link: 'https://example.com/deniz-kahve/blog/kahve-cekirdeginin-hikayesi' },
  { client: 'deniz', title: 'Yeni şube açılışı', type: 'social_post', status: 'published', due: -12, updated: 290 },
  { client: 'atlas', title: '2027 dekorasyon trendleri', type: 'blog_post', status: 'draft', due: 8, updated: 3 },
  { client: 'atlas', title: 'Showroom açılış duyurusu', type: 'social_post', status: 'published', due: -8, updated: 190 },
  { client: 'atlas', title: 'Sezon kataloğu', type: 'web_page', status: 'published', due: -3, updated: 70, link: 'https://example.com/atlas-mobilya/katalog' },
  { client: 'atlas', title: 'Yatak odası koleksiyonu tanıtımı', type: 'social_post', status: 'in_review', due: 4, updated: 9 },
  { client: 'atlas', title: 'Kurulum hizmeti SSS sayfası', type: 'web_page', status: 'draft', due: null, updated: 50 },
  { client: 'mavi', title: 'İmplant tedavisi hizmet sayfası', type: 'web_page', status: 'published', due: -2, updated: 26, link: 'https://example.com/mavi-dis/implant' },
  { client: 'mavi', title: 'Diş beyazlatma hakkında 5 soru', type: 'blog_post', status: 'draft', due: 6, updated: 14 },
  { client: 'mavi', title: 'Çocuklarda ilk diş muayenesi', type: 'social_post', status: 'in_review', due: 1, updated: 8 },
  { client: 'mavi', title: 'Hasta yorumları videosu', type: 'other', status: 'published', due: -15, updated: 360 },
  { client: 'kuzey', title: 'Yeni model tanıtım videosu', type: 'other', status: 'in_review', due: -1, updated: 48, body: 'Müşteriden iki gündür dönüş yok. Takip edilecek.' },
  { client: 'kuzey', title: 'Test sürüşü daveti', type: 'social_post', status: 'in_review', due: 0, updated: 6 },
  { client: 'kuzey', title: 'Kış lastiği kampanyası', type: 'web_page', status: 'draft', due: 5, updated: 22 },
  { client: 'kuzey', title: 'Servis randevu sayfası yenileme', type: 'web_page', status: 'published', due: -20, updated: 480 },
  { client: 'kuzey', title: 'Elektrikli araç rehberi', type: 'blog_post', status: 'published', due: -6, updated: 150 },
  { client: 'lina', title: 'Cilt bakım rutini rehberi', type: 'blog_post', status: 'draft', due: 0, updated: 2 },
  { client: 'lina', title: 'Black Friday kampanya görseli', type: 'social_post', status: 'in_review', due: 4, updated: 4 },
  { client: 'lina', title: 'Yeni serum lansman sayfası', type: 'web_page', status: 'draft', due: 9, updated: 40 },
  { client: 'lina', title: 'Kış cilt bakımı önerileri', type: 'social_post', status: 'published', due: -4, updated: 96, link: 'https://example.com/lina-kozmetik/instagram/kis-bakimi' },
  { client: 'lina', title: 'Influencer iş birliği duyurusu', type: 'other', status: 'published', due: -9, updated: 210 },
  { client: 'pera', title: 'KVKK bilgilendirme duyurusu', type: 'social_post', status: 'published', due: -5, updated: 120 },
  { client: 'pera', title: 'Hakkımızda sayfası yenileme', type: 'web_page', status: 'draft', due: 12, updated: 60 },
  { client: 'pera', title: 'Haftalık hukuk bülteni', type: 'blog_post', status: 'published', due: -1, updated: 30, link: 'https://example.com/pera-hukuk/bulten' },
  { client: 'pera', title: 'Kira hukukunda yeni düzenlemeler', type: 'blog_post', status: 'in_review', due: 2, updated: 12 },
];

async function main() {
  const env = loadEnv();
  const db = createDatabase(env.DATABASE_URL);

  await db.transaction().execute(async (trx) => {
    await trx.deleteFrom('contents').execute();
    await trx.deleteFrom('clients').execute();
    await trx.deleteFrom('sessions').execute();
    await trx.deleteFrom('users').execute();

    await trx
      .insertInto('users')
      .values({
        email: seedEnv.SEED_ADMIN_EMAIL,
        name: seedEnv.SEED_ADMIN_NAME,
        passwordHash: await hashPassword(seedEnv.SEED_ADMIN_PASSWORD),
      })
      .execute();

    const clientIds = new Map<ClientKey, string>();
    for (const [index, { key, ...client }] of clients.entries()) {
      const created = await trx
        .insertInto('clients')
        .values({ ...client, createdAt: hoursAgo(24 * (60 - index * 7)) })
        .returning('id')
        .executeTakeFirstOrThrow();
      clientIds.set(key, created.id);
    }

    await trx
      .insertInto('contents')
      .values(
        contents.map((content) => ({
          clientId: clientIds.get(content.client)!,
          title: content.title,
          type: content.type,
          status: content.status,
          body: content.body ?? null,
          link: content.link ?? null,
          dueDate: content.due === null ? null : dayOffset(content.due),
          createdAt: hoursAgo(content.updated + 72),
          updatedAt: hoursAgo(content.updated),
        })),
      )
      .execute();
  });

  console.log(`Seeded 1 user, ${clients.length} clients, ${contents.length} contents.`);
  await db.destroy();
}

await main();
