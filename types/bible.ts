export type BibleVersionId = "nvi" | "acf";

export type RawBibleBook = {
  abbrev: string;
  chapters: string[][];
};

export type BibleBookMeta = {
  id: string;
  name: string;
  abbrev: string;
  order: number;
};

export type BibleBook = BibleBookMeta & {
  chapterCount: number;
};

export type ReaderFontFamily = "serif" | "sans";

export type ReaderPreferences = {
  fontSize: number;
  lineHeight: number;
  verseSpacing: number;
  fontFamily: ReaderFontFamily;
};

export type AppPreferences = {
  activeVersionId: BibleVersionId;
};

export type ReadingProgress = {
  versionId: BibleVersionId;
  bookId: string;
  chapterNumber: number;
  verseNumber: number;
  updatedAt: number;
};

export type FavoriteVerse = {
  id: string;
  versionId: BibleVersionId;
  bookId: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
  createdAt: number;
};

export type HighlightColorKey = "yellow" | "green" | "blue" | "pink";

export type HighlightVerse = {
  id: string;
  versionId: BibleVersionId;
  bookId: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
  colorKey: HighlightColorKey;
  createdAt: number;
};

export type BibleVersionCatalogItem = {
  id: BibleVersionId;
  name: string;
  shortName: string;
  bundled: boolean;
  downloadUrl?: string;
};

export type InstalledBibleVersion = {
  id: BibleVersionId;
  name: string;
  shortName: string;
  bundled: boolean;
  isDownloaded: boolean;
  localPath?: string | null;
};

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  activeVersionId: "nvi",
};

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  fontSize: 20,
  lineHeight: 32,
  verseSpacing: 14,
  fontFamily: "serif",
};
