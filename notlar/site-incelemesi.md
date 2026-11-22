# Proje anlama notlarım

Amaç: Şeyma'nın projesini (Klip Dergi) anlamak.

> ⚠️ **Bulamadıklarım:** Projede **Zod şemasını** ve **örnek JSON'u** bulamadım.

---

## 1. `layout.tsx` ve `{children}` ❓ ANLAMADIM

```tsx
export default function RootLayout({ children }) {
  ...
  <Header kisiler={aramaKisileri} />
  {children}
  <Footer />
}
```

**`{children}` kısmını tam anlamadım.** Next.js'in temeli bu kısım gibi görünüyor, ama nasıl çalıştığı kafamda oturmadı.

Anladığım kadarı:

- `layout.tsx` her sayfada ortak olan kalıp (Header ve Footer burada).
- `{children}` yerine açılan sayfanın (`page.tsx`) içeriği geliyor.

Anlamadıklarım (tekrar bakılacak):

- `page.tsx` nasıl oluyor da `children` olarak layout'a veriliyor?
- `layout.tsx` hiçbir yerde import edilmiyor, Next.js onu nasıl buluyor?

---

## 2. Backend framework'leri (kısa karşılaştırma)

| Express.js       | Nest.js                      | Fastify            |
| ---------------- | ---------------------------- | ------------------ |
| Low-level        | Large scale (büyük projeler) | Fast (hızlı)       |
| Flexible (esnek) | Full backend                 | Better performance |
| HTTP API         |                              |                    |

---

## 3. Ana sayfa: `src/app/page.tsx`

Ana sayfa, her şeyin toplandığı yer. Yukarıdan aşağı:

1. **Header**: üstte, her sayfada aynı (layout'tan geliyor).
2. **Vitrin** ([Vitrin.tsx](../src/components/Vitrin.tsx)): kayan kart şeridi (carousel). Ortadaki kart büyük ve net, yandakiler küçük ve soluk. ← → oklarıyla kayıyor.
3. **Diğer hikâyeler**: solda 1 büyük kart, sağda 4 küçük kart. Hepsi [HikayeKarti.tsx](../src/components/HikayeKarti.tsx).
   - 4 küçük kart iki sütuna bölünüyor: 1. sütun = 1. ve 3. kişi, 2. sütun = 2. ve 4. kişi. Böylece satır satır okununca sıra doğru oluyor.
4. **Alıntı bandı** ([AlintiBandi.tsx](../src/components/AlintiBandi.tsx)): tam genişlik koyu bant, tek bir alıntı. Şu an Abdullah Kiğılı'nın sözü.
5. **Bütün hikâyeler**: bütün kişilerin albümü. Yine [HikayeKarti.tsx](../src/components/HikayeKarti.tsx), sığdığı kadar sütun açılıyor.

---

## 4. Header ve Footer

- `<Header>` ve `<Footer>` layout'ta olduğu için her sayfada aynı görünüyor.
- [Header.tsx](../src/components/Header.tsx):
  - ≡ menü düğmesi (`setAcik`: menü açık mı kapalı mı)
  - Arama düğmesi (`setAramaAcik()`: arama kutusu açık mı kapalı mı)
- [Footer.tsx](../src/components/Footer.tsx): özel bir mantığı yok, sabit alt bilgi (bordo zemin, linkler).

---

## 5. Arama: [AramaKutusu.tsx](../src/components/AramaKutusu.tsx)

- `eslesme` fonksiyonu = aramanın filtreleme işlemi. Sırayla bakıyor: **ad → konular → klip başlıkları**. İlk uyanı döndürüyor (kişinin adının altında "neden önerildi" diye yazıyor), hiçbiri uymazsa `null`.
- `basliyor` fonksiyonu = yazının tamamı ya da herhangi bir kelimesi arananla başlıyor mu.

Veri nereden geliyor (tersten):

```
AramaKutusu → Header → app/layout.tsx → lib/people.ts → data/people.json
```

- Gerçek bir veritabanı yok, kişiler [people.json](../src/data/people.json) dosyasında (12 kişi).
- `getAramaKisileri()` sadece ad, slug, konular ve başlıkları seçiyor (biyografi tarayıcıya gitmiyor).

---

## 6. Kişi sayfası ve klipler

- [kisiler/[slug]/page.tsx](../src/app/kisiler/[slug]/page.tsx) = tek kişinin sayfası.
- `[slug]` = değişken demek. `/kisiler/adnan-sahin`, `/kisiler/acun-ilicali` → hepsi aynı dosya.
- Next.js'te adres = dosya yolu: `/kisiler` → `src/app/kisiler/page.tsx`.
- [Kirinti.tsx](../src/components/Kirinti.tsx) = ekmek kırıntısı: "Ana sayfa › Kişiler › Adnan Şahin". `href` varsa link, yoksa "şu an buradasın" (bordo).
- [KlipAlbumu.tsx](../src/components/KlipAlbumu.tsx) → [KlipOynatici.tsx](../src/components/KlipOynatici.tsx)
  - KlipAlbumu = kliplerin ızgarası (01 RİSK ALMAK, başlık, Instagram logosu).
  - KlipOynatici = kapak resmi + ▶ düğmesi.
  - Instagram logosu = [InstagramGlifi.tsx](../src/components/InstagramGlifi.tsx) (SVG, rengi `currentColor` ile yazı renginden alıyor).
- [KlipKarti.tsx](../src/components/KlipKarti.tsx) ⇒ **kullanılmıyor sanırım.** Hiçbir sayfa import etmiyor.

---

## 7. Veri: [types.ts](../src/types.ts) ve [people.ts](../src/lib/people.ts)

- **types.ts** = verinin kalıbı. Bir kişide hangi alanlar var: `Person` → `photo?: Photo`, `clips: Clip[]` → `source?: Source`.
  - `?` = olmayabilir · `string[]` = liste · `"instagram" | "youtube"` = sadece bu ikisi
  - Hata yakalamak ve otomatik tamamlama için var, ekranda bir şey göstermiyor.
  - `Podcast` kalıbı kullanılmıyor.
- **people.ts** = veriyi JSON'dan alıp sayfalara veren 3 fonksiyon:
  - `getAllPeople()` → 12 kişinin hepsi (`as Person[]`: JSON'u kalıba bağlıyor)
  - `getPersonBySlug(slug)` → tek kişi, kişi sayfası kullanıyor. Bulamazsa `undefined`.
  - `getAramaKisileri()` → arama için kısa liste
- Sayfalar JSON'u doğrudan okumuyor. Veritabanı gelirse sadece `people.ts` değişir (**veri erişim katmanı**).

```
people.json → people.ts (fonksiyonlar) → sayfalar
                  ↑ types.ts (kalıp)
```

---

## 8. Deneme sayfaları (sitede linki yok)

- `/ses-deneme` → [SesliBiyografi.tsx](../src/components/SesliBiyografi.tsx) denemesi (sesli okuma + kelime vurgusu). Gerçek sesler gelince silinecek.
- `/klip-deneme` → "12 klip olsa kişi sayfası nasıl görünür?" denemesi. 18 Kasım notunda linki var.
- İkisi de Google'dan gizli (`noindex`), sadece adres elle yazılınca açılıyor.
