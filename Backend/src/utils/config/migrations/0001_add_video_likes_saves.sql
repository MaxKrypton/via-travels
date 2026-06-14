-- Migration: Add video_likes and video_saves tables
-- Created: 2025-10-03

CREATE TABLE IF NOT EXISTS "video_likes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "video_id" uuid NOT NULL REFERENCES "videos"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "user_table"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE("video_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "video_saves" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "video_id" uuid NOT NULL REFERENCES "videos"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "user_table"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE("video_id", "user_id")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "video_likes_video_id_idx" ON "video_likes"("video_id");
CREATE INDEX IF NOT EXISTS "video_likes_user_id_idx" ON "video_likes"("user_id");
CREATE INDEX IF NOT EXISTS "video_saves_video_id_idx" ON "video_saves"("video_id");
CREATE INDEX IF NOT EXISTS "video_saves_user_id_idx" ON "video_saves"("user_id");
