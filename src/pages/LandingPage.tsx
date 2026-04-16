import { Camera, QrCode, Heart, Download, Clock, Star } from 'lucide-react';
import Logo from '../components/Logo';

interface LandingPageProps {
  onGoToAuth: () => void;
}

export default function LandingPage({ onGoToAuth }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden">
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-rose-400/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
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

          <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Bienvenue sur Eipic/Casual Nights la plateforme photos vidéos qui  connecte les photographes aux invités. 
            Souvenirs partagés, likés, commentés et téléchargés en un instant
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGoToAuth}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-base hover:from-amber-300 hover:to-amber-400 transition-all shadow-[0_0_30px_rgba(201,168,76,0.3)] hover:shadow-[0_0_40px_rgba(201,168,76,0.5)]"
            >
              Espace Photographe
            </button>
            <a
              href="#features"
              className="px-8 py-4 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-base transition-all"
            >
              En savoir plus
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-8 rounded-full bg-gradient-to-b from-amber-400 to-transparent opacity-60"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Comment ça fonctionne
            </h2>
            <p className="text-white/40 text-base max-w-xl mx-auto">
              Simple, élégant, instantané.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: 'Le photographe publie',
                desc: "Créez un événement, obtenez un QR code unique et publiez vos plus belles photos directement depuis l'interface Bliss.",
                color: 'from-amber-400 to-amber-600',
              },
              {
                icon: QrCode,
                title: "L'invité scanne",
                desc: "Chaque invité scanne le QR code pour accéder instantanément à la galerie privée de l'événement. Aucune application à installer.",
                color: 'from-rose-400 to-rose-600',
              },
              {
                icon: Heart,
                title: 'Likez & partagez',
                desc: 'Les invités likent, commentent et téléchargent leurs photos préférées. Les souvenirs vivent pour toujours.',
                color: 'from-sky-400 to-sky-600',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-3xl bg-white/3 border border-white/8 hover:border-white/15 transition-all hover:bg-white/5 group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon size={22} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {item.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-amber-400/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Tout ce dont vous avez besoin
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: Heart, label: 'Likes', desc: 'Anonymes & instantanés' },
              { icon: Download, label: 'Téléchargement', desc: 'Photos en haute qualité' },
              { icon: Star, label: 'Commentaires', desc: 'Réactions en temps réel' },
              { icon: Clock, label: '7 jours', desc: 'Suppression automatique' },
            ].map((feat) => (
              <div key={feat.label} className="p-5 rounded-2xl bg-white/3 border border-white/8 text-center">
                <feat.icon size={22} className="mx-auto mb-3 text-amber-400" />
                <p className="text-white font-semibold text-sm">{feat.label}</p>
                <p className="text-white/40 text-xs mt-1">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Prêt à capturer la magie ?
          </h2>
          <p className="text-white/40 text-base mb-8">
            Rejoignez Bliss et offrez à vos invités une expérience photo inoubliable.
          </p>
          <button
            onClick={onGoToAuth}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-base hover:from-amber-300 hover:to-amber-400 transition-all shadow-[0_0_30px_rgba(201,168,76,0.3)]"
          >
            Commencer gratuitement
          </button>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <Logo size="sm" />
        <p className="text-white/20 text-xs mt-4">
          © 2024 Bliss — Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
