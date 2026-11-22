# antflow — Müşteri ve İçerik Takip Paneli

Ajans hesap yöneticileri için bir takip paneli. Müşteriler kaydedilir; sosyal medya gönderisi, blog yazısı, web sayfası gibi içerikler bir müşteriye bağlı olarak tutulur ve **Taslak → Onayda → Yayında** akışında ilerletilir. Ana ekran, o gün neyle ilgilenmek gerektiğini özetler.

| | |
|---|---|
| **Canlı panel** | https://client-content-panel-frontend.vercel.app |
| **API** | https://panel-api.lazyantlab.com/api/health |
| **Demo giriş** | `demo@panel.local` / `demo2026` (giriş ekranındaki "Bilgileri doldur" ile de doldurulabilir) |

Bu belge projeyi ve verdiğim kararları anlatır. Kurulum ve teknik ayrıntılar her uygulamanın kendi README'sindedir: [backend/README.md](backend/README.md), [frontend/README.md](frontend/README.md).

---

## Kapsam ve yorumum

İstenen MVP: müşteri ekleme ve listeleme; müşteriye bağlı içerik ekleme ve düzenleme; içerik durumunu güncelleme ve duruma göre filtreleme; genel durumu gösteren bir ana ekran.

Bu isteği şöyle yorumladım: panelin asıl işi bir hesap yöneticisinin sabah açıp "bugün neyle ilgilenmeliyim?" sorusunu hızlıca cevaplaması. Bu yüzden önceliği CRUD ekranlarının sayısına değil, şu üç şeye verdim:

1. **Durum akışının güvenilir olması.** Durum yalnızca bir etiket değil, bir onay süreci. İçerik onaydan geçmeden yayına çıkmamalı, yayındaki içerik fark edilmeden değişmemeli ve kimin neyi ne zaman değiştirdiği izlenebilmeli.
2. **Ana ekranın karar verdirmesi.** Özet ekranı sayıların yanında geciken ve iki gün içinde teslim edilecek içerikleri öne çıkarır.
3. **Günlük kullanımın akıcı olması.** Pano ve liste görünümü, sürükle-bırak, arama ve filtreler, paylaşılabilir adresler, mobil kullanım.

Bilinçli olarak dışarıda bıraktıklarım: kayıt ekranı ve rol/yetki yönetimi (demo için tek tip hesap yöneticisi yeterli), bildirimler, dosya ekleri ve içerik metninin kendisi. Panel içeriğin *takibini* yapar; içerik başka araçlarda üretilir, panelde bağlantısı (`link`) tutulur.

## Neler var

- **Özet:** durum bazlı sayılar, geciken ve yaklaşan teslimler, müşteri dağılımı, her durumdaki son içerikler.
- **İçerik panosu:** üç sütunlu pano ya da sayfalı liste; müşteri, tür ve durum filtreleri, başlıkta arama, sıralama. Kartlar sütunlar arasında fareyle ya da klavyeyle taşınabilir.
- **İçerik paneli:** oluşturma ve düzenleme aynı yan panelde; teslim tarihi, bağlantı, durum. Yayındaki içerik salt okunur açılır, altında içeriğin durum geçmişi görünür.
- **Müşteriler:** liste, arama, müşteri detayında o müşterinin içerikleri ve durum dağılımı.
- **Hareketler:** bütün durum değişiklikleri gün gün; içerik başlığıyla arama, müşteriye ve yeni duruma göre filtre.
- **Nasıl kullanılır?:** panelin içinde tek ekranlık kısa rehber.

## Mimari

```
Tarayıcı ──► Next.js (Vercel) ──/api/* rewrite──► Fastify API (VM, Docker) ──► PostgreSQL
            aynı origin, httpOnly cookie          Caddy + HTTPS               yalnızca loopback
```

Repo tek, uygulamalar iki ve birbirinden bağımsız. `backend/` ve `frontend/` kendi bağımlılıklarına, ortam değişkenlerine, dokümantasyonuna ve yayın ortamına sahip; ortak kod paylaşmazlar, yalnızca HTTP sözleşmesiyle konuşurlar. Tek repo tercihi değerlendirmeyi kolaylaştırmak için: tek bağlantı, tek geçmiş, tek CI.

**Tarayıcı API'ye doğrudan gitmez.** Web uygulaması `/api/*` isteklerini sunucu tarafında API'ye yönlendirir. Böylece:

- oturum cookie'si first-party olur; tarayıcıların üçüncü taraf cookie kısıtlamalarından etkilenmez,
- tarayıcıda CORS gerekmez, API adresi istemci koduna girmez,
- cookie `httpOnly` kalır, JavaScript oturum anahtarına erişemez.

## Teknik seçimler

| Alan | Seçim | Neden |
|---|---|---|
| API | **Fastify** + TypeScript | Hafif, hızlı, eklenti yapısı net. Bu boyutta bir API için NestJS'in getirdiği katmanlar gereksiz ağırlık olurdu; katman ayrımını (route → service → repository) kendim kurdum. |
| Veri erişimi | **Kysely** | Tip güvenli SQL. ORM'in gizlediği sorguları görmek istedim: sayımlar, `FOR UPDATE` kilitleri, ICU collation ve tarih hesapları doğrudan SQL'de ve tipli. |
| Veritabanı | **PostgreSQL 16** | İlişkisel veri, kısıtlar, transaction ve Türkçe collation desteği. |
| Validasyon | **Zod** | İstek şeması ve TypeScript tipi tek kaynaktan; hata mesajları Türkçe. |
| Kimlik doğrulama | Sunucu taraflı oturum | JWT yerine veritabanında tutulan opak oturum anahtarı: çıkışta anında iptal edilir, tek bir API için ek karmaşıklık getirmez. Veritabanında anahtarın yalnızca SHA-256 hash'i, şifrelerin `scrypt` hash'i saklanır. |
| Web | **Next.js 16** (App Router) + React 19 | Route yapısı, `/api` yönlendirmesi ve oturumsuz istekleri yönlendiren `proxy.ts` tek çatı altında. |
| Sunucu verisi | **TanStack Query** | Önbellek, geçersiz kılma ve iyimser güncelleme; durum değişiklikleri arayüze anında yansır, hata olursa geri alınır. |
| Stil | **Tailwind CSS 4** | Tasarım token'ları (`@theme`) tek yerde, bileşenler bu token'ları kullanır. |
| Sürükle-bırak | **dnd-kit** | Klavye ve ekran okuyucu desteği hazır; yalnızca izin verilen sütunlara bırakma kuralını eklemek kolay. |

## Önemli kararlar

**Durum akışı API'de uygulanır.** Geçişler sınırlı: `draft → in_review`, `in_review → draft | published`. Yeni içerik doğrudan yayında başlayamaz. Yayındaki içerik kilitlidir: düzenlenemez, silinemez, tek çıkış yolu "Yayından kaldır" ile taslağa dönmektir. Kural arayüzde de yansıtılır (menüler, form ve pano yalnızca izin verilen hedefleri sunar) ama asıl koruma API'dedir; arayüzü atlayan bir istek `409 INVALID_TRANSITION` ya da `409 CONTENT_LOCKED` alır.

**Geçmiş, değişiklikle aynı transaction'da yazılır.** Her oluşturma ve durum değişikliği `content_status_events` tablosuna, yapan kullanıcıyla birlikte kaydedilir. Satır `SELECT … FOR UPDATE` ile kilitlenir; aynı anda gelen iki güncelleme geçmişi ya da kuralları bozamaz. Geçmiş tablosu sonradan eklendiği için migration mevcut içeriklere geriye dönük kayıt da üretir.

**Veritabanı ikinci savunma hattı.** Zod ile doğrulanan her kural veritabanında da var: `NOT NULL`, `CHECK`, foreign key ve unique index'ler. İçeriği olan müşteri silinemez (`ON DELETE RESTRICT`); içerikler sessizce kaybolmaz.

**Türkçe metin doğru çalışır.** Arama, sıralama ve müşteri adı benzersizliği ICU `tr-x-icu` collation ile yapılır: "GIDA" ile "Gıda" aynı müşteri sayılır, "istanbul ışık" araması "İstanbul Işık Festivali"ni bulur, liste Türk alfabesine göre sıralanır. Aramada `%` ve `_` düz karakter olarak aranır.

**Gecikme veritabanında, İstanbul gününe göre hesaplanır.** "Gecikti" bilgisi sorguda üretilir; sunucunun saat dilimi ya da istemcinin saati sonucu değiştirmez. Özet ekranındaki sayılar da uygulama kodunda değil, SQL'de toplanır.

**Tek hata biçimi.** Her hata `{ error: { code, message, details } }` biçiminde döner. Mesajlar Türkçe ve kullanıcıya gösterilebilir; `details` alan bazlı hataları taşır, form bunları ilgili alanın altında gösterir.

**Filtreler URL'de.** Arama, filtreler, görünüm, sayfa ve açık olan panel adres çubuğunda tutulur. Bir görünüm bağlantıyla paylaşılabilir; yenilemede ve geri tuşunda kaybolmaz.

**Erişilebilirlik ve mobil baştan düşünüldü.** Panellerde odak tuzağı, menülerde ok tuşları, panoda klavyeyle taşıma ve Türkçe ekran okuyucu duyuruları, `prefers-reduced-motion` desteği. Durum hiçbir yerde yalnızca renkle anlatılmaz. 375px genişlikte pano sekmelere, tablolar kartlara dönüşür.

## Kalite ve çalışma şekli

**Testler gerçek veritabanıyla çalışır.** Backend'de 33 API testi uygulamayı `fastify.inject` ile çalıştırır ve her seferinde sıfırdan oluşturulan bir PostgreSQL veritabanı kullanır; veritabanı mock'lanmaz. Ağırlık iş kurallarında: durum geçişleri ve kilit, geçmiş kayıtları, müşteri–içerik ilişkisi, Türkçe arama ve benzersizlik, gecikme kuralı, özet sayıları, validasyon hataları. Ayrıntı: [backend/README.md](backend/README.md#testler).

**CI.** Her pull request'te GitHub Actions backend için tip kontrolü ve testleri (PostgreSQL servisiyle), frontend için lint ve production derlemesini çalıştırır. Vercel her pull request için bir önizleme ortamı kurar.

**Her değişiklik ayrı branch ve pull request.** `main` yalnızca PR ile değişti. Geçmiş, projenin nasıl büyüdüğünü adım adım gösterir: önce iskelet ve API, sonra ekranlar, ardından kullanırken ortaya çıkan iyileştirmeler (pano/liste, durum akışı ve geçmiş, sürükle-bırak). Her PR'ın açıklamasında ne değiştiği ve nasıl doğrulandığı yazar.

**Yapay zekâ ile çalışma.** Geliştirmede Claude Code'u eşli programlama aracı olarak kullandım; commit'lerde ortak yazar olarak görünür. Kapsam, mimari, ürün ve tasarım kararları, kabul kriterleri bende; her değişikliği lokalde test edip onayladıktan sonra commit ve PR'a geçtim. Her uygulamadaki `CLAUDE.md` ve `TASKS.md` dosyaları bu çalışmanın kurallarını ve iş listesini tutar; yeni bir geliştirici için de proje kuralları özeti olarak okunabilir.

## Yayın

| | Nerede | Nasıl |
|---|---|---|
| Web | Vercel | `main` otomatik yayınlanır, PR'lar için önizleme |
| API ve veritabanı | Kendi Linux VM'im | Docker Compose; önünde Caddy ve otomatik HTTPS. Migration'lar API'den önce ayrı bir servis olarak otomatik çalışır |

API ve veritabanı portları yalnızca loopback'e bağlıdır; dışarıya yalnızca Caddy açıktır. Yönetilen bir veritabanı yerine kendi sunucumu seçtim: maliyet ve kontrol açısından bu ölçek için yeterli, kurulumu da tek komutla tekrarlanabilir.

## Lokalde çalıştırma

Docker ve Node.js 22+ gerekir.

```bash
# API ve veritabanı (127.0.0.1:3002)
cd backend
cp .env.example .env
docker compose up -d --build
docker compose run --rm migrate node dist/db/seed.js

# Web (http://localhost:3000)
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
```

Lokal demo giriş: `demo@panel.local` / `change-me-please`

## Sonraki adımlar

**Beklemede ve İptal durumları.** Gerçek ajans akışında müşteriden dönüş beklenen ya da vazgeçilen işler olur. Bunları panoya dördüncü ve beşinci sütun olarak eklemek ana akışı kalabalıklaştırır. Tasarladığım çözüm: pano sütunlarının üstünde sayılarıyla iki çip, tıklandığında açılan katlanabilir bir şerit. Geçişler: Taslak ve Onayda'dan Beklemede'ye ve geri; her durumdan İptal'e, İptal'den Taslak'a. Veri modeli buna hazır (durum `CHECK` kısıtı ve geçiş tablosu genişletilir, geçmiş kaydı aynen çalışır). İstenen kapsamı şişirmemek için bu sürüme eklemedim.

Diğerleri:

- **Roller ve yetki:** onaya gönderen ile yayınlayan farklı kişiler olabilir; `in_review → published` geçişi yalnızca onay yetkisi olanlara açılabilir.
- **Atama ve bildirim:** içeriğe sorumlu kişi atama, teslim tarihi yaklaşınca e-posta ya da uygulama içi bildirim.
- **Takvim görünümü:** teslim tarihlerine göre aylık görünüm.
- **Yorumlar:** onay sürecinde içerik üzerinde not ve düzeltme isteği.
- **Uçtan uca testler:** kritik akışlar (giriş, içerik oluşturma, durum değiştirme) için Playwright.
