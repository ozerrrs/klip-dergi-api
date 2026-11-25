CREATE TYPE "public"."clip_platform" AS ENUM('instagram', 'youtube');--> statement-breakpoint
CREATE TABLE "clip_people" (
	"clip_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"topic" text NOT NULL,
	"quote" text,
	CONSTRAINT "clip_people_clip_id_person_id_pk" PRIMARY KEY("clip_id","person_id")
);
--> statement-breakpoint
CREATE TABLE "clips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reel" varchar(100) NOT NULL,
	"url" text NOT NULL,
	"platform" "clip_platform" NOT NULL,
	"title" text NOT NULL,
	"published_at" date NOT NULL,
	"cover" text NOT NULL,
	"episode_id" uuid,
	"source_timestamp" varchar(20),
	CONSTRAINT "clips_reel_unique" UNIQUE("reel"),
	CONSTRAINT "clips_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"podcast_id" uuid,
	"title" text NOT NULL,
	"youtube_id" varchar(11) NOT NULL,
	"url" text NOT NULL,
	CONSTRAINT "episodes_youtube_id_unique" UNIQUE("youtube_id"),
	CONSTRAINT "episodes_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"bio" text NOT NULL,
	"dek" text NOT NULL,
	"updated_at" date NOT NULL,
	"editor" varchar(255) NOT NULL,
	CONSTRAINT "people_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"src" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"focus" varchar(100),
	"author" varchar(255) NOT NULL,
	"license" varchar(100) NOT NULL,
	"license_url" text,
	"source_url" text NOT NULL,
	CONSTRAINT "photos_person_id_unique" UNIQUE("person_id")
);
--> statement-breakpoint
CREATE TABLE "podcasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"host" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"platforms" text[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "podcasts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"platform" varchar(50),
	"url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clip_people" ADD CONSTRAINT "clip_people_clip_id_clips_id_fk" FOREIGN KEY ("clip_id") REFERENCES "public"."clips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clip_people" ADD CONSTRAINT "clip_people_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clips" ADD CONSTRAINT "clips_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;