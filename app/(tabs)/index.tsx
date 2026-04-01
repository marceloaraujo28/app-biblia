import { useFocusEffect, useRouter } from "expo-router";
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Heart,
  Highlighter,
  Search,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppTheme, Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getBibleBooks } from "@/lib/bible";
import { getAppPreferences, getReadingProgress } from "@/lib/storage";
import type { BibleBook, ReadingProgress } from "@/types/bible";

export default function ReadingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [search, setSearch] = useState("");
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ReadingProgress | null>(null);

  const loadScreenData = useCallback(async () => {
    try {
      const appPreferences = await getAppPreferences();
      const versionBooks = await getBibleBooks(appPreferences.activeVersionId);
      const savedProgress = await getReadingProgress();

      setBooks(versionBooks);
      setProgress(savedProgress);
    } catch (error) {
      console.error("Erro ao carregar tela inicial:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadScreenData();
    }, [loadScreenData]),
  );

  const filteredBooks = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) return books;

    return books.filter((book) => book.name.toLowerCase().includes(normalized));
  }, [books, search]);

  const handleOpenChapter = (bookId: string, chapterNumber: number) => {
    router.push({
      pathname: "/reader/[bookId]/[chapter]",
      params: {
        bookId,
        chapter: String(chapterNumber),
      },
    });
  };

  const handleContinueReading = () => {
    if (!progress) return;

    router.push({
      pathname: "/reader/[bookId]/[chapter]",
      params: {
        bookId: progress.bookId,
        chapter: String(progress.chapterNumber),
        restore: "1",
      },
    });
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSide} />

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Bíblia
          </Text>

          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/favorites")}
              style={[
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Heart size={20} color={colors.icon} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/highlights")}
              style={[
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Highlighter size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.searchWrapper,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Search size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Procurar livro"
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listWrapper}
          renderItem={({ item }) => {
            const expanded = expandedBookId === item.id;

            return (
              <View style={styles.bookBlock}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    setExpandedBookId((current) =>
                      current === item.id ? null : item.id,
                    )
                  }
                  style={[
                    styles.bookItem,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      shadowColor: colors.shadow,
                    },
                  ]}
                >
                  <Text style={[styles.bookText, { color: colors.text }]}>
                    {item.name}
                  </Text>

                  {expanded ? (
                    <ChevronUp size={18} color={colors.textMuted} />
                  ) : (
                    <ChevronDown size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>

                {expanded && (
                  <View
                    style={[
                      styles.chapterGrid,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    {Array.from(
                      { length: item.chapterCount },
                      (_, index) => index + 1,
                    ).map((chapterNumber) => (
                      <TouchableOpacity
                        key={`${item.id}-${chapterNumber}`}
                        activeOpacity={0.85}
                        onPress={() =>
                          handleOpenChapter(item.id, chapterNumber)
                        }
                        style={[
                          styles.chapterButton,
                          {
                            backgroundColor: colors.surfaceSoft,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.chapterButtonText,
                            { color: colors.text },
                          ]}
                        >
                          {chapterNumber}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          }}
        />

        {progress && (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleContinueReading}
            style={[
              styles.floatingBookmark,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <Bookmark size={22} color="#FFF8F1" fill="#FFF8F1" />
          </TouchableOpacity>
        )}
      </View>
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
  headerSide: {
    width: 44,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontFamily: Fonts.serif,
    fontWeight: "700",
  },
  headerActions: {
    width: 72,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: AppTheme.radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrapper: {
    height: 54,
    borderRadius: AppTheme.radius.xl,
    borderWidth: 1,
    paddingHorizontal: AppTheme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: AppTheme.spacing.lg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontFamily: Fonts.sans,
  },
  listWrapper: {
    paddingBottom: 120,
  },
  bookBlock: {
    marginBottom: 12,
  },
  bookItem: {
    minHeight: 62,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: AppTheme.spacing.lg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 1,
  },
  bookText: {
    fontSize: 18,
    fontFamily: Fonts.serif,
    fontWeight: "600",
  },
  chapterGrid: {
    marginTop: 10,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chapterButton: {
    width: 46,
    height: 46,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  floatingBookmark: {
    position: "absolute",
    right: 20,
    bottom: 92,
    width: 56,
    height: 56,
    borderRadius: AppTheme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 5,
  },
});
