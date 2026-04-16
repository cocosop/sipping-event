import logoImg from '../assets/logo2.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export default function Logo({ size = 'md', variant = 'light' }: LogoProps) {
  const sizes = {
    // Icone plus grande, texte plus petit
    sm: { icon: 35, text: 'text-xs', sub: 'text-[0.4rem]', gap: 'gap-1.5' },
    md: { icon: 52, text: 'text-sm', sub: 'text-[0.5rem]', gap: 'gap-2' },
    lg: { icon: 70, text: 'text-lg', sub: 'text-[0.65rem]', gap: 'gap-3' },
  };

  const s = sizes[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-gray-950';
  const subColor = variant === 'light' ? 'text-amber-400' : 'text-amber-600';

  return (
    <div className={`flex items-center ${s.gap}`}>
      {/* Logo agrandi */}
      <img
        src={logoImg}
        style={{ 
          width: s.icon, 
          height: s.icon,
          filter: variant === 'light' ? 'brightness(1.1) contrast(1.1)' : 'none',
        }}
        className="object-contain flex-shrink-0"
        alt="Logo"
      />
      
      {/* Texte rapproché et plus petit */}
      <div className="flex flex-col justify-center space-y-1">
        <span
          className={`font-semibold leading-tight ${s.text} ${textColor}`}
          style={{ 
            fontFamily: "'Playfair Display', serif",
            letterSpacing: '0.02em'
          }}
        >
          Casual Nights
        </span>
        
        <span
          className={`font-medium tracking-[0.2em] uppercase ${s.sub} ${subColor}`}
          style={{ 
            fontFamily: "'Inter', sans-serif",
            lineHeight: '1'
          }}
        >
          By BassTechnologies
        </span>
      </div>
    </div>
  );
}