## Açık sorular

### 1. Boş parametre: `?topic=` ve `?search=`

Site bugün boş değeri "filtre yok" sayıyor ve herkesi gösteriyor.

- **A)** 200, herkes (sitenin bugünkü davranışı, şu anki sözleşme)
- **B)** 400, "boş değer gönderme, parametreyi hiç gönderme"

### 2. Var olmayan konu: `?topic=olmayan`

- **A)** 200 ve `[]` (şu anki sözleşme: istek doğru, sadece sonuç boş)
- **B)** 400, "böyle bir konu yok" (API konu listesini bildiği için kontrol edebilir)
- **C)** 404

### 3. Çok uzun arama: `?search=` ve 500 karakter

Şu an uzunluk sınırı yok.

- **A)** Sınır olmasın, 200
- **B)** Sınır olsun (ör. en fazla 100 karakter), aşılırsa 400

### 4. Tanınmayan parametre: `/people?foo=bar`, `/topics?x=1`, `/clips?page=2`

Sözleşmede tanımlı olmayan bir parametre gönderilirse ne olsun? Şu an sözleşme bu konuda bir şey söylemiyor.

- **A)** 400 dönülsün. Cevap şu biçimde olur:

  ```json
  { "error": { "code": "BAD_REQUEST", "message": "Tanınmayan parametre: foo" } }
  ```

  `code` alanı `BAD_REQUEST`, `NOT_FOUND` ya da `INTERNAL_ERROR` olur; 404 ve 500 de aynı biçimde döner.

- **B)** Yok sayılsın, 200 (çoğu API böyle yapar)

## Sitenin yaptığı ama sözleşmede yazmayan şeyler

### 5. Klibi olmayan kişi gizlenmeli mi?

`klip-dergi/src/lib/people.ts`:

```ts
// Hiç klibi kalmayan kişi gösterilmez (sayfalar en az bir klip bekliyor)
return hepsi.filter((kisi) => {
  if (kisi.clips.length === 0)
    console.warn(`[klip-api] ${kisi.name}: hiç klip yok, sitede gösterilmedi`);
  return kisi.clips.length > 0;
});
```

Site, hiç klibi olmayan kişiyi listeden çıkarıyor. Sözleşmede `GET /people` "bütün kişiler" diyor. Bugün böyle bir kişi yok, ama veritabanına klibi henüz olmayan yeni bir kişi eklenince olabilir.

- **A)** API de gizlesin: `/people` sadece en az bir klibi olan kişileri döner, `/people/{slug}` böyle bir kişi için 404 döner
- **B)** API herkesi dönsün, gizleme kararını site versin (bugünkü gibi)

### 6. Notu olmayan klibin konusu ne olacak?

`klip-dergi/src/lib/people.ts`, `klibeCevir`:

```ts
topic: not?.topic ?? "klip", // notu olmayan yeni klipte konu henüz yok
```

Konu (`topic`) editörün `people.json`'daki klip notundan geliyor. API'de yeni bir klip olup editör henüz not yazmamışsa site o klibe konu olarak `"klip"` yazıyor. Sözleşmede `Clip.topic` zorunlu. Bugün böyle bir klip yok.

- **A)** API de `"klip"` yazsın (sitenin bugünkü davranışı). Ama o zaman `/topics` listesinde de "klip" diye bir konu görünür.
- **B)** Notu (konusu) olmayan klip API'de hiç gösterilmesin
- **C)** `topic` isteğe bağlı olsun (`topic?`): site konusu olmayan klibi kendisi ele alsın. Bu, `types.ts`'deki `Clip` tipini değiştirir.

### 7. Kişiler hangi sırayla dönsün?

`klip-dergi/src/app/page.tsx`:

```ts
const vitrin = kisiler.slice(0, 5); // Vitrin: ilk 5 kişi (0, 1, 2, 3, 4)
```

Ana sayfadaki vitrin, listedeki **ilk 5 kişiyi** gösteriyor. Bugün sıra `people.json`'daki sıra. Sözleşmede `GET /people` için bir sıra yazmıyor; API kişileri başka bir sırayla dönerse vitrin değişir. Kişilerin klipleri de bugün `people.json`'daki klip notlarının sırasıyla gösteriliyor.

- **A)** `people.json`'daki sıra korunsun (veritabanında bir sıra alanı tutulur, editör sırayı belirler)
- **B)** İsme göre (A → Z)
- **C)** `updatedAt`'e göre (en son güncellenen önce)

### 8. Görseller nerede duracak?

API görsel dosyası değil, görselin **adresini** döndürüyor:

```json
"photo": { "src": "/fotograflar/hamdi-ulukaya.jpg" },
"clips": [{ "cover": "/kapaklar/Ddqm-BsAxNj.jpg" }]
```

Bu dosyalar sitenin `public/` klasöründe (`public/fotograflar/`: 5 fotoğraf, `public/kapaklar/`: 21 kapak). API'ye yeni bir kişi ya da klip eklenince onun görseli sitede olmayacak ve kırık görünecek.

- **A)** Görseller sitede kalsın; yeni görseli site tarafı `public/`'e ekler (API sadece adresi döner)
- **B)** API görselleri sunsun (ör. `http://localhost:3001/kapaklar/...`); adresler tam adres olur
- **C)** Görseller ayrı bir depolama servisinde dursun (ör. bulut depolama); API oradaki tam adresi döner

## Oturtamadığım yerler

### 9. `paths` içindeki `/clips` ucunu tam oturtamadım
