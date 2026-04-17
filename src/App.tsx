import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import type { AppView } from './lib/types';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import PhotographerDashboard from './pages/PhotographerDashboard';
import EventGallery from './pages/EventGallery';

function getEventSlugFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('event');
}

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [view, setView] = useState<AppView>('landing');
  const [eventSlug, setEventSlug] = useState<string | null>(null);

  useEffect(() => {
    const slug = getEventSlugFromUrl();
    if (slug) {
      setEventSlug(slug);
      setView('gallery');
    }
  }, []);

  useEffect(() => {
    if (!loading && user && view === 'auth') {
      setView('dashboard');
    }
    if (!loading && user && view === 'landing' && !eventSlug) {
      setView('dashboard');
    }
  }, [user, loading, view, eventSlug]);

  async function handleSignIn(email: string, password: string) {
    await signIn(email, password);
    setView('dashboard');
  }

  async function handleSignUp(email: string, password: string) {
    await signUp(email, password);
  }

  async function handleSignOut() {
    await signOut();
    setView('landing');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-amber-400/30 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <p
            className="text-white/30 text-sm tracking-widest uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Casual Nights
          </p>
        </div>
      </div>
    );
  }

  if (view === 'gallery' && eventSlug) {
    return <EventGallery slug={eventSlug} />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {view !== 'auth' && (
        <Header
          user={user}
          onSignOut={handleSignOut}
          onGoToDashboard={() => setView('dashboard')}
          onGoToAuth={() => setView('auth')}
          transparent={view === 'landing'}
        />
      )}

      {view === 'landing' && <LandingPage onGoToAuth={() => setView('auth')} />}
      {view === 'auth' && (
        <AuthPage
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onBack={() => setView('landing')}
        />
      )}
      {view === 'dashboard' && user && <PhotographerDashboard user={user} />}
    </div>
  );
}
