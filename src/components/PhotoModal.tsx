import { useState, useEffect, useCallback } from 'react';
import { X, Heart, Download, ChevronLeft, ChevronRight, Send, MessageCircle } from 'lucide-react';
import type { Photo, Comment } from '../lib/types';
import { supabase } from '../lib/supabase';
import { formatRelativeTime } from '../lib/utils';

interface PhotoModalProps {
  photos: Photo[];
  initialIndex: number;
  guestId: string;
  onClose: () => void;
  onLike: (photoId: string) => void;
  onUnlike: (photoId: string) => void;
}

export default function PhotoModal({
  photos,
  guestId,
  initialIndex,
  onClose,
  onLike,
  onUnlike,
}: PhotoModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState(() => localStorage.getItem('bliss_guest_name') || '');
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const photo = photos[currentIndex];

  const loadComments = useCallback(async () => {
    if (!photo) return;
    setLoadingComments(true);
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('photo_id', photo.id)
      .order('created_at', { ascending: true });
    setComments(data ?? []);
    setLoadingComments(false);
  }, [photo]);

  useEffect(() => {
    if (showComments) loadComments();
  }, [showComments, loadComments]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  function goNext() {
    setCurrentIndex((i) => (i + 1) % photos.length);
    setShowComments(false);
  }

  function goPrev() {
    setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
    setShowComments(false);
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !guestName.trim()) return;
    setSubmitting(true);
    localStorage.setItem('bliss_guest_name', guestName);
    await supabase.from('comments').insert({
      photo_id: photo.id,
      guest_name: guestName.trim(),
      content: newComment.trim(),
    });
    setNewComment('');
    await loadComments();
    setSubmitting(false);
  }

  async function handleDownload() {
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

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
      >
        <X size={20} />
      </button>

      <div className="relative w-full h-full flex flex-col lg:flex-row">
        <div className="relative flex-1 flex items-center justify-center min-h-0 p-4 lg:p-8">
          {photos.length > 1 && (
            <>
              <button
                onClick={goPrev}
                data-guest-id={guestId}
                className="absolute left-2 lg:left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 lg:right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <img
            src={photo.url}
            alt={photo.caption || 'Photo'}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>

        <div className="lg:w-80 flex flex-col bg-black/60 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/10 max-h-[40vh] lg:max-h-full">
          <div className="p-4 border-b border-white/10">
            {photo.caption && (
              <p className="text-white/90 text-sm mb-3">{photo.caption}</p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => photo.user_liked ? onUnlike(photo.id) : onLike(photo.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:border-rose-400 transition-all group"
              >
                <Heart
                  size={16}
                  className={`transition-all duration-200 ${
                    photo.user_liked
                      ? 'fill-rose-400 text-rose-400'
                      : 'text-white/60 group-hover:text-rose-400'
                  }`}
                />
                <span className="text-white text-sm font-medium">{photo.likes_count ?? 0}</span>
              </button>

              <button
                onClick={() => setShowComments((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:border-amber-400 transition-all group"
              >
                <MessageCircle size={16} className="text-white/60 group-hover:text-amber-400 transition-colors" />
                <span className="text-white text-sm font-medium">{photo.comments_count ?? 0}</span>
              </button>

              <button
                onClick={handleDownload}
                className="ml-auto p-2 rounded-full border border-white/20 hover:border-amber-400 text-white/60 hover:text-amber-400 transition-all"
                title="Télécharger"
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingComments ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-6">Aucun commentaire. Soyez le premier !</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="group">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-black text-xs font-bold">
                        {c.guest_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-white text-xs font-semibold">{c.guest_name}</span>
                        <span className="text-white/30 text-xs">{formatRelativeTime(c.created_at)}</span>
                      </div>
                      <p className="text-white/70 text-sm mt-0.5 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmitComment} className="p-4 border-t border-white/10 space-y-2">
            <input
              type="text"
              placeholder="Votre prénom"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
              maxLength={30}
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ajouter un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
                maxLength={300}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || !guestName.trim() || submitting}
                className="p-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:from-amber-300 hover:to-amber-400"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
