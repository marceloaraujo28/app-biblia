import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Settings2 } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReaderSettingsSheet } from "@/components/reader/reader-settings-sheet";
import { VerseActionsSheet } from "@/components/reader/verse-actions-sheet";
import { AppTheme, Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getBookName, getChapterVerses } from "@/lib/bible";
import {
  buildVerseStorageId,
  getAppPreferences,
  getFavorites,
  getHighlights,
  getReaderPreferences,
  getReadingProgress,
  removeHighlight,
  saveReadingProgress,
  setHighlight,
  toggleFavorite,
  updateReaderPreferences,
} from "@/lib/storage";
import type {
  BibleVersionId,
  FavoriteVerse,
  HighlightColorKey,
  HighlightVerse,
  ReaderPreferences,
  ReadingProgress,
} from "@/types/bible";

type SelectedVerse = {
  verseNumber: number;
  text: string;
};

export default function ReaderChapterScreen() {
  const router = useRouter();
  const { bookId, chapter, restore } = useLocalSearchParams<{
    bookId: string;
    chapter: string;
    restore?: string;
  }>();

  const chapterNumber = Number(chapter);
  const shouldRestoreScroll = restore === "1";

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const listRef = useRef<FlatList<string>>(null);
  const hasRestoredRef = useRef(false);

  const lastRestoreSessionRef = useRef<string>("");
  const lastSavedVerseRef = useRef<number | null>(null);
  const persistReadingProgressRef = useRef<
    (verseNumber: number) => Promise<void>
  >(() => Promise.resolve());

  const [versionId, setVersionId] = useState<BibleVersionId>("nvi");
  const [preferences, setPreferences] = useState<ReaderPreferences>({
    fontSize: 20,
    lineHeight: 32,
    verseSpacing: 14,
    fontFamily: "serif",
  });
  const [favorites, setFavorites] = useState<FavoriteVerse[]>([]);
  const [highlights, setHighlights] = useState<HighlightVerse[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<SelectedVerse | null>(
    null,
  );
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [verses, setVerses] = useState<string[]>([]);
  const [restoreVerseNumber, setRestoreVerseNumber] = useState<number | null>(
    null,
  );

  const bookName = getBookName(bookId);

  const highlightMap = useMemo(() => {
    return Object.fromEntries(highlights.map((item) => [item.id, item]));
  }, [highlights]);

  const favoriteIds = useMemo(() => {
    return new Set(favorites.map((item) => item.id));
  }, [favorites]);

  const persistReadingProgress = useCallback(
    async (verseNumber: number) => {
      if (!bookId || !chapterNumber || !versionId) return;
      if (lastSavedVerseRef.current === verseNumber) return;

      lastSavedVerseRef.current = verseNumber;

      const progress: ReadingProgress = {
        versionId,
        bookId,
        chapterNumber,
        verseNumber,
        updatedAt: Date.now(),
      };

      await saveReadingProgress(progress);
    },
    [versionId, bookId, chapterNumber],
  );

  useEffect(() => {
    persistReadingProgressRef.current = persistReadingProgress;
  }, [persistReadingProgress]);

  const loadScreen = useCallback(async () => {
    const appPreferences = await getAppPreferences();

    const [
      savedReaderPreferences,
      savedFavorites,
      savedHighlights,
      loadedVerses,
    ] = await Promise.all([
      getReaderPreferences(),
      getFavorites(),
      getHighlights(),
      getChapterVerses(appPreferences.activeVersionId, bookId, chapterNumber),
    ]);

    setVersionId(appPreferences.activeVersionId);
    setPreferences(savedReaderPreferences);
    setFavorites(savedFavorites);
    setHighlights(savedHighlights);
    setVerses(loadedVerses);
  }, [bookId, chapterNumber]);

  useEffect(() => {
    setVerses([]);
    hasRestoredRef.current = false;
    lastSavedVerseRef.current = null;
    setRestoreVerseNumber(null);
  }, [bookId, chapterNumber]);

  useEffect(() => {
    void loadScreen();
  }, [loadScreen]);

  useEffect(() => {
    const loadRestoreProgress = async () => {
      if (!shouldRestoreScroll) {
        setRestoreVerseNumber(null);
        return;
      }

      const sessionKey = `${bookId}:${chapterNumber}:${restore}`;
      if (lastRestoreSessionRef.current === sessionKey) return;

      const savedProgress = await getReadingProgress();

      if (
        savedProgress &&
        savedProgress.bookId === bookId &&
        savedProgress.chapterNumber === chapterNumber
      ) {
        const safeVerseNumber = Math.min(
          Math.max(savedProgress.verseNumber, 1),
          Math.max(verses.length, 1),
        );

        lastRestoreSessionRef.current = sessionKey;
        setRestoreVerseNumber(safeVerseNumber);
        return;
      }

      setRestoreVerseNumber(null);
    };

    if (verses.length > 0) {
      void loadRestoreProgress();
    }
  }, [shouldRestoreScroll, bookId, chapterNumber, restore, verses.length]);

  useEffect(() => {
    if (!shouldRestoreScroll) return;
    if (!restoreVerseNumber) return;
    if (verses.length === 0) return;
    if (hasRestoredRef.current) return;

    const targetIndex = restoreVerseNumber - 1;

    if (targetIndex < 0 || targetIndex >= verses.length) return;

    const timeout = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: targetIndex,
        animated: false,
      });
      hasRestoredRef.current = true;
    }, 250);

    return () => clearTimeout(timeout);
  }, [shouldRestoreScroll, restoreVerseNumber, verses.length]);

  const handleVersePress = (verseNumber: number, text: string) => {
    setSelectedVerse({ verseNumber, text });
    setActionsVisible(true);
  };

  const handleToggleFavorite = async () => {
    if (!selectedVerse) return;

    const id = buildVerseStorageId(
      versionId,
      bookId,
      chapterNumber,
      selectedVerse.verseNumber,
    );

    const payload: FavoriteVerse = {
      id,
      versionId,
      bookId,
      bookName,
      chapterNumber,
      verseNumber: selectedVerse.verseNumber,
      text: selectedVerse.text,
      createdAt: Date.now(),
    };

    const result = await toggleFavorite(payload);
    setFavorites(result.next);
  };

  const handleSelectColor = async (colorKey: HighlightColorKey) => {
    if (!selectedVerse) return;

    const id = buildVerseStorageId(
      versionId,
      bookId,
      chapterNumber,
      selectedVerse.verseNumber,
    );

    const next = await setHighlight({
      id,
      versionId,
      bookId,
      bookName,
      chapterNumber,
      verseNumber: selectedVerse.verseNumber,
      text: selectedVerse.text,
      colorKey,
    });

    setHighlights(next);
  };

  const handleRemoveHighlight = async () => {
    if (!selectedVerse) return;

    const id = buildVerseStorageId(
      versionId,
      bookId,
      chapterNumber,
      selectedVerse.verseNumber,
    );

    const next = await removeHighlight(id);
    setHighlights(next);
  };

  const handleCopy = async () => {
    if (!selectedVerse) return;

    const message = `${bookName} ${chapterNumber}:${selectedVerse.verseNumber}\n\n${selectedVerse.text}`;
    await Clipboard.setStringAsync(message);
    Alert.alert("Copiado", "Versículo copiado para a área de transferência.");
  };

  const handleShare = async () => {
    if (!selectedVerse) return;

    const message = `${bookName} ${chapterNumber}:${selectedVerse.verseNumber}\n\n${selectedVerse.text}`;
    await Share.share({ message });
  };

  const handleReaderPreferencesChange = async (
    partial: Partial<ReaderPreferences>,
  ) => {
    const next = await updateReaderPreferences(partial);
    setPreferences(next);
  };

  const onViewableItemsChanged = useRef(
    async ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const firstVisible = viewableItems.find(
        (item) => typeof item.index === "number",
      );

      if (firstVisible?.index == null) return;

      const verseNumber = firstVisible.index + 1;

      await persistReadingProgressRef.current(verseNumber);
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.back()}
            style={[
              styles.headerButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <ArrowLeft size={20} color={colors.icon} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {bookName} {chapterNumber}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setSettingsVisible(true)}
            style={[
              styles.headerButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Settings2 size={20} color={colors.icon} />
          </TouchableOpacity>
        </View>

        <FlatList
          key={`${bookId}-${chapterNumber}`}
          ref={listRef}
          data={verses}
          keyExtractor={(_, index) => `${bookId}-${chapterNumber}-${index + 1}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={(info) => {
            const safeIndex = Math.min(info.index, verses.length - 1);

            if (safeIndex >= 0) {
              setTimeout(() => {
                listRef.current?.scrollToIndex({
                  index: safeIndex,
                  animated: false,
                });
              }, 150);
            }
          }}
          renderItem={({ item, index }) => {
            const verseNumber = index + 1;
            const verseId = buildVerseStorageId(
              versionId,
              bookId,
              chapterNumber,
              verseNumber,
            );

            const highlight = highlightMap[verseId];

            const backgroundColor = highlight
              ? {
                  yellow: colors.highlightYellow,
                  green: colors.highlightGreen,
                  blue: colors.highlightBlue,
                  pink: colors.highlightPink,
                }[highlight.colorKey]
              : colors.surface;

            return (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => handleVersePress(verseNumber, item)}
                style={[
                  styles.verseCard,
                  {
                    backgroundColor,
                    borderColor: colors.border,
                    marginBottom: preferences.verseSpacing,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.verseText,
                    {
                      color: colors.text,
                      fontSize: preferences.fontSize,
                      lineHeight: preferences.lineHeight,
                      fontFamily:
                        preferences.fontFamily === "serif"
                          ? Fonts.serif
                          : Fonts.sans,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.verseNumber,
                      {
                        color: colors.primary,
                        fontSize: Math.max(14, preferences.fontSize - 4),
                      },
                    ]}
                  >
                    {verseNumber}{" "}
                  </Text>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <ReaderSettingsSheet
        visible={settingsVisible}
        preferences={preferences}
        onClose={() => setSettingsVisible(false)}
        onChange={handleReaderPreferencesChange}
      />

      <VerseActionsSheet
        visible={actionsVisible}
        onClose={() => setActionsVisible(false)}
        verseLabel={
          selectedVerse
            ? `${bookName} ${chapterNumber}:${selectedVerse.verseNumber}`
            : ""
        }
        verseText={selectedVerse?.text ?? ""}
        isFavorite={
          selectedVerse
            ? favoriteIds.has(
                buildVerseStorageId(
                  versionId,
                  bookId,
                  chapterNumber,
                  selectedVerse.verseNumber,
                ),
              )
            : false
        }
        selectedColorKey={
          selectedVerse
            ? (highlightMap[
                buildVerseStorageId(
                  versionId,
                  bookId,
                  chapterNumber,
                  selectedVerse.verseNumber,
                )
              ]?.colorKey ?? null)
            : null
        }
        onToggleFavorite={handleToggleFavorite}
        onCopy={handleCopy}
        onShare={handleShare}
        onSelectColor={handleSelectColor}
        onRemoveHighlight={handleRemoveHighlight}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingTop: AppTheme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: AppTheme.spacing.lg,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: AppTheme.radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontFamily: Fonts.serif,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 120,
  },
  verseCard: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.lg,
  },
  verseText: {
    fontWeight: "400",
  },
  verseNumber: {
    fontWeight: "700",
  },
});
