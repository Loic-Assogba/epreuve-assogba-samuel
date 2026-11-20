import { FormEvent, useEffect, useState } from 'react';
import { Check, Copy, Pencil, Trash2, X } from 'lucide-react';
import { BOOK_LIMITS, Book, BookFormValues } from '../types/book';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onUpdateBook: (bookId: string, values: BookFormValues) => Promise<void>;
  onDeleteBook: (bookId: string) => Promise<void>;
}

function formatDateTime(date: Date | null): string {
  if (!date) return 'Enregistrement en cours...';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function BookDetailModal({
  book,
  onClose,
  onUpdateBook,
  onDeleteBook,
}: BookDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [titre, setTitre] = useState('');
  const [auteur, setAuteur] = useState('');
  const [annee, setAnnee] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (book) {
      setTitre(book.titre);
      setAuteur(book.auteur);
      setAnnee(book.annee !== null ? String(book.annee) : '');
      setEditing(false);
      setConfirmingDelete(false);
      setErrorMsg(null);
      setCopiedId(false);
    }
  }, [book]);

  useEffect(() => {
    if (!book) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book, onClose]);

  if (!book) return null;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(book.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1800);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedTitre = titre.trim();
    const trimmedAuteur = auteur.trim();
    const trimmedAnnee = annee.trim();

    if (!trimmedTitre) {
      setErrorMsg('Le titre est obligatoire.');
      return;
    }
    if (!trimmedAuteur) {
      setErrorMsg("Le nom de l'auteur est obligatoire.");
      return;
    }
    if (trimmedAnnee !== '') {
      const parsed = Number(trimmedAnnee);
      if (
        !Number.isInteger(parsed) ||
        parsed < BOOK_LIMITS.ANNEE_MIN ||
        parsed > BOOK_LIMITS.ANNEE_MAX
      ) {
        setErrorMsg(
          `L'année doit être comprise entre ${BOOK_LIMITS.ANNEE_MIN} et ${BOOK_LIMITS.ANNEE_MAX}.`
        );
        return;
      }
    }

    setBusy(true);
    try {
      await onUpdateBook(book.id, {
        titre: trimmedTitre,
        auteur: trimmedAuteur,
        annee: trimmedAnnee,
      });
      setEditing(false);
    } catch (err) {
      setErrorMsg(
        err instanceof Error && !err.message.startsWith('{')
          ? err.message
          : 'Impossible de mettre à jour ce livre.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setErrorMsg(null);
    try {
      await onDeleteBook(book.id);
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error && !err.message.startsWith('{')
          ? err.message
          : 'Impossible de supprimer ce livre.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/45 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-detail-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200">
          <div className="min-w-0">
            <p className="text-xs font-mono text-slate-500 tabular-nums truncate">
              ID · {book.id}
            </p>
            <h2
              id="book-detail-title"
              className="font-display text-xl font-semibold text-[#1E293B] mt-1 break-words"
            >
              {editing ? 'Modifier le livre' : book.titre}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fiche du livre"
            className="p-2 text-slate-400 hover:text-[#1E293B] hover:bg-slate-100 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {editing ? (
          <form onSubmit={(e) => void handleSave(e)} className="p-6 space-y-4">
            <div>
              <label
                htmlFor="edit-titre"
                className="block text-sm font-medium text-[#1E293B] mb-1.5"
              >
                Titre <span className="text-[#F97316]">*</span>
              </label>
              <input
                id="edit-titre"
                type="text"
                required
                maxLength={BOOK_LIMITS.TITRE_MAX}
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm text-[#1E293B] bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#F97316]"
              />
            </div>

            <div>
              <label
                htmlFor="edit-auteur"
                className="block text-sm font-medium text-[#1E293B] mb-1.5"
              >
                Auteur <span className="text-[#F97316]">*</span>
              </label>
              <input
                id="edit-auteur"
                type="text"
                required
                maxLength={BOOK_LIMITS.AUTEUR_MAX}
                value={auteur}
                onChange={(e) => setAuteur(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm text-[#1E293B] bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#F97316]"
              />
            </div>

            <div>
              <label
                htmlFor="edit-annee"
                className="block text-sm font-medium text-[#1E293B] mb-1.5"
              >
                Année <span className="text-slate-400 font-normal">(facultatif)</span>
              </label>
              <input
                id="edit-annee"
                type="number"
                min={BOOK_LIMITS.ANNEE_MIN}
                max={BOOK_LIMITS.ANNEE_MAX}
                value={annee}
                onChange={(e) => setAnnee(e.target.value)}
                placeholder="Laisser vide si inconnue"
                className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums text-[#1E293B] bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#F97316]"
              />
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
              >
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setErrorMsg(null);
                }}
                disabled={busy}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#1E293B] hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 text-sm font-medium text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
              >
                {busy ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6">
            <dl className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
              <div className="px-4 py-3 flex items-center justify-between gap-4">
                <dt className="text-xs font-medium text-slate-500">ID</dt>
                <dd className="flex items-center gap-2 text-xs font-mono tabular-nums text-[#1E293B]">
                  <span className="truncate max-w-[240px]">{book.id}</span>
                  <button
                    type="button"
                    onClick={() => void handleCopyId()}
                    aria-label="Copier l'identifiant"
                    className="p-1 text-slate-400 hover:text-[#1E293B] rounded transition-colors cursor-pointer"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>
                </dd>
              </div>
              <div className="px-4 py-3 flex items-baseline justify-between gap-4">
                <dt className="text-xs font-medium text-slate-500 shrink-0">
                  Titre
                </dt>
                <dd className="text-sm font-medium text-[#1E293B] text-right">
                  {book.titre}
                </dd>
              </div>
              <div className="px-4 py-3 flex items-baseline justify-between gap-4">
                <dt className="text-xs font-medium text-slate-500 shrink-0">
                  Auteur
                </dt>
                <dd className="text-sm text-[#1E293B] text-right">
                  {book.auteur}
                </dd>
              </div>
              <div className="px-4 py-3 flex items-baseline justify-between gap-4">
                <dt className="text-xs font-medium text-slate-500 shrink-0">
                  Année de publication
                </dt>
                <dd className="text-sm font-mono tabular-nums text-[#1E293B] text-right">
                  {book.annee !== null ? book.annee : 'Non renseignée'}
                </dd>
              </div>
              <div className="px-4 py-3 flex items-baseline justify-between gap-4">
                <dt className="text-xs font-medium text-slate-500 shrink-0">
                  Date de création
                </dt>
                <dd className="text-sm tabular-nums text-slate-600 text-right">
                  {formatDateTime(book.createdAt)}
                </dd>
              </div>
            </dl>

            {errorMsg && (
              <div
                role="alert"
                className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
              >
                {errorMsg}
              </div>
            )}

            {confirmingDelete ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm text-red-800 font-medium">
                  Supprimer définitivement ce livre ?
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={busy}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={busy}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
                  >
                    {busy ? 'Suppression...' : 'Confirmer'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Supprimer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#1E293B] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Pencil className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Modifier</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
