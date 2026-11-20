import { useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { BookDetailModal } from '../components/BookDetailModal';
import { BookForm } from '../components/BookForm';
import { useAuth } from '../context/AuthContext';
import { Book, BookFormValues } from '../types/book';

interface BooksPageProps {
  books: Book[];
  loading: boolean;
  error: string | null;
  onAddBook: (values: BookFormValues) => Promise<unknown>;
  onUpdateBook: (bookId: string, values: BookFormValues) => Promise<void>;
  onDeleteBook: (bookId: string) => Promise<void>;
}

type SortOption = 'recent' | 'titre' | 'auteur' | 'annee';

function formatShortDate(date: Date | null): string {
  if (!date) return 'À l’instant';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function BooksPage({
  books,
  loading,
  error,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
}: BooksPageProps) {
  const { user, authReady, authBusy, authError, signInWithGoogle } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const selectedBook = useMemo(
    () => books.find((b) => b.id === selectedBookId) ?? null,
    [books, selectedBookId]
  );

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? books.filter(
          (b) =>
            b.titre.toLowerCase().includes(q) ||
            b.auteur.toLowerCase().includes(q) ||
            (b.annee !== null && String(b.annee).includes(q))
        )
      : books;

    const sorted = [...filtered];
    if (sortBy === 'titre') {
      sorted.sort((a, b) => a.titre.localeCompare(b.titre, 'fr'));
    } else if (sortBy === 'auteur') {
      sorted.sort((a, b) => a.auteur.localeCompare(b.auteur, 'fr'));
    } else if (sortBy === 'annee') {
      sorted.sort((a, b) => (b.annee ?? -1) - (a.annee ?? -1));
    } else {
      sorted.sort((a, b) => {
        const tA = a.createdAt ? a.createdAt.getTime() : Date.now();
        const tB = b.createdAt ? b.createdAt.getTime() : Date.now();
        return tB - tA;
      });
    }
    return sorted;
  }, [books, searchQuery, sortBy]);

  if (!authReady) {
    return (
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="h-8 w-52 bg-slate-200 rounded animate-pulse mb-6" />
        <div className="h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-xl p-8">
          <BookOpen className="w-8 h-8 text-[#F97316] mb-4" aria-hidden="true" />
          <h1 className="font-display text-2xl font-bold text-[#1E293B]">
            Accédez à votre bibliothèque
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Connectez-vous avec votre compte Google pour enregistrer vos livres,
            consulter vos fiches détaillées et retrouver votre collection sur tous
            vos appareils.
          </p>

          {authError && (
            <div
              role="alert"
              className="mt-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
            >
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            disabled={authBusy}
            className="mt-6 px-5 py-2.5 text-sm font-medium text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
          >
            {authBusy ? 'Connexion...' : 'Se connecter avec Google'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-10">
      {/* Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1E293B]">
            Bibliothèque
          </h1>
          <p className="mt-1 text-sm text-slate-500 tabular-nums">
            <span>
              {books.length} {books.length <= 1 ? 'livre enregistré' : 'livres enregistrés'}
            </span>
            {user.email && (
              <>
                <span aria-hidden="true"> · </span>
                <span>{user.email}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un titre ou auteur..."
              aria-label="Rechercher dans la bibliothèque"
              className="w-full sm:w-64 pl-9 pr-3.5 py-2 text-sm text-[#1E293B] bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <select
            aria-label="Trier les livres"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 text-sm text-[#1E293B] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#F97316] cursor-pointer"
          >
            <option value="recent">Plus récents</option>
            <option value="titre">Titre (A–Z)</option>
            <option value="auteur">Auteur (A–Z)</option>
            <option value="annee">Année (décroissante)</option>
          </select>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl"
        >
          {error}
        </div>
      )}

      {/* Main Grid: Book List + Add Form */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Book Table / List */}
        <section
          aria-label="Liste des livres"
          className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden"
        >
          {loading ? (
            <div className="divide-y divide-slate-100">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="p-10 text-center">
              <BookOpen className="w-9 h-9 text-slate-300 mx-auto mb-3" aria-hidden="true" />
              <h2 className="font-display text-base font-semibold text-[#1E293B]">
                Votre bibliothèque est vide
              </h2>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                Utilisez le formulaire ci-contre pour enregistrer votre premier
                livre dans la collection.
              </p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-display text-base font-semibold text-[#1E293B]">
                Aucun livre ne correspond à « {searchQuery} »
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 text-sm font-medium text-[#F97316] hover:text-[#EA580C] cursor-pointer"
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-medium text-slate-500">
                      <th className="py-3 pl-5 pr-3">ID</th>
                      <th className="py-3 px-3">Titre</th>
                      <th className="py-3 px-3">Auteur</th>
                      <th className="py-3 px-3 text-right">Année</th>
                      <th className="py-3 px-3 text-right">Ajouté le</th>
                      <th className="py-3 pl-3 pr-5 text-right">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredBooks.map((book) => (
                      <tr
                        key={book.id}
                        onClick={() => setSelectedBookId(book.id)}
                        className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 pl-5 pr-3 font-mono text-xs text-slate-400 tabular-nums whitespace-nowrap">
                          {book.id.slice(0, 6)}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-[#1E293B]">
                          {book.titre}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          {book.auteur}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                          {book.annee !== null ? book.annee : '—'}
                        </td>
                        <td className="py-3.5 px-3 text-right tabular-nums text-slate-500 whitespace-nowrap">
                          {formatShortDate(book.createdAt)}
                        </td>
                        <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBookId(book.id);
                            }}
                            className="text-xs font-medium text-[#F97316] hover:text-[#EA580C] cursor-pointer"
                          >
                            Consulter
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Compact List */}
              <div className="sm:hidden divide-y divide-slate-100">
                {filteredBooks.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => setSelectedBookId(book.id)}
                    className="w-full text-left px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1E293B] truncate">
                        {book.titre}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate tabular-nums">
                        {book.auteur}
                        {book.annee !== null ? ` · ${book.annee}` : ''}
                        {' · '}
                        {formatShortDate(book.createdAt)}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-[#F97316] shrink-0">
                      Consulter
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Add Book Form */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <BookForm onAddBook={onAddBook} />
        </div>
      </div>

      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBookId(null)}
        onUpdateBook={onUpdateBook}
        onDeleteBook={onDeleteBook}
      />
    </main>
  );
}
