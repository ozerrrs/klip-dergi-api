import "dotenv/config";
import { readFileSync } from "node:fs";
import { db } from "../src/db/index";
import {
  people,
  photos,
  socialLinks,
  episodes,
  clips,
  clipPeople,
} from "../src/db/schema";
import { and, eq, count } from "drizzle-orm";

// JSON dosyalarının tipleri
interface PersonData {
  slug: string;
  name: string;
  bio: string;
  dek: string;
  links?: string[];
  clipNotes?: {
    reel: string;
    topic: string;
    quote?: string;
  }[];
  updatedAt: string;
  editor: string;
  photo?: {
    src: string;
    width: number;
    height: number;
    focus?: string;
    author: string;
    license: string;
    licenseUrl?: string;
    sourceUrl: string;
  };
}

interface ClipData {
  reel: string;
  url: string;
  yayinTarihi: string;
  baslik: string;
  kaynak?: {
    videoBasligi: string;
    youtubeId: string;
  };
  kisiler: string[];
}

// JSON dosyalarını oku
const peopleData = JSON.parse(
  readFileSync("src/data/people.json", "utf-8"),
) as PersonData[];

const clipsData = JSON.parse(
  readFileSync("src/data/ornek-api.json", "utf-8"),
) as { klipler: ClipData[] };

// URL'den sosyal medya platformunu belirle
function getPlatform(url: string): string {
  const hostname = new URL(url).hostname.replace(/^www\./, "");

  if (hostname.includes("instagram")) return "instagram";
  if (hostname.includes("youtube") || hostname === "youtu.be") return "youtube";
  if (hostname.includes("linkedin")) return "linkedin";
  if (hostname === "x.com" || hostname.includes("twitter")) return "x";
  if (hostname.includes("tiktok")) return "tiktok";

  return hostname;
}

export async function importData() {
  console.log("Veri aktarımı başlıyor...");

  await db.transaction(async (tx) => {
    const personIds = new Map<string, string>();
    const clipIds = new Map<string, string>();
    const episodeIds = new Map<string, string>();

    // 1. KİŞİLER
    for (const person of peopleData) {
      const [savedPerson] = await tx
        .insert(people)
        .values({
          slug: person.slug,
          name: person.name,
          bio: person.bio,
          dek: person.dek,
          updatedAt: person.updatedAt,
          editor: person.editor,
        })
        .onConflictDoUpdate({
          target: people.slug,
          set: {
            name: person.name,
            bio: person.bio,
            dek: person.dek,
            updatedAt: person.updatedAt,
            editor: person.editor,
          },
        })
        .returning({ id: people.id });

      personIds.set(person.name, savedPerson.id);

      // 2. SOSYAL MEDYA BAĞLANTILARI
      for (const link of person.links ?? []) {
        const existingLink = await tx
          .select({ id: socialLinks.id })
          .from(socialLinks)
          .where(
            and(
              eq(socialLinks.personId, savedPerson.id),
              eq(socialLinks.url, link),
            ),
          )
          .limit(1);

        if (existingLink.length === 0) {
          await tx.insert(socialLinks).values({
            personId: savedPerson.id,
            platform: getPlatform(link),
            url: link,
          });
        }
      }

      // 3. FOTOĞRAFLAR
      if (person.photo) {
        await tx
          .insert(photos)
          .values({
            personId: savedPerson.id,
            src: person.photo.src,
            width: person.photo.width,
            height: person.photo.height,
            focus: person.photo.focus ?? null,
            author: person.photo.author,
            license: person.photo.license,
            licenseUrl: person.photo.licenseUrl ?? null,
            sourceUrl: person.photo.sourceUrl,
          })
          .onConflictDoUpdate({
            target: photos.personId,
            set: {
              src: person.photo.src,
              width: person.photo.width,
              height: person.photo.height,
              focus: person.photo.focus ?? null,
              author: person.photo.author,
              license: person.photo.license,
              licenseUrl: person.photo.licenseUrl ?? null,
              sourceUrl: person.photo.sourceUrl,
            },
          });
      }
    }

    console.log(`${personIds.size} kişi aktarıldı.`);

    // 4. YOUTUBE KAYNAKLARI (EPISODES)
    for (const clip of clipsData.klipler) {
      if (!clip.kaynak) continue;

      const youtubeId = clip.kaynak.youtubeId;
      const episodeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

      if (!episodeIds.has(youtubeId)) {
        const [savedEpisode] = await tx
          .insert(episodes)
          .values({
            title: clip.kaynak.videoBasligi,
            youtubeId,
            url: episodeUrl,
          })
          .onConflictDoUpdate({
            target: episodes.youtubeId,
            set: {
              title: clip.kaynak.videoBasligi,
              url: episodeUrl,
            },
          })
          .returning({ id: episodes.id });

        episodeIds.set(youtubeId, savedEpisode.id);
      }
    }

    console.log(`${episodeIds.size} YouTube kaynağı aktarıldı.`);

    // 5. KLİPLER
    for (const clip of clipsData.klipler) {
      const episodeId = clip.kaynak
        ? (episodeIds.get(clip.kaynak.youtubeId) ?? null)
        : null;

      const [savedClip] = await tx
        .insert(clips)
        .values({
          reel: clip.reel,
          url: clip.url,
          platform: "instagram",
          title: clip.baslik,
          publishedAt: clip.yayinTarihi,
          cover: `/kapaklar/${clip.reel}.jpg`,
          episodeId,
        })
        .onConflictDoUpdate({
          target: clips.reel,
          set: {
            url: clip.url,
            platform: "instagram",
            title: clip.baslik,
            publishedAt: clip.yayinTarihi,
            cover: `/kapaklar/${clip.reel}.jpg`,
            episodeId,
          },
        })
        .returning({ id: clips.id });

      clipIds.set(clip.reel, savedClip.id);

      // 6. KİŞİ - KLİP İLİŞKİLERİ
      // Önce bu klibin eski ilişkilerini temizle.
      await tx.delete(clipPeople).where(eq(clipPeople.clipId, savedClip.id));

      for (const personName of clip.kisiler) {
        const personId = personIds.get(personName);

        if (!personId) {
          throw new Error(
            `Kişi bulunamadı: ${personName} (Klip: ${clip.reel})`,
          );
        }

        const note = peopleData
          .find((person) => person.name === personName)
          ?.clipNotes?.find((item) => item.reel === clip.reel);

        await tx.insert(clipPeople).values({
          clipId: savedClip.id,
          personId,
          topic: note?.topic ?? "klip",
          quote: note?.quote ?? null,
        });
      }
    }

    console.log(`${clipIds.size} klip aktarıldı.`);
  });

  // 7. TABLO KAYIT SAYILARI
  const tables = [
    ["people", people],
    ["photos", photos],
    ["social_links", socialLinks],
    ["episodes", episodes],
    ["clips", clips],
    ["clip_people", clipPeople],
  ] as const;

  console.log("\n--- Veritabanı kayıt sayıları ---");

  for (const [name, table] of tables) {
    const [result] = await db.select({ total: count() }).from(table);

    console.log(`${name}: ${result.total}`);
  }

  console.log("\nVeri aktarımı başarıyla tamamlandı!");
}
