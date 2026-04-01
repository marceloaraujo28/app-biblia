import {
  BIBLE_BOOKS_META,
  BIBLE_BOOKS_META_BY_ID,
} from "@/constants/bible-books";
import { getBibleVersionData } from "@/lib/bible-version-storage";
import type { BibleBook, BibleVersionId } from "@/types/bible";

export async function getBibleBooks(
  versionId: BibleVersionId,
): Promise<BibleBook[]> {
  const rawBooks = await getBibleVersionData(versionId);

  return rawBooks.map((rawBook, index) => {
    const meta = BIBLE_BOOKS_META[index];

    return {
      ...meta,
      chapterCount: rawBook.chapters.length,
    };
  });
}

export function getBookName(bookId: string) {
  return BIBLE_BOOKS_META_BY_ID[bookId]?.name ?? "";
}

export function getBookMeta(bookId: string) {
  return BIBLE_BOOKS_META_BY_ID[bookId] ?? null;
}

export function getBookIndex(bookId: string) {
  return BIBLE_BOOKS_META.findIndex((book) => book.id === bookId);
}

export async function getChapterVerses(
  versionId: BibleVersionId,
  bookId: string,
  chapterNumber: number,
) {
  const bookIndex = getBookIndex(bookId);
  if (bookIndex < 0) return [];

  const rawBooks = await getBibleVersionData(versionId);
  const rawBook = rawBooks[bookIndex];

  if (!rawBook) return [];

  return rawBook.chapters[chapterNumber - 1] ?? [];
}

export async function getChapterCount(
  versionId: BibleVersionId,
  bookId: string,
) {
  const bookIndex = getBookIndex(bookId);
  if (bookIndex < 0) return 0;

  const rawBooks = await getBibleVersionData(versionId);
  return rawBooks[bookIndex]?.chapters.length ?? 0;
}
