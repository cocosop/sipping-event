/*
  # Add media_type column to photos table

  ## Summary
  Adds support for video uploads alongside photos in the existing photos table.

  ## Changes
  - `photos` table
    - Added `media_type` column (text, default 'photo') — distinguishes between 'photo' and 'video' entries
    - Added `thumbnail_url` column (text, nullable) — optional thumbnail for video entries

  ## Notes
  - Existing rows will default to 'photo' media_type, preserving all current data
  - No destructive operations performed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE photos ADD COLUMN media_type text NOT NULL DEFAULT 'photo';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE photos ADD COLUMN thumbnail_url text;
  END IF;
END $$;
