interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ size = 'md' }: LogoProps) {
  const sizes = {
    sm: { svgSize: 36, textMain: 'text-sm', textSub: '0.52em', gap: 'gap-2' },
    md: { svgSize: 52, textMain: 'text-lg', textSub: '0.58em', gap: 'gap-2.5' },
    lg: { svgSize: 76, textMain: 'text-2xl', textSub: '0.65em', gap: 'gap-3' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center ${s.gap}`}>
      <svg
        width={s.svgSize}
        height={s.svgSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="46" stroke="#C9A84C" strokeWidth="2.5" fill="none" />
        <path
          d="M50 18 C36 18 26 30 26 44 L26 72 L74 72 L74 44 C74 30 64 18 50 18 Z"
          stroke="#C9A84C"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M50 14 C34 14 22 28 22 44 L22 76 L78 76 L78 44 C78 28 66 14 50 14 Z"
          stroke="#C9A84C"
          strokeWidth="1.2"
          strokeOpacity="0.4"
          fill="none"
        />
        <path
          d="M34 42 C34 38 37 35 42 34 L50 33 L58 34 C63 35 66 38 66 42 L58 44 L50 46 L42 44 Z"
          fill="#C9A84C"
          fillOpacity="0.9"
        />
        <path
          d="M42 44 L45 60 L55 60 L58 44 L50 46 Z"
          fill="none"
          stroke="#C9A84C"
          strokeWidth="1.5"
        />
        <line x1="38" y1="62" x2="62" y2="62" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col leading-tight">
        <span
          className={`font-bold text-white ${s.textMain}`}
          style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.03em' }}
        >
          Casual Nights
        </span>
        <span
          className="text-amber-400 uppercase tracking-widest"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: s.textSub, letterSpacing: '0.22em' }}
        >
          By Sipping
        </span>
      </div>
    </div>
  );
}
