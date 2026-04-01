import { BottomSheetModal } from "@/components/ui/bottom-sheet-modal";
import { AppTheme, Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { HighlightColorKey } from "@/types/bible";
import { Copy, Heart, Share2, Trash2 } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  verseLabel: string;
  verseText: string;
  isFavorite: boolean;
  selectedColorKey: HighlightColorKey | null;
  onToggleFavorite: () => void;
  onCopy: () => void;
  onShare: () => void;
  onSelectColor: (colorKey: HighlightColorKey) => void;
  onRemoveHighlight: () => void;
};

const COLOR_KEYS: HighlightColorKey[] = ["yellow", "green", "blue", "pink"];

export function VerseActionsSheet({
  visible,
  onClose,
  verseLabel,
  verseText,
  isFavorite,
  selectedColorKey,
  onToggleFavorite,
  onCopy,
  onShare,
  onSelectColor,
  onRemoveHighlight,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const colorMap = {
    yellow: colors.highlightYellow,
    green: colors.highlightGreen,
    blue: colors.highlightBlue,
    pink: colors.highlightPink,
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text }]}>{verseLabel}</Text>

      <Text
        style={[styles.verseText, { color: colors.textMuted }]}
        numberOfLines={4}
      >
        {verseText}
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.actionButton,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={onToggleFavorite}
        >
          <Heart
            size={18}
            color={isFavorite ? colors.primary : colors.icon}
            fill={isFavorite ? colors.primary : "transparent"}
          />
          <Text style={[styles.actionText, { color: colors.text }]}>
            {isFavorite ? "Remover favorito" : "Favoritar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.actionButton,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={onCopy}
        >
          <Copy size={18} color={colors.icon} />
          <Text style={[styles.actionText, { color: colors.text }]}>
            Copiar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.actionButton,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={onShare}
        >
          <Share2 size={18} color={colors.icon} />
          <Text style={[styles.actionText, { color: colors.text }]}>
            Compartilhar
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.subtitle, { color: colors.text }]}>Marcação</Text>

      <View style={styles.colorRow}>
        {COLOR_KEYS.map((colorKey) => {
          const active = selectedColorKey === colorKey;

          return (
            <TouchableOpacity
              key={colorKey}
              activeOpacity={0.85}
              onPress={() => onSelectColor(colorKey)}
              style={[
                styles.colorButton,
                {
                  backgroundColor: colorMap[colorKey],
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            />
          );
        })}
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.removeHighlightButton,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
        onPress={onRemoveHighlight}
      >
        <Trash2 size={16} color={colors.danger} />
        <Text style={[styles.removeHighlightText, { color: colors.danger }]}>
          Remover marcação
        </Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontFamily: Fonts.serif,
    fontWeight: "700",
    marginBottom: 8,
  },
  verseText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: AppTheme.spacing.lg,
  },
  actionsRow: {
    gap: 10,
    marginBottom: AppTheme.spacing.lg,
  },
  actionButton: {
    minHeight: 50,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: AppTheme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionText: {
    fontSize: 15,
    fontFamily: Fonts.sans,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.sans,
    fontWeight: "700",
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: AppTheme.spacing.lg,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: AppTheme.radius.pill,
    borderWidth: 2,
  },
  removeHighlightButton: {
    minHeight: 48,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  removeHighlightText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
