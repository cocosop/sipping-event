import { LogOut, Camera, LayoutDashboard } from 'lucide-react';
import Logo from './Logo';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
    user: User | null;
    onSignOut: () => void;
    onGoToDashboard: () => void;
    onGoToAuth: () => void;
    transparent?: boolean;
}

export default function Header({
    user,
    onSignOut,
    onGoToDashboard,
    onGoToAuth,
    transparent = false,
}: HeaderProps) {
    return (
        <header
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${transparent
                    ? 'bg-transparent'
                    : 'bg-black/80 backdrop-blur-xl border-b border-white/10'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                 <button onClick={user ? onGoToDashboard : () => window.location.href = '/'}>
          <Logo size="sm" />
        </button>

                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <button
                                onClick={onGoToDashboard}
                                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                            >
                                <LayoutDashboard size={16} />
                                <span className="hidden sm:inline">Dashboard</span>
                            </button>
                            <button
                                onClick={onSignOut}
                                className="flex items-center gap-2 text-sm text-white/70 hover:text-rose-400 transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Déconnexion</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onGoToAuth}
                            className="flex items-center gap-2 text-sm font-medium text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all px-4 py-2 rounded-full"
                        >
                            <Camera size={15} />
                            Espace Photographe
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
