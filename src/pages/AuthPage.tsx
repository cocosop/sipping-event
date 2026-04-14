import { useState } from 'react';
import { Camera, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onBack: () => void;
}

export default function AuthPage({ onSignIn, onSignUp, onBack }: AuthPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await onSignIn(email, password);
      } else {
        await onSignUp(email, password);
        setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setMode('signin');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur s'est produite";
      if (msg.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else if (msg.includes('User already registered')) {
        setError('Un compte existe déjà avec cet email.');
      } else if (msg.includes('Password should be at least')) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
      } else {
        setError(msg);
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-60 h-60 bg-rose-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour
        </button>

        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        <div className="bg-white/3 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Camera size={18} className="text-black" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                {mode === 'signin' ? 'Connexion' : 'Créer un compte'}
              </h1>
              <p className="text-white/40 text-xs">Espace photographe</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="photo@exemple.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50 transition-colors text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs mb-1.5 uppercase tracking-wider">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50 transition-colors text-sm"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-rose-400/10 border border-rose-400/20">
                <p className="text-rose-300 text-xs">{error}</p>
              </div>
            )}

            {success && (
              <div className="px-4 py-3 rounded-xl bg-green-400/10 border border-green-400/20">
                <p className="text-green-300 text-xs">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm hover:from-amber-300 hover:to-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(201,168,76,0.2)]"
            >
              {loading
                ? mode === 'signin' ? 'Connexion...' : 'Création...'
                : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'
              }
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/8 text-center">
            {mode === 'signin' ? (
              <p className="text-white/40 text-sm">
                Pas encore de compte ?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                  className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
                >
                  S'inscrire
                </button>
              </p>
            ) : (
              <p className="text-white/40 text-sm">
                Déjà un compte ?{' '}
                <button
                  onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
                  className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
                >
                  Se connecter
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
