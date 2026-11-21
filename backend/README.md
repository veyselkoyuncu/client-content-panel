# Client & Content Tracking Panel — API

Müşteri ve içerik takip panelinin REST API'si.

**Canlı:** https://panel-api.lazyantlab.com/api/health

**Teknolojiler:** Node.js 24, Fastify 5, TypeScript, Kysely, PostgreSQL 16, Zod, Vitest, Docker

## Lokalde çalıştırma

Yalnızca Docker gerekir.

```bash
cp .env.example .env
docker compose up -d --build
docker compose run --rm migrate node dist/db/seed.js
curl http://127.0.0.1:3002/api/health
```

Demo kullanıcı: `demo@panel.local` / `change-me-please`

Kod değişikliklerinde otomatik yeniden başlatma ile geliştirmek için yalnızca veritabanını başlatıp API'yi Node.js 22+ ile çalıştırın:

```bash
docker compose up -d db
npm install
npm run db:migrate
npm run db:seed
npm run dev   # http://localhost:4000
```

## Testler

API testleri uygulamayı gerçek haliyle (`fastify.inject`) çalıştırır ve her seferinde sıfırdan oluşturulup migrate edilen ayrı bir PostgreSQL veritabanı kullanır. Compose veritabanı çalışırken:

```bash
npm test
```

Kapsam: kimlik doğrulama, müşteri ve içerik CRUD işlemleri, müşteri–içerik ilişkisi, validasyon hataları, filtreler, gecikme kuralı ve dashboard sayıları. Test veritabanı `TEST_DATABASE_URL` ile değiştirilebilir.

## Mimari

```
src/
  config/        ortam değişkenlerinin doğrulanması (geçersiz ayarla uygulama başlamaz)
  db/            bağlantı, tablo tipleri, migration'lar, seed
  modules/       auth, clients, contents, dashboard, health
                 routes (HTTP) → service (iş kuralları) → repository (sorgular)
  shared/        hata tipleri, merkezi hata yakalayıcı, validasyon yardımcıları
```

- Her istek Zod ile doğrulanır. Veritabanı aynı kuralları `NOT NULL`, `CHECK`, foreign key ve unique index'lerle ayrıca korur.
- Tek bir hata formatı: `{ "error": { "code", "message", "details": [{ "field", "message" }] } }`.
- Müşteri ve durum bazlı içerik sayıları uygulama kodunda değil, SQL'de hesaplanır.
- Arama, sıralama ve müşteri adı benzersizliği Türkçe büyük/küçük harf kurallarına göre çalışır (ICU `tr` collation).
- "Gecikti" bilgisi veritabanında, Europe/Istanbul saatine göre hesaplanır.

## Veri modeli

| Tablo | Amaç |
|---|---|
| `users` | Panele giriş yapan hesap yöneticileri |
| `sessions` | Aktif oturumlar; cookie token'ının yalnızca SHA-256 hash'i saklanır |
| `clients` | Ajansın çalıştığı markalar |
| `contents` | İçerikler; her biri tek bir müşteriye bağlıdır (`ON DELETE RESTRICT`) |

İçerik `type`: `social_post`, `blog_post`, `web_page`, `other`
İçerik `status`: `draft`, `in_review`, `published`

## Endpoint'ler

Health ve login dışındaki tüm endpoint'ler oturum cookie'si gerektirir.

| Metot | Adres | Açıklama |
|---|---|---|
| GET | `/api/health` | Servis ve veritabanı durumu |
| POST | `/api/auth/login` | Giriş, oturum cookie'sini oluşturur |
| POST | `/api/auth/logout` | Çıkış |
| GET | `/api/auth/me` | Oturumdaki kullanıcı |
| GET | `/api/clients?q=` | Durum bazlı içerik sayılarıyla müşteriler |
| POST | `/api/clients` | Müşteri oluşturma |
| GET | `/api/clients/:id` | İçerik sayılarıyla müşteri detayı |
| PATCH | `/api/clients/:id` | Müşteri güncelleme |
| DELETE | `/api/clients/:id` | İçeriği olmayan müşteriyi silme |
| GET | `/api/contents?status=&clientId=&type=&q=&sort=&page=&pageSize=` | Müşteri bilgisiyle içerikler; `meta.total` filtrelenmiş toplamı, `meta.statusCounts` diğer filtrelere göre durum sayılarını verir. `page` verilirse sonuç sayfalanır (`pageSize` varsayılan 20, en fazla 100) |
| POST | `/api/contents` | İçerik oluşturma (durum verilmezse `draft`) |
| GET | `/api/contents/:id` | İçerik detayı |
| PATCH | `/api/contents/:id` | İçerik güncelleme |
| PATCH | `/api/contents/:id/status` | Yalnızca durum güncelleme |
| DELETE | `/api/contents/:id` | İçerik silme |
| GET | `/api/dashboard/summary` | Toplamlar, durum sayıları, geciken içerik sayısı, her durumdaki son içerikler, ilgilenilmesi gereken içerikler |

`sort` değerleri: `-updatedAt` (varsayılan), `dueDate`, `-createdAt`, `title`.

## Ortam değişkenleri

Bkz. [`.env.example`](.env.example). `DATABASE_URL`, `PORT` ve `CORS_ORIGIN` API tarafından; `POSTGRES_*`, `DB_PORT` ve `API_PORT` Docker Compose tarafından; `SEED_*` seed script'i tarafından kullanılır.
