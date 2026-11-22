# antflow — API

Müşteri ve içerik takip panelinin REST API'si. Projenin genel anlatımı ve kararların gerekçeleri için [kök README](../README.md).

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

`docker compose up` önce veritabanını, sonra migration'ları çalıştıran tek seferlik `migrate` servisini, en son API'yi başlatır. Seed örnek müşteri, içerik ve durum geçmişi oluşturur; tarihler seed'in çalıştığı güne göre hesaplanır, böylece "gecikti" ve "yaklaşan" örnekleri her zaman anlamlı kalır.

Demo kullanıcı: `demo@panel.local` / `change-me-please`

Kod değişikliklerinde otomatik yeniden başlatma ile geliştirmek için yalnızca veritabanını başlatıp API'yi Node.js 22+ ile çalıştırın:

```bash
docker compose up -d db
npm install
npm run db:migrate
npm run db:seed
npm run dev   # http://localhost:4000
```

| Komut | Açıklama |
|---|---|
| `npm run dev` | `tsx watch` ile geliştirme sunucusu |
| `npm run build` / `npm start` | `dist/` derlemesi ve çalıştırma |
| `npm run typecheck` | Tip kontrolü |
| `npm test` | API testleri |
| `npm run db:migrate` / `npm run db:seed` | Migration ve örnek veri |

## Mimari

```
src/
  config/        ortam değişkenlerinin doğrulanması (geçersiz ayarla uygulama başlamaz)
  db/            bağlantı, tablo tipleri, migration'lar, seed
  modules/       auth, clients, contents, history, dashboard, health
                 routes (HTTP) → service (iş kuralları) → repository (sorgular)
  shared/        hata tipleri, merkezi hata yakalayıcı, validasyon ve SQL yardımcıları
```

- **Katmanlar:** Route yalnızca isteği doğrular ve servisi çağırır. İş kuralları (durum geçişleri, kilit, ilişki kontrolleri) serviste, SQL repository'de durur. Servisler `db` ya da transaction nesnesini parametre olarak alır, bu yüzden aynı fonksiyon transaction içinde de dışında da çalışır.
- **Validasyon:** Her istek Zod ile doğrulanır. Veritabanı aynı kuralları `NOT NULL`, `CHECK`, foreign key ve unique index'lerle ayrıca korur; bir kontrol uygulamada atlansa bile veri bozulmaz.
- **Hatalar:** Tek bir format kullanılır: `{ "error": { "code", "message", "details": [{ "field", "message" }] } }`. Zod hataları, PostgreSQL kısıt ihlalleri (unique, foreign key) ve uygulama hataları merkezi hata yakalayıcıda bu biçime çevrilir. Mesajlar Türkçedir ve doğrudan arayüzde gösterilebilir; `details` alan bazlı hataları forma taşır.
- **Sorgular:** Kysely ile tip güvenli SQL. Kolon adları veritabanında `snake_case`, kodda `camelCase` (CamelCasePlugin). Sayılar ve özetler uygulama kodunda değil SQL'de hesaplanır.
- **Türkçe metin:** Arama, sıralama ve müşteri adı benzersizliği ICU `tr-x-icu` collation ile çalışır: "GIDA" ve "Gıda" aynı ad sayılır, "istanbul ışık" araması "İstanbul Işık Festivali"ni bulur. Aramada `%` ve `_` karakterleri düz metin olarak aranır.
- **Tarih:** "Gecikti" bilgisi (`isOverdue`) veritabanında, Europe/Istanbul gününe göre hesaplanır; sunucunun saat dilimi sonucu değiştirmez.

## Kimlik doğrulama

- Şifreler `scrypt` ile, rastgele salt kullanılarak saklanır; karşılaştırma `timingSafeEqual` ile yapılır.
- Girişte rastgele bir oturum anahtarı üretilir. Cookie'ye anahtarın kendisi, `sessions` tablosuna yalnızca SHA-256 hash'i yazılır; veritabanı sızsa bile oturum ele geçirilemez.
- Cookie `httpOnly`, `sameSite=lax`, production'da `secure`. Oturum süresi 7 gün; çıkışta kayıt silinir.
- JWT yerine sunucu taraflı oturum tercih edildi: oturum anında iptal edilebilir ve tek API için ek karmaşıklık getirmez.

## Veri modeli

| Tablo | Amaç |
|---|---|
| `users` | Panele giriş yapan hesap yöneticileri |
| `sessions` | Aktif oturumlar; cookie token'ının yalnızca SHA-256 hash'i saklanır |
| `clients` | Ajansın çalıştığı markalar; ad Türkçe kurallara göre benzersiz |
| `contents` | İçerikler; her biri tek bir müşteriye bağlıdır (`ON DELETE RESTRICT`). İsteğe bağlı teslim tarihi ve bağlantı (`link`, yalnızca http/https) içerir |
| `content_status_events` | Her durum değişikliği: önceki ve yeni durum, değiştiren kullanıcı, zaman |

İçerik `type`: `social_post`, `blog_post`, `web_page`, `other`
İçerik `status`: `draft`, `in_review`, `published`

İçeriği olan bir müşteri silinemez (`409`); içerikler sessizce kaybolmaz.

Migration'lar `src/db/migrations` altında sıralıdır ve `docker compose up` sırasında otomatik çalışır:

| Migration | İçerik |
|---|---|
| `001_initial_schema` | Kullanıcı, oturum, müşteri ve içerik tabloları, kısıtlar, index'ler |
| `002_content_link` | İçeriğe isteğe bağlı bağlantı alanı |
| `003_content_status_events` | Durum geçmişi tablosu; mevcut içerikler için geçmiş kayıtları geriye dönük üretilir |

### Durum akışı

- Yeni içerik `draft` ya da `in_review` olarak başlar; onaysız yayına çıkılamaz.
- İzin verilen geçişler: `draft → in_review`, `in_review → draft | published`.
- Yayındaki içerik kilitlidir: düzenlenemez, silinemez, durumu değiştirilemez. Tek çıkış yolu `unpublish` ile taslağa dönmektir.
- Geçersiz geçişler `409 INVALID_TRANSITION`, kilitli içeriğe yazma `409 CONTENT_LOCKED` döner.
- Durum değişikliği ve geçmiş kaydı aynı transaction içinde yazılır; satır kilidi (`SELECT … FOR UPDATE`) eşzamanlı güncellemelerde tutarlılığı korur.

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
| PATCH | `/api/contents/:id/status` | Yalnızca durum güncelleme (izin verilen geçişler) |
| POST | `/api/contents/:id/unpublish` | Yayındaki içeriği taslağa geri alma |
| DELETE | `/api/contents/:id` | İçerik silme |
| GET | `/api/contents/:id/history` | İçeriğin durum geçmişi (en yeni önce) |
| GET | `/api/activity?clientId=&status=&q=&page=&pageSize=` | Tüm durum değişiklikleri, başlıkta arama, sayfalı |
| GET | `/api/dashboard/summary` | Toplamlar, durum sayıları, geciken içerik sayısı, her durumdaki son içerikler, ilgilenilmesi gereken içerikler |

`sort` değerleri: `-updatedAt` (varsayılan), `dueDate`, `-createdAt`, `title`.

Örnek hata:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Gönderilen bilgiler geçersiz.",
    "details": [{ "field": "title", "message": "Başlık zorunludur." }]
  }
}
```

## Testler

Testler uygulamayı gerçek haliyle (`fastify.inject`) ve gerçek bir PostgreSQL ile çalıştırır; veritabanı mock'lanmaz. Her çalıştırmada `panel_test` veritabanı sıfırdan oluşturulup migrate edilir. Compose veritabanı çalışırken:

```bash
npm test
```

5 dosyada 33 test:

| Dosya | Kapsam |
|---|---|
| `auth.test.ts` | Oturumsuz erişimin reddi, hatalı girişte genel hata mesajı, `httpOnly` cookie, çıkışta oturumun geçersizleşmesi |
| `clients.test.ts` | Müşteri CRUD, alan hataları, Türkçe kurallarla benzersiz ad ve sıralama, içeriği olan müşterinin silinememesi |
| `contents.test.ts` | İçerik CRUD, müşteri ilişkisi, validasyon hataları, filtreler, arama, sıralama, sayfalama, gecikme kuralı |
| `dashboard.test.ts` | Özet sayıları ve ilgilenilmesi gereken içerikler |
| `status-workflow.test.ts` | İzin verilen ve reddedilen geçişler, yayındaki içeriğin kilidi, yayından kaldırma, geçmiş kayıtları, hareketlerde Türkçe arama |

Test veritabanı `TEST_DATABASE_URL` ile değiştirilebilir. CI'da aynı testler bir PostgreSQL servisiyle her pull request'te çalışır.

## Ortam değişkenleri

Bkz. [`.env.example`](.env.example).

| Değişken | Kullanan | Açıklama |
|---|---|---|
| `DATABASE_URL`, `HOST`, `PORT` | API | Bağlantı ve dinlenen adres |
| `CORS_ORIGIN` | API | Tarayıcıdan doğrudan erişime izin verilen origin. Web uygulaması istekleri aynı origin üzerinden proxy'lediği için normal kullanımda devreye girmez |
| `POSTGRES_*`, `DB_PORT`, `API_PORT` | Docker Compose | Veritabanı ve dışarı açılan portlar (yalnızca `127.0.0.1`) |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Seed | Demo kullanıcı |

## Yayın

Linux VM üzerinde Docker Compose, önünde Caddy (otomatik HTTPS). API ve veritabanı portları yalnızca loopback'e bağlıdır; dışarıya yalnızca Caddy açıktır.

```bash
git pull --ff-only
docker compose up -d --build   # migration'lar API'den önce otomatik çalışır
```
