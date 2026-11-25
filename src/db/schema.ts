import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";

// Klip platformları
export const clipPlatformEnum = pgEnum("clip_platform", [
  "instagram",
  "youtube",
]);

// 1. PEOPLE — Kişiler
export const people = pgTable("people", {
  id: uuid("id").defaultRandom().primaryKey(),

  slug: varchar("slug", { length: 100 }).notNull().unique(),

  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio").notNull(),
  dek: text("dek").notNull(),

  updatedAt: date("updated_at").notNull(),
  editor: varchar("editor", { length: 255 }).notNull(),
});

// 2. SOCIAL_LINKS — Kişilerin sosyal medya bağlantıları
export const socialLinks = pgTable("social_links", {
  id: uuid("id").defaultRandom().primaryKey(),

  personId: uuid("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),

  platform: varchar("platform", { length: 50 }),
  url: text("url").notNull(),
});

// 3. PHOTOS — Kişi fotoğrafları
export const photos = pgTable("photos", {
  id: uuid("id").defaultRandom().primaryKey(),

  personId: uuid("person_id")
    .notNull()
    .unique()
    .references(() => people.id, { onDelete: "cascade" }),

  src: text("src").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),

  focus: varchar("focus", { length: 100 }),
  author: varchar("author", { length: 255 }).notNull(),
  license: varchar("license", { length: 100 }).notNull(),
  licenseUrl: text("license_url"),
  sourceUrl: text("source_url").notNull(),
});

// 4. PODCASTS — Podcast programları
export const podcasts = pgTable("podcasts", {
  id: uuid("id").defaultRandom().primaryKey(),

  slug: varchar("slug", { length: 100 }).notNull().unique(),

  name: varchar("name", { length: 255 }).notNull(),
  host: varchar("host", { length: 255 }).notNull(),
  url: text("url").notNull(),

  platforms: text("platforms").array().notNull().default([]),
});

// 5. EPISODES — Podcast bölümleri
export const episodes = pgTable("episodes", {
  id: uuid("id").defaultRandom().primaryKey(),

  podcastId: uuid("podcast_id").references(() => podcasts.id, {
    onDelete: "set null",
  }),

  title: text("title").notNull(),

  youtubeId: varchar("youtube_id", { length: 11 }).notNull().unique(),

  url: text("url").notNull().unique(),
});

// 6. CLIPS — Klipler
export const clips = pgTable("clips", {
  id: uuid("id").defaultRandom().primaryKey(),

  reel: varchar("reel", { length: 100 }).notNull().unique(),

  url: text("url").notNull().unique(),

  platform: clipPlatformEnum("platform").notNull(),

  title: text("title").notNull(),

  publishedAt: date("published_at").notNull(),

  cover: text("cover").notNull(),

  episodeId: uuid("episode_id").references(() => episodes.id, {
    onDelete: "set null",
  }),

  // Bölüm içindeki zaman: ör. 12:34
  sourceTimestamp: varchar("source_timestamp", { length: 20 }),
});

// 7. CLIP_PEOPLE — Klip ve kişi arasındaki çoktan çoğa ilişki
export const clipPeople = pgTable(
  "clip_people",
  {
    clipId: uuid("clip_id")
      .notNull()
      .references(() => clips.id, { onDelete: "cascade" }),

    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),

    // Kişiye özel klip notları
    topic: text("topic").notNull(),
    quote: text("quote"),
  },
  (table) => [
    primaryKey({
      columns: [table.clipId, table.personId],
    }),
  ],
);
