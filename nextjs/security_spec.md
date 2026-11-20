# Security Specification — BookManager Firestore Rules

## 1. Data Invariants
1. **Identity Ownership**: Every document in `/books/{bookId}` MUST have `ownerId == request.auth.uid`. A user can only `get`, `list`, `create`, `update`, or `delete` their own books.
2. **Verified Account Gate**: All writes (`create`, `update`, `delete`) require `request.auth != null && request.auth.token.email_verified == true`.
3. **Strict Schema & No Shadow Fields**: Only keys `['titre', 'auteur', 'annee', 'ownerId', 'createdAt']` are allowed, with `['titre', 'auteur', 'ownerId', 'createdAt']` required.
4. **Input Boundaries**:
   - `bookId` must match `^[a-zA-Z0-9_\-]+$` and be `<= 128` chars.
   - `titre` must be a non-empty string (`1 <= size <= 200`).
   - `auteur` must be a non-empty string (`1 <= size <= 150`).
   - `annee`, when present, must be an `int` between `0` and `2100`.
5. **Immutable & Server-Enforced Fields**:
   - On `create`, `createdAt` MUST equal `request.time`.
   - On `update`, `ownerId` and `createdAt` MUST remain identical to `existing()`, and `affectedKeys().hasOnly(['titre', 'auteur', 'annee'])`.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated List**: `list /books` with `auth == null`.
2. **Unauthenticated Create**: `create /books/book1` with valid payload and `auth == null`.
3. **Unverified Email Create**: `create /books/book1` with `auth.token.email_verified == false`.
4. **Identity Spoofing on Create**: `create /books/book1` by `userA` with `ownerId: "userB"`.
5. **Shadow Field Injection on Create**: `create /books/book1` including `"isAdmin": true`.
6. **Client Timestamp Forgery**: `create /books/book1` with `createdAt` set to a past client timestamp instead of `request.time`.
7. **Empty Required Field**: `create /books/book1` with `titre: ""` or `auteur: ""`.
8. **Resource Exhaustion (1MB String)**: `create /books/book1` with `titre` of length 5000 chars.
9. **Invalid Year Type/Range**: `create /books/book1` with `annee: "2024"` (string) or `annee: 9999`.
10. **ID Poisoning**: `create /books/bad$id` with invalid characters or length > 128.
11. **Cross-User Read/Update/Delete**: `userB` attempting `get`, `update`, or `delete` on `userA`'s `/books/book1`.
12. **Immutable Field Mutation on Update**: `userA` attempting `update` on `/books/book1` modifying `ownerId` or `createdAt`, or adding a ghost field.
