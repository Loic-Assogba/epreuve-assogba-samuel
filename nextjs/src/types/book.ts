export const BOOK_LIMITS = {
  TITRE_MIN: 1,
  TITRE_MAX: 200,
  AUTEUR_MIN: 1,
  AUTEUR_MAX: 150,
  ANNEE_MIN: 0,
  ANNEE_MAX: 2100,
} as const;

export interface Book {
  id: string;
  titre: string;
  auteur: string;
  annee: number | null;
  ownerId: string;
  createdAt: Date | null;
}

export interface BookFormValues {
  titre: string;
  auteur: string;
  annee: string;
}
