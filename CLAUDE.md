# CLAUDE.md: klip-dergi-api

Klip Dergi sitesinin REST API'si. Site (frontend) ayrı bir repoda: `../klip-dergi` (Next.js). Şu an site verisini `src/data/people.json` dosyasından okuyor. Bu API'nin amacı o veriyi PostgreSQL'den sunmak.

## Ben kimim, nasıl çalışalım?

- Backend'i öğrenerek yazıyorum (stajyerim). Amaç sadece çalışan kod değil, **anlamak**.
- Benimle **Türkçe** konuş. Teknik terimin İngilizcesini parantez içinde ver: doğrulama (validation).
- **Küçük adımlarla ilerle.** Tek seferde bütün projeyi yazma. Her adımda: ne yapacağını söyle → yap → ne yaptığını ve nedenini kısaca açıkla.
- Yeni bir kavram ilk kez geçtiğinde (plugin, migration, schema, route…) 1-2 cümleyle ne olduğunu anlat.
- Kısa yaz. Uzun açıklama yerine kısa açıklama + küçük örnek.
- Bir şeyden emin değilsen ya da benim karar vermem gereken bir şey varsa (tablo yapısı, endpoint adı vb.) önce sor.
- Kodda kısa Türkçe yorumlar yaz: satırın **ne** yaptığını değil, **neden** orada olduğunu açıkla.
- **AI benim yerime karar vermemeli.** Teknik bir karar gerektiğinde önce seçenekleri, avantajlarını ve dezavantajlarını kısaca açıkla; ardından benim onayımı bekle.
- Amacımız sadece çalışan kod üretmek değil, benim kodu ve mimari kararları anlayarak öğrenmemi sağlamak. Anlamadığım kodu açıklamadan geçme.

## Teknoloji (seçildi, değiştirme)

Gerekçeler: `notlar/technology-selection.md`

| Ne                   | Seçim                                           |
| -------------------- | ----------------------------------------------- |
| Dil / çalışma ortamı | Node.js + TypeScript (strict)                   |
| Framework            | **Fastify** (Express veya NestJS önerme)        |
| Veritabanı           | PostgreSQL                                      |
| ORM                  | **Drizzle ORM** (Prisma/TypeORM önerme)         |
| Migration            | Drizzle Kit                                     |
| Doğrulama            | Zod (istek ve yanıtlar)                         |
| API belgesi          | OpenAPI                                         |
| Test                 | Vitest + Testcontainers (gerçek PostgreSQL ile) |
| CI                   | GitHub Actions                                  |

Yeni bir paket eklemeden önce sor ve neden gerektiğini açıkla.

## Kurallar

### Kod

- Her endpoint'in isteği (params, query, body) ve başarılı yanıtı Zod şemasıyla tanımlansın.
- 400, 404 ve 500 hata yanıtları için de Zod şemaları tanımlansın.
- Tipler şemalardan çıkarılsın (`z.infer`); aynı şeyi iki kez yazma.
- Veritabanı işlemleri route dosyalarında değil, ayrı bir katmanda olsun (route → servis/repository → Drizzle).
- Tablo şeması Drizzle'da tek yerde tanımlansın. Veritabanını elle değiştirme; her değişiklik migration ile olsun.
- Ham SQL gerekiyorsa Drizzle'ın `sql` yardımcısını kullan, metin birleştirerek SQL yazma (SQL injection riskini önlemek için).
- Hatalar tutarlı bir JSON biçiminde dönsün. Bulunamayan kayıt → 404, geçersiz istek → 400, beklenmeyen sunucu hatası → 500.
- İstemciye SQL sorgusu, stack trace veya gizli sistem bilgisi gönderme.
- Bozuk bir kayıt bütün yanıtı çökertmesin: yalnızca veri aktarımı (import/seed) sırasında atlanabilir ve log'a yazılabilir. API yanıtlarında hatalı veriyi sessizce atlama; hatayı uygun şekilde yönet.

### Optional ve Nullable Kuralları

- TypeScript'teki optional (`?`) ve nullable (`null`) aynı şey değildir.
- Optional alan, nesnede hiç bulunmayabilir.
- Nullable alan, nesnede bulunur ancak değeri `null` olabilir.
- Her optional alan otomatik olarak veritabanında nullable yapılmamalı.
- Veritabanında bir alanın nullable olup olmayacağına veri modeline ve iş gereksinimine göre karar ver. Emin değilsen önce bana sor.
- Zod şemalarında `.optional()` ve `.nullable()` kullanımını birbirinden ayır.

### Veri modeli

Frontend'deki tipler başlangıç noktası: `../klip-dergi/src/types.ts`

```text
Person (slug, name, bio, dek, links[], updatedAt, editor)
 ├── photo?: Photo (src, width, height, focus?, author, license, licenseUrl?, sourceUrl)
 └── clips: Clip[] (platform: instagram|youtube, url, title, topic, publishedAt, cover, quote?)
              └── source?: Source (podcastSlug?, episodeTitle, episodeUrl, timestamp?)

Podcast (slug, name, host, url, platforms[])
```

- `?` işareti olan alanlar otomatik olarak nullable kabul edilmesin. Optional ve nullable ayrımı veri modeline göre yapılsın.
- Örnek veri: `../klip-dergi/src/data/people.json` (12 kişi). Seed için bunu kullan.
- Frontend'in ihtiyaç duyduğu veriyi bozma. Bir alanın adını veya şeklini değiştireceksen önce sor.

### Test

- Her yeni fonksiyonun karşılık gelen bir testi olsun.
- Her endpoint için en az bir başarılı ve bir hatalı durum testi yaz.
- 400, 404 ve 500 hata yanıtlarının beklenen formatta olduğunu test et.
- Testler gerçek PostgreSQL'e karşı çalışsın (Testcontainers); veritabanını mock'lama.
- Her test temiz veriyle başlasın.
- "Bitti" demeden önce testleri çalıştır ve sonucu olduğu gibi söyle. Test çalıştırılmadıysa başarılı olduğunu iddia etme.

### Güvenlik ve gizli bilgiler

- Veritabanı adresi, şifre vb. `.env` içinde dursun.
- `.env` commit edilmez, onun yerine `.env.example` olsun.
- Gizli bilgiyi koda, log'a veya commit mesajına yazma.

### Git

- `main` dalına doğrudan commit atma. Her iş için ayrı dal aç (ör. `feat/people-endpoint`).
- Commit ve push'u ben istemeden yapma.
- Commit mesajları kısa ve ne yapıldığını anlatsın.
- Her iş ayrı branch ve PR ile ilerlesin.

## Klasörler

- `notlar/`: benim öğrenme notlarım. İçeriğini ben istemeden değiştirme.
- Mevcut klasör yapısını değiştirmeden önce önerini açıkla ve onayımı bekle.
- Yeni bir klasör veya dosya eklemeden önce neden gerekli olduğunu kısaca belirt.
