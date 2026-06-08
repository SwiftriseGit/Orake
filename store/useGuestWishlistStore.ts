  import { create } from 'zustand';

const STORAGE_KEY = 'orake_guest_wishlist';

function loadFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(slugs: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

interface GuestWishlistState {
  slugs: string[];
  hydrated: boolean;
  hydrate: () => void;
  toggle: (slug: string) => boolean; // returns true if added, false if removed
  has: (slug: string) => boolean;
  clear: () => void;
  getSlugs: () => string[];
}

export const useGuestWishlistStore = create<GuestWishlistState>((set, get) => ({
  slugs: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const slugs = loadFromStorage();
    set({ slugs, hydrated: true });
  },

  toggle: (slug: string) => {
    const current = get().slugs;
    const exists = current.includes(slug);
    const next = exists
      ? current.filter(s => s !== slug)
      : [...current, slug];
    set({ slugs: next });
    saveToStorage(next);
    return !exists; // true = added, false = removed
  },

  has: (slug: string) => {
    return get().slugs.includes(slug);
  },

  clear: () => {
    set({ slugs: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  getSlugs: () => get().slugs,
}));
