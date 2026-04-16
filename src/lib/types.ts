export interface Event {
  id: string;
  name: string;
  description: string | null;
  date: string | null;
  venue: string | null;
  slug: string;
  photographer_id: string;
  cover_image: string | null;
  cover_url: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  event_id: string;
  storage_path: string;
  url: string;
  caption: string | null;
  photographer_id: string;
  created_at: string;
  expires_at: string;
  likes_count?: number;
  comments_count?: number;
  user_liked?: boolean;
}

export interface Like {
  id: string;
  photo_id: string;
  guest_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  photo_id: string;
  guest_name: string;
  content: string;
  created_at: string;
}

export type AppView = 'landing' | 'auth' | 'dashboard' | 'gallery';
