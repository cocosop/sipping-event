import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateSlug } from '../lib/utils';
import type { User } from '@supabase/supabase-js';

interface CreateEventModalProps {
  user: User;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateEventModal({ user, onClose, onCreated }: CreateEventModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    const slug = generateSlug(name);

    const { error: err } = await supabase.from('events').insert({
      name: name.trim(),
      description: description.trim() || null,
      date: date || null,
      venue: venue.trim() || null,
      slug,
      photographer_id: user.id,
    });

    setLoading(false);
    if (err) {
      setError("Erreur lors de la création. Veuillez réessayer.");
      return;
    }
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-semibold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Nouvel événement
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-xs mb-1.5 uppercase tracking-wider">Nom de l'événement *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Gala de fin d'année..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm"
              maxLength={80}
              required
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez l'événement..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm resize-none"
              maxLength={300}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/60 text-xs mb-1.5 uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400/50 transition-colors text-sm"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1.5 uppercase tracking-wider">Lieu</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Paris..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm"
                maxLength={80}
              />
            </div>
          </div>

          {error && <p className="text-rose-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:from-amber-300 hover:to-amber-400 transition-all"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
