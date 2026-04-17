import { useState } from 'react';
import { Copy, Check, ExternalLink, MessageCircle, Share2 } from 'lucide-react';
import { getEventUrl } from '../lib/utils';

interface QRDisplayProps {
  slug: string;
  eventName: string;
}

export default function QRDisplay({ slug, eventName }: QRDisplayProps) {
  const [copied, setCopied] = useState(false);
  const url = getEventUrl(slug);
  
  // Message personnalisé pour le partage
  const shareText = encodeURIComponent(`Découvrez les photos de l'événement "${eventName}" ici : ${url}`);
  const shareUrl = encodeURIComponent(url);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=0d0d0d&color=C9A84C&format=png&margin=10`;

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Affichage du QR Code */}
      <div className="relative p-3 rounded-2xl bg-[#0d0d0d] border border-amber-400/30 shadow-[0_0_30px_rgba(201,168,76,0.15)]">
        <img
          src={qrUrl}
          alt={`QR Code pour ${eventName}`}
          className="w-44 h-44 rounded-lg"
        />
      </div>

      <p className="text-white/40 text-xs text-center max-w-[180px] leading-relaxed">
        Partagez le lien ou faites scanner ce code pour accéder à la galerie
      </p>

      {/* Boutons de partage direct */}
      <div className="flex gap-2 w-full">
        <a
          href={`https://wa.me/?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-xs transition-all font-medium"
        >
          <MessageCircle size={14} />
          WhatsApp
        </a>
       <a
  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
  target="_blank"
  rel="noopener noreferrer"
  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] text-xs transition-all font-medium"
>
  <Share2 size={14} /> {/* On utilise Share2 à la place de Facebook */}
  Facebook
</a>
      </div>

      {/* Actions secondaires (Copier / Ouvrir) */}
      <div className="flex gap-2 w-full">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs transition-all"
        >
          {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          {copied ? 'Copié !' : 'Copier le lien'}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs transition-all"
        >
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}