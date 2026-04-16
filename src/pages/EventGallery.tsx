
import { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, MapPin, Heart, Images, CircleAlert as AlertCircle, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Event, Photo } from '../lib/types';
import { formatDate, getOrCreateGuestId } from '../lib/utils';
import PhotoCard from '../components/PhotoCard';
import PhotoModal from '../components/PhotoModal';
import Logo from '../components/Logo';

interface EventGalleryProps {
  slug: string;
}

export default function EventGallery({ slug }: EventGalleryProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const guestId = getOrCreateGuestId();
  const galleryRef = useRef<HTMLDivElement>(null);

  const scrollToGallery = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
// const HERO_IMAGE = 'https://images.pexels.com/photos/3407777/pexels-photo-3407777.jpeg?auto=compress&cs=tinysrgb&w=1600';
  const loadEvent = useCallback(async () => {
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (!eventData) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setEvent(eventData);

    const { data: photosData } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', eventData.id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (!photosData || photosData.length === 0) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    const photoIds = photosData.map((p) => p.id);

    const [{ data: likesData }, { data: commentsData }, { data: userLikesData }] = await Promise.all([
      supabase.from('likes').select('photo_id').in('photo_id', photoIds),
      supabase.from('comments').select('photo_id').in('photo_id', photoIds),
      supabase.from('likes').select('photo_id').in('photo_id', photoIds).eq('guest_id', guestId),
    ]);

    const likeCountMap: Record<string, number> = {};
    const commentCountMap: Record<string, number> = {};
    const userLikedSet = new Set((userLikesData ?? []).map((l) => l.photo_id));

    (likesData ?? []).forEach((l) => { likeCountMap[l.photo_id] = (likeCountMap[l.photo_id] || 0) + 1; });
    (commentsData ?? []).forEach((c) => { commentCountMap[c.photo_id] = (commentCountMap[c.photo_id] || 0) + 1; });

    const enriched = photosData.map((p) => ({
      ...p,
      likes_count: likeCountMap[p.id] || 0,
      comments_count: commentCountMap[p.id] || 0,
      user_liked: userLikedSet.has(p.id),
    }));

    setPhotos(enriched);
    setLoading(false);
  }, [slug, guestId]);

  useEffect(() => { loadEvent(); }, [loadEvent]);

  async function handleLike(photoId: string) {
    await supabase.from('likes').insert({ photo_id: photoId, guest_id: guestId });
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId
          ? { ...p, likes_count: (p.likes_count ?? 0) + 1, user_liked: true }
          : p
      )
    );
  }

  async function handleUnlike(photoId: string) {
    await supabase.from('likes').delete().eq('photo_id', photoId).eq('guest_id', guestId);
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId
          ? { ...p, likes_count: Math.max(0, (p.likes_count ?? 1) - 1), user_liked: false }
          : p
      )
    );
  }

  function handleModalLike(photoId: string) { handleLike(photoId); }
  function handleModalUnlike(photoId: string) { handleUnlike(photoId); }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center gap-4">
        <Logo size="md" />
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4 text-center">
        <Logo size="md" />
        <div className="mt-8 p-6 rounded-3xl bg-white/3 border border-white/10 max-w-sm w-full">
          <AlertCircle size={32} className="mx-auto mb-3 text-rose-400" />
          <h2 className="text-white font-semibold text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Événement introuvable
          </h2>
          <p className="text-white/40 text-sm">
            Cet événement n'existe pas ou a été supprimé.
          </p>
        </div>
      </div>
    );
  }

  const totalLikes = photos.reduce((sum, p) => sum + (p.likes_count ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
   {/* --- SECTION HERO --- */}
<section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
  {/* Image de fond : on utilise l'image de l'événement ou une image par défaut si non définie */}
  <div
    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style={{ 
      backgroundImage: `url(${event?.cover_url || 'https://images.pexels.com/photos/3407777/pexels-photo-3407777.jpeg?auto=compress&cs=tinysrgb&w=1600'})` 
    }}
  />
  
  {/* Overlays pour garantir la lisibilité du texte (identiques au Landing) */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-[#0d0d0d]" />
  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

  <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
    <div className="flex justify-center mb-10">
      <Logo size="lg" />
    </div>
     <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            No flex,{' '}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Pure vibes
            </span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Bienvenue sur Eipic/Casual Nights la plateforme photos vidéos qui  connecte les photographes aux invités. Souvenirs partagés, likés, commentés et téléchargés en un instant
          </p>

    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
      {event?.name}
    </h1>

    <div className="flex flex-col items-center gap-6 mb-12">
      <button
        onClick={scrollToGallery}
        className="px-10 py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-[0_0_30px_rgba(201,168,76,0.3)] hover:shadow-[0_0_50px_rgba(201,168,76,0.5)]"
      >
        Découvrir les photos
      </button>
      <button
        onClick={scrollToGallery}
        className="animate-bounce p-2 rounded-full text-amber-400 hover:text-amber-300 transition-colors"
      >
        <ChevronDown size={32} />
      </button>
    </div>

    {event?.description && (
      <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed italic">
        "{event.description}"
      </p>
    )}
  </div>

  {/* Transition douce vers le contenu */}
  <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0d0d0d] to-transparent" />
</section>
      {/* --- SECTION GALERIE (CONTENU DÉCOUVERT AU SCROLL) --- */}
      <div className="max-w-6xl mx-auto px-4 pb-16 pt-20" ref={galleryRef}>
        <div className="text-center mb-16">
          <h3 className="text-4xl sm:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            {event?.name}
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {event?.date && (
              <span className="flex items-center gap-2 text-white/60 text-base">
                <Calendar size={18} className="text-amber-400" />
                {formatDate(event.date)}
              </span>
            )}
            {event?.venue && (
              <span className="flex items-center gap-2 text-white/60 text-base">
                <MapPin size={18} className="text-amber-400" />
                {event.venue}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-12 mb-10">
            <div className="text-center">
              <p className="text-white font-bold text-4xl">{photos.length}</p>
              <p className="text-white/30 text-xs uppercase tracking-wider mt-1">Souvenirs</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-white font-bold text-4xl">{totalLikes}</p>
              <p className="text-white/30 text-xs uppercase tracking-wider mt-1">Cœurs</p>
            </div>
          </div>

          {event?.description && (
            <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed italic">
              "{event.description}"
            </p>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Images size={40} className="text-white/15 mb-4" />
            <h3 className="text-white/40 text-lg font-medium mb-2">Aucune photo pour le moment</h3>
            <p className="text-white/25 text-sm">Le photographe va bientôt publier des photos.</p>
          </div>
        ) : (
          <>
            <p className="text-white/25 text-xs text-center mb-8 uppercase tracking-[0.3em]">
              Explorez la galerie
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {photos.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  guestId={guestId}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onClick={() => setSelectedPhotoIndex(index)}
                />
              ))}
            </div>
            <div className="mt-20 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/3 border border-white/8 text-white/30 text-xs">
                <Heart size={12} className="text-rose-400" />
                Souvenirs créés avec Casual Nights by Sipping
              </div>
            </div>
          </>
        )}
      </div>

      {selectedPhotoIndex !== null && (
        <PhotoModal
          photos={photos}
          initialIndex={selectedPhotoIndex}
          guestId={guestId}
          onClose={() => setSelectedPhotoIndex(null)}
          onLike={handleModalLike}
          onUnlike={handleModalUnlike}
        />
      )}
    </div>
  );
}