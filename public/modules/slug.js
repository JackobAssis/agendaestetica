import {
    getFirebaseDB,
    collection,
    query,
    where,
    getDocs
} from './firebase.js';

/**
 * Transform text into a URL-friendly slug.
 * keeps letters, numbers and hyphens.
 */
export function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // spaces to hyphen
        .replace(/[^a-z0-9\-]/g, '')    // remove invalid chars
        .replace(/\-\-+/g, '-')        // collapse multiple hyphens
        .replace(/^-+|-+$/g, '');        // trim hyphens
}

/**
 * Generate a slug based on `base` that does not conflict with
 * any existing document in `empresas`.
 *
 * The returned slug will be unique; if the base is already taken
 * a numeric suffix will be appended (foo, foo-1, foo-2, ...).
 */
export async function generateUniqueSlug(base) {
    const db = getFirebaseDB();
    let candidate = slugify(base);
    if (!candidate) {
        // fallback to random string if slugify failed
        candidate = Math.random().toString(36).substring(2, 8);
    }

    let counter = 0;
    while (true) {
        const q = query(
            collection(db, 'empresas'),
            where('slug', '==', candidate)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return candidate;
        }
        counter += 1;
        candidate = `${slugify(base)}-${counter}`;
    }
}

/**
 * Check if a slug is available (or belongs to the provided currentId).
 *
 * @param {string} slug
 * @param {string|null} currentId optionally ignore this document id when checking
 */
export async function isSlugAvailable(slug, currentId = null) {
    if (!slug) return false;
    const db = getFirebaseDB();
    const q = query(
        collection(db, 'empresas'),
        where('slug', '==', slug)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return true;
    if (currentId && snapshot.docs.length === 1 && snapshot.docs[0].id === currentId) {
        return true;
    }
    return false;
}
