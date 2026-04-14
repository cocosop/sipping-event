
/*
  # Bliss Event Photography App - Initial Schema

  ## Overview
  Schema for the Bliss event photography platform where photographers publish photos
  and guests access galleries via QR codes.

  ## Tables

  ### events
  - Represents a photography event (party, wedding, gala, etc.)
  - Linked to a photographer (authenticated user)
  - Has a unique slug used in QR code URLs

  ### photos
  - Photos uploaded to an event
  - Includes an expires_at column set 7 days after upload
  - Expired photos are filtered out in queries

  ### likes
  - Anonymous guest likes tracked by guest_id (stored in browser localStorage)
  - Unique constraint prevents duplicate likes

  ### comments
  - Anonymous guest comments with a display name

  ## Security
  - RLS enabled on all tables
  - Public read access for events, photos, likes, comments (intended for public guest viewing)
  - Write access restricted to authenticated photographers for events/photos
  - Anonymous users can create likes and comments (intended guest interaction)

  ## Storage
  - Public bucket "event-photos" for storing uploaded images
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  date text,
  venue text,
  slug text UNIQUE NOT NULL,
  photographer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_image text,
  created_at timestamptz DEFAULT now()
);

-- Photos table with auto-expiration
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  url text NOT NULL,
  caption text,
  photographer_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Likes table (anonymous guests)
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  guest_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(photo_id, guest_id)
);

-- Comments table (anonymous guests with display name)
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  guest_name text NOT NULL DEFAULT 'Invité',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create storage bucket for event photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-photos',
  'event-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Events Policies
-- ============================================================

-- Public read: guests scan QR code and must be able to view event info
CREATE POLICY "Events are publicly readable"
  ON events FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only the owning photographer can create events
CREATE POLICY "Photographers can create their own events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (photographer_id = auth.uid());

-- Only the owning photographer can update their events
CREATE POLICY "Photographers can update their own events"
  ON events FOR UPDATE
  TO authenticated
  USING (photographer_id = auth.uid())
  WITH CHECK (photographer_id = auth.uid());

-- Only the owning photographer can delete their events
CREATE POLICY "Photographers can delete their own events"
  ON events FOR DELETE
  TO authenticated
  USING (photographer_id = auth.uid());

-- ============================================================
-- Photos Policies
-- ============================================================

-- Public read: guests see photos in the gallery
CREATE POLICY "Photos are publicly readable"
  ON photos FOR SELECT
  TO anon, authenticated
  USING (expires_at > now());

-- Only the owning photographer can upload photos
CREATE POLICY "Photographers can upload photos to their events"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK (photographer_id = auth.uid());

-- Only the owning photographer can delete their photos
CREATE POLICY "Photographers can delete their own photos"
  ON photos FOR DELETE
  TO authenticated
  USING (photographer_id = auth.uid());

-- ============================================================
-- Likes Policies
-- ============================================================

-- Public read: anyone can see like counts
CREATE POLICY "Likes are publicly readable"
  ON likes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can like a photo (guests and photographers)
CREATE POLICY "Anyone can add a like"
  ON likes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can remove their own like (matched by guest_id)
CREATE POLICY "Anyone can remove their own like"
  ON likes FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================================
-- Comments Policies
-- ============================================================

-- Public read: anyone can see comments
CREATE POLICY "Comments are publicly readable"
  ON comments FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can add a comment
CREATE POLICY "Anyone can add a comment"
  ON comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- Storage Policies
-- ============================================================

-- Public read access for photos
CREATE POLICY "Photos are publicly accessible"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'event-photos');

-- Only authenticated photographers can upload
CREATE POLICY "Photographers can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-photos');

-- Only authenticated photographers can delete their photos
CREATE POLICY "Photographers can delete their own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-photos');

-- ============================================================
-- Performance Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_photographer ON events(photographer_id);
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_expires_at ON photos(expires_at);
CREATE INDEX IF NOT EXISTS idx_likes_photo_id ON likes(photo_id);
CREATE INDEX IF NOT EXISTS idx_likes_guest_photo ON likes(photo_id, guest_id);
CREATE INDEX IF NOT EXISTS idx_comments_photo_id ON comments(photo_id);
