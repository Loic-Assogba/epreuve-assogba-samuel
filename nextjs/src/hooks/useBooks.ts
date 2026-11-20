import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/firestoreErrors';
import { BOOK_LIMITS, Book, BookFormValues } from '../types/book';

interface UseBooksResult {
  books: Book[];
  loading: boolean;
  error: string | null;
  addBook: (values: BookFormValues) => Promise<Book>;
  updateBook: (bookId: string, values: BookFormValues) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
}

function validateAndSanitizeBookValues(values: BookFormValues): {
  titre: string;
  auteur: string;
  annee: number | null;
} {
  const titre = values.titre.trim().slice(0, BOOK_LIMITS.TITRE_MAX);
  const auteur = values.auteur.trim().slice(0, BOOK_LIMITS.AUTEUR_MAX);

  if (titre.length < BOOK_LIMITS.TITRE_MIN) {
    throw new Error('Le titre du livre est obligatoire.');
  }
  if (auteur.length < BOOK_LIMITS.AUTEUR_MIN) {
    throw new Error("Le nom de l'auteur est obligatoire.");
  }

  const rawAnnee = values.annee.trim();
  let annee: number | null = null;
  if (rawAnnee !== '') {
    const parsed = Number(rawAnnee);
    if (
      !Number.isInteger(parsed) ||
      parsed < BOOK_LIMITS.ANNEE_MIN ||
      parsed > BOOK_LIMITS.ANNEE_MAX
    ) {
      throw new Error(
        `L'année de publication doit être un nombre entier entre ${BOOK_LIMITS.ANNEE_MIN} et ${BOOK_LIMITS.ANNEE_MAX}.`
      );
    }
    annee = parsed;
  }

  return { titre, auteur, annee };
}

export function useBooks(): UseBooksResult {
  const { user, authReady } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) {
      setLoading(true);
      return;
    }

    if (!user) {
      setBooks([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const booksRef = collection(db, 'books');
    const q = query(booksRef, where('ownerId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Book[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const rawDate = data.createdAt as Timestamp | null | undefined;
          return {
            id: docSnap.id,
            titre: typeof data.titre === 'string' ? data.titre : '',
            auteur: typeof data.auteur === 'string' ? data.auteur : '',
            annee: typeof data.annee === 'number' ? data.annee : null,
            ownerId: typeof data.ownerId === 'string' ? data.ownerId : user.uid,
            createdAt: rawDate ? rawDate.toDate() : null,
          };
        });

        items.sort((a, b) => {
          const timeA = a.createdAt ? a.createdAt.getTime() : Date.now();
          const timeB = b.createdAt ? b.createdAt.getTime() : Date.now();
          return timeB - timeA;
        });

        setBooks(items);
        setLoading(false);
      },
      (snapshotErr) => {
        setLoading(false);
        setError(
          'Impossible de charger les livres pour le moment. Vérifiez votre connexion et vos autorisations.'
        );
        try {
          handleFirestoreError(snapshotErr, OperationType.LIST, 'books');
        } catch {
          // Structured error already logged by handleFirestoreError
        }
      }
    );

    return () => unsubscribe();
  }, [authReady, user]);

  const addBook = useCallback(
    async (values: BookFormValues): Promise<Book> => {
      if (!user) {
        throw new Error('Vous devez être connecté pour ajouter un livre.');
      }
      const { titre, auteur, annee } = validateAndSanitizeBookValues(values);

      const payload: Record<string, unknown> = {
        titre,
        auteur,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      };
      if (annee !== null) {
        payload.annee = annee;
      }

      try {
        const docRef = await addDoc(collection(db, 'books'), payload);
        return {
          id: docRef.id,
          titre,
          auteur,
          annee,
          ownerId: user.uid,
          createdAt: new Date(),
        };
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'books');
      }
    },
    [user]
  );

  const updateBook = useCallback(
    async (bookId: string, values: BookFormValues): Promise<void> => {
      if (!user) {
        throw new Error('Vous devez être connecté pour modifier un livre.');
      }
      const { titre, auteur, annee } = validateAndSanitizeBookValues(values);
      const docPath = `books/${bookId}`;

      try {
        await updateDoc(doc(db, 'books', bookId), {
          titre,
          auteur,
          annee: annee !== null ? annee : deleteField(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, docPath);
      }
    },
    [user]
  );

  const deleteBook = useCallback(
    async (bookId: string): Promise<void> => {
      if (!user) {
        throw new Error('Vous devez être connecté pour supprimer un livre.');
      }
      const docPath = `books/${bookId}`;

      try {
        await deleteDoc(doc(db, 'books', bookId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    },
    [user]
  );

  return {
    books,
    loading,
    error,
    addBook,
    updateBook,
    deleteBook,
  };
}
