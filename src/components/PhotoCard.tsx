import { useState } from 'react';
import { Heart, MessageCircle, Download } from 'lucide-react';
import type { Photo } from '../lib/types';

interface PhotoCardProps {
  photo: Photo;
  guestId: string;
  onLike: (photoId: string) => Promise<void>;   // Changé void en Promise<void>
  onUnlike: (photoId: string) => Promise<void>; // Changé void en Promise<void>
  onClick: () => void;
}

export default function PhotoCard({ photo, onLike, onUnlike, onClick, guestId }: PhotoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Ajout de async ici car on appelle des fonctions asynchrones
  async function handleLikeClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (photo.user_liked) {
      await onUnlike(photo.id);
    } else {
      await onLike(photo.id);
    }
  }

  async function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bliss-${photo.id.slice(0, 8)}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(photo.url, '_blank');
    }
  }

  return (
    <div
      className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-900 aspect-square"
      onClick={onClick}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
      <img
        src={photo.url}
        alt={photo.caption || 'Photo Bliss'}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        {photo.caption && (
          <p className="text-white text-xs mb-2 line-clamp-2 font-medium">{photo.caption}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLikeClick}
              className="flex items-center gap-1.5 text-white text-xs"
            >
              <Heart
                size={16}
                className={`transition-all duration-200 ${
                  photo.user_liked ? 'fill-rose-400 text-rose-400 scale-110' : 'text-white/80'
                }`}
              />
              <span className="font-medium">{photo.likes_count ?? 0}</span>
            </button>
            <div className="flex items-center gap-1.5 text-white/80 text-xs">
              <MessageCircle size={15} />
              <span>{photo.comments_count ?? 0}</span>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors backdrop-blur-sm"
            title="Télécharger"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {photo.user_liked && (
        <div className="absolute top-2.5 right-2.5">
          <Heart size={14} className="fill-rose-400 text-rose-400" />
        </div>
      )}
    </div>
  );
}
