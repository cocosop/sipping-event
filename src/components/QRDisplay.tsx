import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { getEventUrl } from '../lib/utils';

interface QRDisplayProps {
  slug: string;
  eventName: string;
}

export default function QRDisplay({ slug, eventName }: QRDisplayProps) {
  const [copied, setCopied] = useState(false);
  const url = getEventUrl(slug);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=0d0d0d&color=C9A84C&format=png&margin=10`;

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative p-3 rounded-2xl bg-[#0d0d0d] border border-amber-400/30 shadow-[0_0_30px_rgba(201,168,76,0.15)]">
        <img
          src={qrUrl}
          alt={`QR Code pour ${eventName}`}
          className="w-44 h-44 rounded-lg"
        />
        <div className="absolute inset-3 pointer-events-none rounded-lg" />
      </div>
      <p className="text-white/40 text-xs text-center max-w-[180px] leading-relaxed">
        Les invités scannent ce QR code pour accéder à la galerie
      </p>
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
