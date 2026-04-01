import {
  DEFAULT_APP_PREFERENCES,
  DEFAULT_READER_PREFERENCES,
  type AppPreferences,
  type FavoriteVerse,
  type HighlightColorKey,
  type HighlightVerse,
  type ReaderPreferences,
  type ReadingProgress,
} from "@/types/bible";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  appPreferences: "@biblia:app-preferences",
  readerPreferences: "@biblia:reader-preferences",
  readingProgress: "@biblia:reading-progress",
  favorites: "@biblia:favorites",
  highlights: "@biblia:highlights",
};

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJSON<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getAppPreferences() {
  return readJSON<AppPreferences>(
    STORAGE_KEYS.appPreferences,
    DEFAULT_APP_PREFERENCES,
  );
}

export async function saveAppPreferences(value: AppPreferences) {
  await writeJSON(STORAGE_KEYS.appPreferences, value);
}

export async function getReaderPreferences() {
  return readJSON<ReaderPreferences>(
    STORAGE_KEYS.readerPreferences,
    DEFAULT_READER_PREFERENCES,
  );
}

export async function updateReaderPreferences(
  partial: Partial<ReaderPreferences>,
) {
  const current = await getReaderPreferences();
  const next = { ...current, ...partial };

  await writeJSON(STORAGE_KEYS.readerPreferences, next);
  return next;
}

export async function getReadingProgress() {
  return readJSON<ReadingProgress | null>(STORAGE_KEYS.readingProgress, null);
}

export async function saveReadingProgress(progress: ReadingProgress) {
  await writeJSON(STORAGE_KEYS.readingProgress, progress);
}

export async function clearReadingProgress() {
  await AsyncStorage.removeItem(STORAGE_KEYS.readingProgress);
}

export async function getFavorites() {
  return readJSON<FavoriteVerse[]>(STORAGE_KEYS.favorites, []);
}

export async function removeFavorite(id: string) {
  const current = await getFavorites();
  const next = current.filter((item) => item.id !== id);

  await writeJSON(STORAGE_KEYS.favorites, next);
  return next;
}

export async function toggleFavorite(item: FavoriteVerse) {
  const current = await getFavorites();
  const exists = current.some((favorite) => favorite.id === item.id);

  const next = exists
    ? current.filter((favorite) => favorite.id !== item.id)
    : [item, ...current];

  await writeJSON(STORAGE_KEYS.favorites, next);

  return {
    next,
    isFavorite: !exists,
  };
}

export async function getHighlights() {
  return readJSON<HighlightVerse[]>(STORAGE_KEYS.highlights, []);
}

export async function setHighlight(
  item: Omit<HighlightVerse, "createdAt"> & { colorKey: HighlightColorKey },
) {
  const current = await getHighlights();
  const filtered = current.filter((highlight) => highlight.id !== item.id);

  const next: HighlightVerse[] = [
    {
      ...item,
      createdAt: Date.now(),
    },
    ...filtered,
  ];

  await writeJSON(STORAGE_KEYS.highlights, next);
  return next;
}

export async function removeHighlight(id: string) {
  const current = await getHighlights();
  const next = current.filter((highlight) => highlight.id !== id);

  await writeJSON(STORAGE_KEYS.highlights, next);
  return next;
}

export function buildVerseStorageId(
  versionId: string,
  bookId: string,
  chapterNumber: number,
  verseNumber: number,
) {
  return `${versionId}:${bookId}:${chapterNumber}:${verseNumber}`;
}
