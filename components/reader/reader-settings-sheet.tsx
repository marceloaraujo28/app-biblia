import { BottomSheetModal } from "@/components/ui/bottom-sheet-modal";
import { AppTheme, Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ReaderFontFamily, ReaderPreferences } from "@/types/bible";
import Slider from "@react-native-community/slider";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  preferences: ReaderPreferences;
  onClose: () => void;
  onChange: (partial: Partial<ReaderPreferences>) => void;
};

function SliderRow({
  label,
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
}: {
  label: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeader}>
        <Text style={[styles.sliderLabel, { color: colors.text }]}>
          {label}
        </Text>
        <Text style={[styles.sliderValue, { color: colors.textMuted }]}>
          {value}
        </Text>
      </View>

      <Slider
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.borderStrong}
        thumbTintColor={colors.primary}
      />
    </View>
  );
}

export function ReaderSettingsSheet({
  visible,
  preferences,
  onClose,
  onChange,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const setFontFamily = (fontFamily: ReaderFontFamily) => {
    onChange({ fontFamily });
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text }]}>Leitura</Text>

      <View style={styles.fontToggleRow}>
        {(["serif", "sans"] as ReaderFontFamily[]).map((fontFamily) => {
          const active = preferences.fontFamily === fontFamily;

          return (
            <TouchableOpacity
              key={fontFamily}
              activeOpacity={0.85}
              onPress={() => setFontFamily(fontFamily)}
              style={[
                styles.fontToggleButton,
                {
                  backgroundColor: active
                    ? colors.primarySoft
                    : colors.background,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.fontToggleText,
                  {
                    color: active ? colors.primary : colors.text,
                    fontFamily:
                      fontFamily === "serif" ? Fonts.serif : Fonts.sans,
                  },
                ]}
              >
                {fontFamily === "serif" ? "Serifada" : "Sem serifa"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <SliderRow
        label="Tamanho da fonte"
        value={preferences.fontSize}
        minimumValue={16}
        maximumValue={30}
        step={1}
        onValueChange={(value) => onChange({ fontSize: value })}
      />

      <SliderRow
        label="Altura da linha"
        value={preferences.lineHeight}
        minimumValue={24}
        maximumValue={42}
        step={1}
        onValueChange={(value) => onChange({ lineHeight: value })}
      />

      <SliderRow
        label="Espaçamento entre versículos"
        value={preferences.verseSpacing}
        minimumValue={8}
        maximumValue={24}
        step={1}
        onValueChange={(value) => onChange({ verseSpacing: value })}
      />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontFamily: Fonts.serif,
    fontWeight: "700",
    marginBottom: AppTheme.spacing.lg,
  },
  fontToggleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: AppTheme.spacing.lg,
  },
  fontToggleButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fontToggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sliderBlock: {
    marginBottom: AppTheme.spacing.lg,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  sliderLabel: {
    fontSize: 15,
    fontFamily: Fonts.sans,
    fontWeight: "600",
  },
  sliderValue: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    fontWeight: "600",
  },
});
