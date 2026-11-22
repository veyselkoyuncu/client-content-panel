# antflow — Web

Müşteri ve içerik takip panelinin web uygulaması. Projenin genel anlatımı ve kararların gerekçeleri için [kök README](../README.md).

**Canlı:** https://client-content-panel-frontend.vercel.app

**Teknolojiler:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, TanStack Query 5, dnd-kit, lucide-react

## Lokalde çalıştırma

API'nin çalışıyor olması gerekir (bkz. [backend/README.md](../backend/README.md)).

```bash
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3000
```

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` / `npm start` | Production derlemesi ve çalıştırma |
| `npm run lint` | ESLint (Next.js ve React Hooks kuralları) |
| `npx tsc --noEmit` | Tip kontrolü |

## Ortam değişkenleri

| Değişken | Açıklama |
|---|---|
| `API_URL` | API'nin adresi. Yalnızca sunucu tarafında, `/api` yönlendirmesi için kullanılır; tarayıcıya gönderilmez |
| `NEXT_PUBLIC_DEMO_EMAIL`, `NEXT_PUBLIC_DEMO_PASSWORD` | İsteğe bağlı. Tanımlıysa giriş ekranında demo hesabın bilgilerini dolduran kısayol görünür |

## Yapı

```
src/
  app/                   yalnızca route'lar: login, (panel) layout ve sayfaları, hata ve 404 sayfaları
  components/ui/         tasarım sistemi parçaları: button, field, panel, drawer/dialog, menu, toast, rozetler, durumlar
  components/layout/     uygulama kabuğu: kenar menü, mobil üst bar, footer, sayfa başlığı, logo
  features/<alan>/       alan bazlı API hook'ları ve ekran bileşenleri:
                         auth, dashboard, contents, clients, activity, help
  lib/                   API istemcisi, etiketler, durum geçişleri, biçimlendirme, URL state
  proxy.ts               oturum cookie'si yoksa /login'e yönlendirir
```

Sayfa dosyaları (`app/`) ince tutulur; ekranın kendisi ilgili `features/` klasöründedir. Bir alana özel bileşen o alanın klasöründe kalır, ortak olanlar `components/ui`'a taşınır.

## Sayfalar

| Adres | Ekran |
|---|---|
| `/login` | Giriş; sol tarafta ürünün akışını anlatan animasyonlu önizleme |
| `/` | Özet: durum akışı, ilgilenilmesi gerekenler (geciken ve iki gün içinde teslim), müşteri dağılımı |
| `/contents` | İçerik panosu ve liste görünümü; filtreler, arama, sürükle-bırak, oluşturma/düzenleme paneli |
| `/clients`, `/clients/:id` | Müşteri listesi ve müşterinin içerikleri |
| `/activity` | Tüm durum değişiklikleri, gün gün; başlık araması, müşteri ve durum filtresi |
| `/help` | Kısa kullanım rehberi |

## API erişimi ve oturum

- Tarayıcı yalnızca aynı origin'deki `/api/*` adresine istek atar; `next.config.ts` bunu `API_URL`'e yönlendirir. Böylece oturum cookie'si first-party olur, tarayıcıda CORS ya da üçüncü taraf cookie sorunu çıkmaz ve API adresi istemci koduna girmez.
- `proxy.ts` oturum cookie'si olmayan istekleri `/login`'e yönlendirir. Oturumun geçerliliğini API belirler: herhangi bir istekte `401` dönerse kullanıcı girişe gönderilir.
- Bütün istekler `lib/api.ts` üzerinden geçer. Hatalar `ApiError` (`status`, `code`, `message`, alan bazlı `details`) olarak fırlatılır; formlar API'nin alan hatalarını ilgili alanın altında gösterir.

## Veri ve durum yönetimi

- **Sunucu verisi** TanStack Query'de tutulur. Her alanın `keys` nesnesi sorgu anahtarlarını üretir; bir değişiklikten sonra o veriyi gösteren bütün sorgular (içerikler, müşteriler, özet, hareketler) geçersiz kılınır.
- **İyimser güncelleme:** Durum değişikliği (menüden ya da sürükle-bırakla) arayüze hemen yansır; API hata dönerse önceki hal geri yüklenir ve hata mesajı gösterilir.
- **URL state:** Filtreler, arama, görünüm (pano/liste), sayfa ve açık olan panel (`?edit=…`, `?new=1`) adres çubuğunda tutulur. Görünüm paylaşılabilir, yenilemede ve geri tuşunda korunur.
- **Yerel tercih:** Kenar menünün daraltılmış olması gibi kişisel tercihler `localStorage`'da tutulur.

## Durum akışı arayüzde

Kurallar API'de uygulanır; arayüz yalnızca izin verilen seçenekleri sunar (`lib/transitions.ts`):

- Yeni içerik yalnızca Taslak ya da Onayda olarak oluşturulabilir.
- Menüler ve form yalnızca geçerli hedef durumları gösterir.
- Panoda sürüklerken yalnızca izin verilen sütunlar bırakmayı kabul eder ve vurgulanır; diğerleri soluklaşır. Yayındaki kartlar sürüklenemez.
- Yayındaki içerik salt okunur açılır; tek eylem "Yayından kaldır"dır.
- İçerik panelinin altında içeriğin durum geçmişi görünür.

## Tasarım sistemi

- Renkler, köşe yarıçapları ve yazı tipi `app/globals.css` içinde `@theme` altında token olarak tanımlıdır; bileşenler ham renk değeri kullanmaz.
- Durum renkleri: Taslak nötr, Onayda kehribar, Yayında yeşil. Durum hiçbir yerde yalnızca renkle anlatılmaz; etiket her zaman görünür.
- İçerik türleri renkli rozetlerle (sosyal medya, blog, web sayfası, diğer) ayrılır.
- Her veri görünümünün yükleniyor (iskelet), boş ve hata (tekrar dene) hali vardır. İşlemlerin sonucu türüne göre renklenen bildirimlerle gösterilir.

## Erişilebilirlik ve responsive

- Paneller ve diyaloglarda odak tuzağı, kapanınca odağın açan öğeye dönmesi, Escape ile kapatma.
- Menülerde ok tuşlarıyla gezinme.
- Panoda klavyeyle taşıma: tutamaçta Boşluk ile al, ←/→ ile sütun değiştir, Boşluk ile bırak, Esc ile vazgeç. Ekran okuyucuya Türkçe bilgi verilir.
- `prefers-reduced-motion` açıkken animasyonlar kapanır.
- 375px'ten 1440px'e kadar yatay kaydırma olmadan çalışır. Mobilde kenar menü açılır panele, pano sütunları sekmelere, tablolar kartlara dönüşür.

## Yayın

Vercel, kök dizin `frontend/`. `main` dalı otomatik yayınlanır; her pull request için önizleme ortamı oluşur. Ortam değişkenleri: `API_URL=https://panel-api.lazyantlab.com`, isteğe bağlı olarak demo hesap değişkenleri.
