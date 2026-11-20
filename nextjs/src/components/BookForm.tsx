import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';
import { BOOK_LIMITS, BookFormValues } from '../types/book';

interface BookFormProps {
  onAddBook: (values: BookFormValues) => Promise<unknown>;
}

export function BookForm({ onAddBook }: BookFormProps) {
  const [titre, setTitre] = useState('');
  const [auteur, setAuteur] = useState('');
  const [annee, setAnnee] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedTitre = titre.trim();
    const trimmedAuteur = auteur.trim();
    const trimmedAnnee = annee.trim();

    if (!trimmedTitre) {
      setErrorMsg('Veuillez saisir le titre du livre.');
      return;
    }
    if (!trimmedAuteur) {
      setErrorMsg("Veuillez saisir le nom de l'auteur.");
      return;
    }
    if (trimmedAnnee !== '') {
      const parsedYear = Number(trimmedAnnee);
      if (
        !Number.isInteger(parsedYear) ||
        parsedYear < BOOK_LIMITS.ANNEE_MIN ||
        parsedYear > BOOK_LIMITS.ANNEE_MAX
      ) {
        setErrorMsg(
          `L'année doit être un entier compris entre ${BOOK_LIMITS.ANNEE_MIN} et ${BOOK_LIMITS.ANNEE_MAX}.`
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      await onAddBook({
        titre: trimmedTitre,
        auteur: trimmedAuteur,
        annee: trimmedAnnee,
      });
      setTitre('');
      setAuteur('');
      setAnnee('');
      setSuccessMsg(`« ${trimmedTitre} » a été ajouté à la bibliothèque.`);
    } catch (err) {
      const message =
        err instanceof Error && !err.message.startsWith('{')
          ? err.message
          : "Impossible d'enregistrer ce livre. Veuillez réessayer.";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="book-form-heading"
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="mb-5">
        <h2
          id="book-form-heading"
          className="font-display text-lg font-semibold text-[#1E293B]"
        >
          Ajouter un livre
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Les champs marqués d’un astérisque sont obligatoires.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="book-titre"
            className="block text-sm font-medium text-[#1E293B] mb-1.5"
          >
            Titre <span className="text-[#F97316]">*</span>
          </label>
          <input
            id="book-titre"
            name="titre"
            type="text"
            required
            maxLength={BOOK_LIMITS.TITRE_MAX}
            value={titre}
            onChange={(e) => {
              setTitre(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Ex. L'Étranger"
            className="w-full px-3.5 py-2.5 text-sm text-[#1E293B] bg-[#F8FAFC] border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#F97316] transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="book-auteur"
            className="block text-sm font-medium text-[#1E293B] mb-1.5"
          >
            Auteur <span className="text-[#F97316]">*</span>
          </label>
          <input
            id="book-auteur"
            name="auteur"
            type="text"
            required
            maxLength={BOOK_LIMITS.AUTEUR_MAX}
            value={auteur}
            onChange={(e) => {
              setAuteur(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Ex. Albert Camus"
            className="w-full px-3.5 py-2.5 text-sm text-[#1E293B] bg-[#F8FAFC] border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#F97316] transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="book-annee"
            className="block text-sm font-medium text-[#1E293B] mb-1.5"
          >
            Année <span className="text-slate-400 font-normal">(facultatif)</span>
          </label>
          <input
            id="book-annee"
            name="annee"
            type="number"
            inputMode="numeric"
            min={BOOK_LIMITS.ANNEE_MIN}
            max={BOOK_LIMITS.ANNEE_MAX}
            value={annee}
            onChange={(e) => {
              setAnnee(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Ex. 1942"
            className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums text-[#1E293B] bg-[#F8FAFC] border border-slate-200 rounded-lg placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#F97316] transition-colors"
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

        {successMsg && (
          <div
            role="status"
            className="p-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg"
          >
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{submitting ? 'Enregistrement...' : 'Ajouter'}</span>
        </button>
      </form>
    </section>
  );
}
