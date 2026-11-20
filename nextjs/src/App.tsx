/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppRoute, TopBar } from './components/TopBar';
import { AuthProvider } from './context/AuthContext';
import { useBooks } from './hooks/useBooks';
import { BooksPage } from './pages/BooksPage';
import { HomePage } from './pages/HomePage';

function normalizeRoute(pathname: string): AppRoute {
  return pathname.startsWith('/books') ? '/books' : '/';
}

function BookManagerShell() {
  const [route, setRoute] = useState<AppRoute>(() =>
    normalizeRoute(window.location.pathname)
  );
  const { books, loading, error, addBook, updateBook, deleteBook } = useBooks();

  useEffect(() => {
    const handlePopState = () => {
      setRoute(normalizeRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((nextRoute: AppRoute) => {
    if (window.location.pathname !== nextRoute) {
      window.history.pushState({}, '', nextRoute);
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1E293B]">
      <TopBar currentRoute={route} onNavigate={navigate} />

      <div className="flex-1">
        {route === '/' ? (
          <HomePage
            books={books}
            booksLoading={loading}
            onNavigate={navigate}
          />
        ) : (
          <BooksPage
            books={books}
            loading={loading}
            error={error}
            onAddBook={addBook}
            onUpdateBook={updateBook}
            onDeleteBook={deleteBook}
          />
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>BookManager — Une bibliothèque numérique simple, moderne et efficace.</span>
          <div className="flex items-center gap-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="hover:text-[#1E293B] transition-colors"
            >
              Accueil
            </a>
            <a
              href="/books"
              onClick={(e) => {
                e.preventDefault();
                navigate('/books');
              }}
              className="hover:text-[#1E293B] transition-colors"
            >
              Bibliothèque
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BookManagerShell />
      </AuthProvider>
    </ErrorBoundary>
  );
}
