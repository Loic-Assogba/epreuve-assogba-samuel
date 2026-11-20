import { useAuth } from '../context/AuthContext';

export type AppRoute = '/' | '/books';

interface TopBarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export function TopBar({ currentRoute, onNavigate }: TopBarProps) {
  const { user, authReady, authBusy, signInWithGoogle, signOutUser } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
          className="font-display text-lg font-bold tracking-tight text-[#1E293B] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F97316] rounded-sm"
        >
          BookManager
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Navigation principale"
          className="flex items-center gap-6 text-sm font-medium"
        >
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentRoute === '/'
                ? 'text-[#1E293B] border-[#F97316]'
                : 'text-slate-600 border-transparent hover:text-[#1E293B]'
            }`}
          >
            Accueil
          </a>
          <a
            href="/books"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/books');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentRoute === '/books'
                ? 'text-[#1E293B] border-[#F97316]'
                : 'text-slate-600 border-transparent hover:text-[#1E293B]'
            }`}
          >
            Bibliothèque
          </a>
          {user && (
            <button
              type="button"
              onClick={() => void signOutUser()}
              disabled={authBusy}
              className="hidden sm:inline-block text-slate-500 hover:text-[#1E293B] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              Déconnexion
            </button>
          )}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="shrink-0">
          {!authReady ? (
            <div className="h-9 w-36 bg-slate-200/70 rounded-lg animate-pulse" />
          ) : user ? (
            <button
              type="button"
              onClick={() => onNavigate('/books')}
              className="px-4 py-2 text-sm font-medium text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
            >
              {currentRoute === '/books' ? 'Ma collection' : 'Ouvrir la bibliothèque'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              disabled={authBusy}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1E293B] hover:bg-[#0F172A] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
            >
              {authBusy ? 'Connexion...' : 'Se connecter'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
