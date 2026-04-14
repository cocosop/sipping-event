import { useState, useEffect, useCallback } from 'react';
import { Plus, Camera, Calendar, MapPin, Trash2, ImagePlus, ChevronRight, Clock, Images } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Event, Photo } from '../lib/types';
import { formatDate, getDaysRemaining } from '../lib/utils';
import CreateEventModal from '../components/CreateEventModal';
import UploadModal from '../components/UploadModal';
import QRDisplay from '../components/QRDisplay';
import PhotoCard from '../components/PhotoCard';

interface PhotographerDashboardProps {
  user: User;
}

export default function PhotographerDashboard({ user }: PhotographerDashboardProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('photographer_id', user.id)
      .order('created_at', { ascending: false });
    setEvents(data ?? []);
    setLoadingEvents(false);
  }, [user.id]);

  const loadPhotos = useCallback(async (eventId: string) => {
    setLoadingPhotos(true);
    const { data: photosData } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', eventId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (!photosData) { setLoadingPhotos(false); return; }

    const photoIds = photosData.map((p) => p.id);
    const { data: likesData } = await supabase
      .from('likes')
      .select('photo_id')
      .in('photo_id', photoIds);

    const { data: commentsData } = await supabase
      .from('comments')
      .select('photo_id')
      .in('photo_id', photoIds);

    const likeCountMap: Record<string, number> = {};
    const commentCountMap: Record<string, number> = {};
    (likesData ?? []).forEach((l) => { likeCountMap[l.photo_id] = (likeCountMap[l.photo_id] || 0) + 1; });
    (commentsData ?? []).forEach((c) => { commentCountMap[c.photo_id] = (commentCountMap[c.photo_id] || 0) + 1; });

    const enriched = photosData.map((p) => ({
      ...p,
      likes_count: likeCountMap[p.id] || 0,
      comments_count: commentCountMap[p.id] || 0,
    }));

    setPhotos(enriched);
    setLoadingPhotos(false);
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  useEffect(() => {
    if (selectedEvent) loadPhotos(selectedEvent.id);
    else setPhotos([]);
  }, [selectedEvent, loadPhotos]);

  async function handleDeleteEvent(event: Event) {
    if (!confirm(`Supprimer l'événement "${event.name}" et toutes ses photos ?`)) return;
    await supabase.from('events').delete().eq('id', event.id);
    if (selectedEvent?.id === event.id) setSelectedEvent(null);
    loadEvents();
  }

  async function handleDeletePhoto(photo: Photo) {
    setDeletingPhoto(photo.id);
    await supabase.storage.from('event-photos').remove([photo.storage_path]);
    await supabase.from('photos').delete().eq('id', photo.id);
    if (selectedEvent) loadPhotos(selectedEvent.id);
    setDeletingPhoto(null);
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Mes événements
            </h1>
            <p className="text-white/40 text-sm mt-1">{user.email}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm hover:from-amber-300 hover:to-amber-400 transition-all"
          >
            <Plus size={16} />
            Nouvel événement
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {loadingEvents ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
              ))
            ) : events.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Camera size={32} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/40 text-sm">Aucun événement encore.</p>
                <p className="text-white/25 text-xs mt-1">Créez votre premier événement !</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id === selectedEvent?.id ? null : event)}
                  className={`relative p-4 rounded-2xl border cursor-pointer transition-all hover:border-amber-400/30 group ${
                    selectedEvent?.id === event.id
                      ? 'bg-amber-400/10 border-amber-400/40'
                      : 'bg-white/3 border-white/8 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate pr-2">{event.name}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {event.date && (
                          <span className="flex items-center gap-1 text-white/40 text-xs">
                            <Calendar size={10} />
                            {formatDate(event.date)}
                          </span>
                        )}
                        {event.venue && (
                          <span className="flex items-center gap-1 text-white/40 text-xs">
                            <MapPin size={10} />
                            {event.venue}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event); }}
                        className="p-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                      <ChevronRight size={14} className={`text-amber-400 transition-transform ${selectedEvent?.id === event.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            {!selectedEvent ? (
              <div className="flex flex-col items-center justify-center h-64 rounded-3xl bg-white/2 border border-white/5">
                <Images size={36} className="text-white/15 mb-3" />
                <p className="text-white/30 text-sm">Sélectionnez un événement</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-5 rounded-3xl bg-white/3 border border-white/8">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                      <h2 className="text-white font-bold text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {selectedEvent.name}
                      </h2>
                      {selectedEvent.description && (
                        <p className="text-white/50 text-sm mb-3">{selectedEvent.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mb-4">
                        {selectedEvent.date && (
                          <span className="flex items-center gap-1.5 text-white/50 text-xs">
                            <Calendar size={12} className="text-amber-400" />
                            {formatDate(selectedEvent.date)}
                          </span>
                        )}
                        {selectedEvent.venue && (
                          <span className="flex items-center gap-1.5 text-white/50 text-xs">
                            <MapPin size={12} className="text-amber-400" />
                            {selectedEvent.venue}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-white/50 text-xs">
                          <Images size={12} className="text-amber-400" />
                          {photos.length} photo{photos.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-xs hover:from-amber-300 hover:to-amber-400 transition-all"
                      >
                        <ImagePlus size={14} />
                        Publier des photos
                      </button>
                    </div>
                    <div className="flex-shrink-0">
                      <QRDisplay slug={selectedEvent.slug} eventName={selectedEvent.name} />
                    </div>
                  </div>
                </div>

                {loadingPhotos ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : photos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 rounded-3xl bg-white/2 border border-dashed border-white/10">
                    <Camera size={28} className="text-white/15 mb-2" />
                    <p className="text-white/25 text-sm">Aucune photo publiée</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <PhotoCard
                          photo={photo}
                          guestId="photographer"
                          onLike={() => {}}
                          onUnlike={() => {}}
                          onClick={() => {}}
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 text-white/60 text-[10px]">
                            <Clock size={8} />
                            {getDaysRemaining(photo.expires_at)}j
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeletePhoto(photo)}
                          disabled={deletingPhoto === photo.id}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-400/20 disabled:opacity-50"
                        >
                          {deletingPhoto === photo.id
                            ? <div className="w-3 h-3 border border-rose-400 border-t-transparent rounded-full animate-spin" />
                            : <Trash2 size={12} />
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateEventModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onCreated={loadEvents}
        />
      )}

      {showUploadModal && selectedEvent && (
        <UploadModal
          eventId={selectedEvent.id}
          user={user}
          onClose={() => setShowUploadModal(false)}
          onUploaded={() => { loadPhotos(selectedEvent.id); }}
        />
      )}
    </div>
  );
}
