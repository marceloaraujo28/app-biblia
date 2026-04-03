import { AppTheme, Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getHighlights, removeHighlight } from "@/lib/storage";
import type { HighlightVerse } from "@/types/bible";
import { useFocusEffect, useRouter } from "expo-router";
import { ArrowLeft, Highlighter, Trash2 } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HighlightsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [items, setItems] = useState<HighlightVerse[]>([]);

  const loadHighlights = useCallback(async () => {
    const data = await getHighlights();
    setItems(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHighlights();
    }, [loadHighlights]),
  );

  const backgroundMap = {
    yellow: colors.highlightYellow,
    green: colors.highlightGreen,
    blue: colors.highlightBlue,
    pink: colors.highlightPink,
  };

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
            Marcações
          </Text>

          <View style={styles.headerButton} />
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Highlighter size={28} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Nenhuma marcação ainda
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() =>
                router.push({
                  pathname: "/reader/[bookId]/[chapter]",
                  params: {
                    bookId: item.bookId,
                    chapter: String(item.chapterNumber),
                    restore: "0",
                  },
                })
              }
              style={[
                styles.card,
                {
                  backgroundColor: backgroundMap[item.colorKey],
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.reference, { color: colors.primary }]}>
                  {item.bookName} {item.chapterNumber}:{item.verseNumber}
                </Text>

                <TouchableOpacity
                  onPress={async () => {
                    const next = await removeHighlight(item.id);
                    setItems(next);
                  }}
                >
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.cardText, { color: colors.text }]}>
                {item.text}
              </Text>
            </TouchableOpacity>
          )}
        />
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
  headerButton: {
    width: 38,
    height: 38,
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
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.serif,
    fontWeight: "700",
  },
  card: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    padding: AppTheme.spacing.lg,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  reference: {
    fontSize: 14,
    fontWeight: "700",
  },
  cardText: {
    fontSize: 16,
    lineHeight: 26,
  },
});
