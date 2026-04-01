import { AppTheme, Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheetModal({ visible, onClose, children }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <SafeAreaView edges={["bottom"]}>
            <View
              style={[styles.handle, { backgroundColor: colors.borderStrong }]}
            />
            {children}
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  sheet: {
    borderTopLeftRadius: AppTheme.radius.xl,
    borderTopRightRadius: AppTheme.radius.xl,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingBottom: AppTheme.spacing.md,
  },
  handle: {
    width: 52,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: AppTheme.spacing.lg,
  },
});
