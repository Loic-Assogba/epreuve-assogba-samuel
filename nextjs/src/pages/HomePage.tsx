import { useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { AppRoute } from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import { Book } from '../types/book';

interface HomePageProps {
  books: Book[];
  booksLoading: boolean;
  onNavigate: (route: AppRoute) => void;
}

const HERO_IMAGE_PATH = '/src/assets/images/hero_library_desk_1795198153451.jpg';

export function HomePage({ books, booksLoading, onNavigate }: HomePageProps) {
  const { user, authReady, authBusy, authError, signInWithGoogle } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);

  const distinctAuthors = new Set(
    books.map((b) => b.auteur.trim().toLowerCase()).filter(Boolean)
  ).size;
  const latestBook = books[0] ?? null;

  return (
    <main>
      {/* Hero Split */}
      <section className="max-w-[1200px] mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-sm font-medium text-[#F97316] mb-3">
              Bibliothèque numérique personnelle
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#1E293B] leading-[1.12] [text-wrap:balance]">
              BookManager, gérez votre collection de livres avec clarté.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Enregistrez vos nouveaux ouvrages, centralisez leurs informations
              essentielles et consultez votre bibliothèque à tout moment sans
              rechargement de page.
            </p>

            {authError && (
              <div
                role="alert"
                className="mt-5 p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg max-w-lg"
              >
                {authError}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/books')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
              >
                <span>Accéder à la bibliothèque</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>

              {authReady && !user && (
                <button
                  type="button"
                  onClick={() => void signInWithGoogle()}
                  disabled={authBusy}
                  className="px-4 py-3 text-sm font-medium text-[#1E293B] bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
                >
                  {authBusy ? 'Connexion...' : 'Se connecter avec Google'}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] sm:min-h-[360px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              {imageFailed ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600">
                  <BookOpen className="w-10 h-10 text-[#F97316] mb-3" aria-hidden="true" />
                  <p className="font-display text-base font-semibold text-[#1E293B]">
                    BookManager
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Collection numérique organisée
                  </p>
                </div>
              ) : (
                <img
                  src={HERO_IMAGE_PATH}
                  alt="Bureau minimaliste baigné de lumière naturelle avec une pile de livres reliés"
                  referrerPolicy="no-referrer"
                  onError={() => setImageFailed(true)}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Full-width KPI / Total Books Strip */}
      <section
        aria-label="Synthèse de la bibliothèque"
        className="border-y border-slate-200 bg-white"
      >
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 sm:divide-x sm:divide-slate-200">
            <div className="sm:pr-8">
              <p className="text-xs font-medium text-slate-500">
                Total des livres enregistrés
              </p>
              {!authReady || (user && booksLoading) ? (
                <div className="mt-2 h-9 w-24 bg-slate-100 rounded animate-pulse" />
              ) : user ? (
                <p className="mt-1 font-display text-3xl font-bold text-[#1E293B] tabular-nums">
                  {books.length}{' '}
                  <span className="text-base font-normal text-slate-500">
                    {books.length <= 1 ? 'livre' : 'livres'}
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  Connectez-vous pour afficher votre compteur en direct.
                </p>
              )}
            </div>

            <div className="sm:px-8">
              <p className="text-xs font-medium text-slate-500">
                Auteurs répertoriés
              </p>
              {!authReady || (user && booksLoading) ? (
                <div className="mt-2 h-9 w-20 bg-slate-100 rounded animate-pulse" />
              ) : user ? (
                <p className="mt-1 font-display text-3xl font-bold text-[#1E293B] tabular-nums">
                  {distinctAuthors}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-600">—</p>
              )}
            </div>

            <div className="sm:pl-8">
              <p className="text-xs font-medium text-slate-500">
                Dernier ajout
              </p>
              {!authReady || (user && booksLoading) ? (
                <div className="mt-2 h-9 w-48 bg-slate-100 rounded animate-pulse" />
              ) : user && latestBook ? (
                <div className="mt-1.5">
                  <p className="text-base font-semibold text-[#1E293B] truncate">
                    {latestBook.titre}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {latestBook.auteur}
                    {latestBook.annee !== null ? ` · ${latestBook.annee}` : ''}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  {user ? 'Aucun livre enregistré pour le moment.' : '—'}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Feature Overview */}
      <section className="max-w-[1200px] mx-auto px-6 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h2 className="font-display text-base font-semibold text-[#1E293B]">
              01. Enregistrement immédiat
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Ajoutez un ouvrage avec son titre, son auteur et son année de
              publication facultative. La liste se met à jour instantanément.
            </p>
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-[#1E293B]">
              02. Fiches détaillées
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Consultez chaque livre pour retrouver son identifiant unique, son
              auteur, sa date d’édition et sa date d’ajout dans la collection.
            </p>
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-[#1E293B]">
              03. Sauvegarde persistante
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Vos données sont conservées en toute sécurité dans votre espace
              personnel et restent accessibles sur ordinateur, tablette et mobile.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
