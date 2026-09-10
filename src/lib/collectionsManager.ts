import { MoodboardCollection } from '../types';

const COLLECTIONS_STORAGE_KEY = 'aura_moodboard_collections_v1';

const DEFAULT_COLLECTIONS: MoodboardCollection[] = [
  {
    id: 'col-spatial-arch',
    name: 'Spatial Architectures',
    description: 'Minimalist brutalist structures, Scandinavian fjords, and parametric glass pavilions.',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    colorTheme: '#3052ff',
    generationIds: ['gen-1', 'gen-6'],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'col-cyberpunk',
    name: 'Neo-Tokyo & Cyberpunk',
    description: 'Volumetric rain reflections, holographic street stalls, and chromatic lighting.',
    coverImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
    colorTheme: '#ea4335',
    generationIds: ['gen-3'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'col-editorial',
    name: 'Editorial Haute Portraits',
    description: 'Studio key lighting, iridescent foil accents, and high-fashion character studies.',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    colorTheme: '#9333ea',
    generationIds: ['gen-2', 'gen-4'],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const getCollections = (): MoodboardCollection[] => {
  try {
    const raw = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  saveCollections(DEFAULT_COLLECTIONS);
  return DEFAULT_COLLECTIONS;
};

export const saveCollections = (collections: MoodboardCollection[]) => {
  try {
    localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
    window.dispatchEvent(new CustomEvent('aura:collections_updated', { detail: collections }));
  } catch (e) {
    // ignore
  }
};

export const createCollection = (
  name: string,
  description?: string,
  colorTheme = '#3052ff',
  initialCover?: string
): MoodboardCollection => {
  const current = getCollections();
  const newCol: MoodboardCollection = {
    id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    description: description?.trim() || undefined,
    colorTheme,
    coverImage: initialCover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    generationIds: [],
    createdAt: new Date().toISOString(),
  };
  saveCollections([newCol, ...current]);
  return newCol;
};

export const toggleArtworkInCollection = (collectionId: string, artworkId: string): boolean => {
  const current = getCollections();
  let isNowIn = false;
  const updated = current.map((c) => {
    if (c.id === collectionId) {
      const exists = c.generationIds.includes(artworkId);
      isNowIn = !exists;
      return {
        ...c,
        generationIds: exists
          ? c.generationIds.filter((id) => id !== artworkId)
          : [...c.generationIds, artworkId],
        updatedAt: new Date().toISOString(),
      };
    }
    return c;
  });
  saveCollections(updated);
  return isNowIn;
};

export const deleteCollection = (collectionId: string) => {
  const current = getCollections();
  saveCollections(current.filter((c) => c.id !== collectionId));
};
