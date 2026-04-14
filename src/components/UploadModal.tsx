import { useState, useRef, useCallback } from 'react';
import { X, Upload, ImagePlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface UploadModalProps {
  eventId: string;
  user: User;
  onClose: () => void;
  onUploaded: () => void;
}

interface FileStatus {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  caption: string;
}

export default function UploadModal({ eventId, user, onClose, onUploaded }: UploadModalProps) {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    const imageFiles = newFiles.filter((f) => f.type.startsWith('image/'));
    const mapped: FileStatus[] = imageFiles.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      status: 'pending',
      caption: '',
    }));
    setFiles((prev) => [...prev, ...mapped]);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(Array.from(e.target.files));
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.status === 'done') continue;

      setFiles((prev) => prev.map((item, idx) => idx === i ? { ...item, status: 'uploading' } : item));

      try {
        const ext = f.file.name.split('.').pop() || 'jpg';
        const path = `events/${eventId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from('event-photos')
          .upload(path, f.file, { cacheControl: '3600', upsert: false });

        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from('event-photos')
          .getPublicUrl(path);

        const { error: dbErr } = await supabase.from('photos').insert({
          event_id: eventId,
          storage_path: path,
          url: publicUrl,
          caption: f.caption.trim() || null,
          photographer_id: user.id,
        });

        if (dbErr) throw dbErr;

        setFiles((prev) => prev.map((item, idx) => idx === i ? { ...item, status: 'done' } : item));
      } catch {
        setFiles((prev) => prev.map((item, idx) => idx === i ? { ...item, status: 'error' } : item));
      }
    }

    setUploading(false);
    onUploaded();
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const doneCount = files.filter((f) => f.status === 'done').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#111111] border border-white/10 rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ImagePlus size={18} className="text-amber-400" />
            <h2 className="text-white font-semibold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Publier des photos
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 mb-4 ${
            dragging
              ? 'border-amber-400 bg-amber-400/10'
              : 'border-white/15 hover:border-white/30 hover:bg-white/5'
          }`}
        >
          <Upload size={28} className="mx-auto mb-2 text-white/40" />
          <p className="text-white/60 text-sm">
            Glissez vos photos ici ou <span className="text-amber-400">parcourir</span>
          </p>
          <p className="text-white/30 text-xs mt-1">JPEG, PNG, WEBP — Max 10 Mo par photo</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {files.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
                  <img src={f.preview} alt="" className="w-full h-full object-cover" />
                  {f.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {f.status === 'done' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <CheckCircle2 size={18} className="text-green-400" />
                    </div>
                  )}
                  {f.status === 'error' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <AlertCircle size={18} className="text-rose-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs truncate mb-1.5">{f.file.name}</p>
                  <input
                    type="text"
                    placeholder="Légende (optionnel)"
                    value={f.caption}
                    onChange={(e) => setFiles((prev) => prev.map((item, idx) => idx === i ? { ...item, caption: e.target.value } : item))}
                    disabled={f.status !== 'pending'}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder-white/30 focus:outline-none focus:border-amber-400/40 transition-colors disabled:opacity-50"
                  />
                </div>
                {f.status === 'pending' && (
                  <button
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="p-1 text-white/30 hover:text-white/70 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-all"
          >
            {doneCount > 0 ? 'Fermer' : 'Annuler'}
          </button>
          <button
            onClick={handleUpload}
            disabled={pendingCount === 0 || uploading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:from-amber-300 hover:to-amber-400 transition-all"
          >
            <Upload size={16} />
            {uploading ? 'Publication en cours...' : `Publier ${pendingCount > 0 ? `${pendingCount} photo${pendingCount > 1 ? 's' : ''}` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
