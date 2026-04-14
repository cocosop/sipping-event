interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export default function Logo({ size = 'md', variant = 'light' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg', gap: 'gap-2' },
    md: { icon: 40, text: 'text-2xl', gap: 'gap-2.5' },
    lg: { icon: 60, text: 'text-4xl', gap: 'gap-3' },
  };

  const s = sizes[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';

  return (
    <div className={`flex items-center ${s.gap}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D87A" />
            <stop offset="50%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#9D7A2A" />
          </linearGradient>
          <linearGradient id="rose-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4A7B5" />
            <stop offset="100%" stopColor="#E07891" />
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r="28" fill="url(#gold-grad)" opacity="0.15" />
        <circle cx="30" cy="30" r="20" fill="url(#gold-grad)" opacity="0.25" />
        <path
          d="M30 12 L34 24 L47 24 L37 32 L41 44 L30 36 L19 44 L23 32 L13 24 L26 24 Z"
          fill="url(#gold-grad)"
        />
        <circle cx="30" cy="30" r="5" fill="url(#rose-grad)" />
      </svg>
      <span
        className={`font-bold tracking-[0.15em] uppercase ${s.text} ${textColor}`}
        style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.2em' }}
      >
        Bliss
      </span>
    </div>
  );
}
