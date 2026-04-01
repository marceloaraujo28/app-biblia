import { AppTheme, Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  downloadBibleVersion,
  getActiveBibleVersion,
  getInstalledBibleVersions,
  setActiveBibleVersion,
} from "@/lib/bible-version-storage";
import type { BibleVersionId, InstalledBibleVersion } from "@/types/bible";
import { useFocusEffect } from "expo-router";
import { Check, Download, Languages, Moon, Star } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [versions, setVersions] = useState<InstalledBibleVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<BibleVersionId>("nvi");
  const [downloadingVersionId, setDownloadingVersionId] =
    useState<BibleVersionId | null>(null);

  const loadVersions = useCallback(async () => {
    const [installedVersions, activeVersion] = await Promise.all([
      getInstalledBibleVersions(),
      getActiveBibleVersion(),
    ]);

    setVersions(installedVersions);
    setActiveVersionId(activeVersion);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadVersions();
    }, [loadVersions]),
  );

  const handleSelectVersion = async (versionId: BibleVersionId) => {
    try {
      await setActiveBibleVersion(versionId);
      setActiveVersionId(versionId);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível selecionar essa versão.");
    }
  };

  const handleDownloadVersion = async (versionId: BibleVersionId) => {
    try {
      setDownloadingVersionId(versionId);
      await downloadBibleVersion(versionId);
      await loadVersions();
      Alert.alert("Download concluído", "A versão foi baixada com sucesso.");
    } catch (error) {
      Alert.alert(
        "Download indisponível",
        "A URL ainda é apenas um exemplo. Depois você troca pela URL real do arquivo JSON.",
      );
    } finally {
      setDownloadingVersionId(null);
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Configurações
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tema
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBubble,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <Moon size={18} color={colors.icon} />
              </View>

              <View>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  Aparência
                </Text>
                <Text
                  style={[styles.itemSubtitle, { color: colors.textMuted }]}
                >
                  Tema atual: {colorScheme === "dark" ? "Escuro" : "Claro"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Versão da Bíblia
          </Text>

          {versions.map((version) => {
            const isActive = activeVersionId === version.id;
            const isDownloading = downloadingVersionId === version.id;

            return (
              <View
                key={version.id}
                style={[
                  styles.versionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={styles.rowLeft}>
                  <View
                    style={[
                      styles.iconBubble,
                      { backgroundColor: colors.primarySoft },
                    ]}
                  >
                    <Languages size={18} color={colors.icon} />
                  </View>

                  <View>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>
                      {version.shortName}
                    </Text>
                    <Text
                      style={[styles.itemSubtitle, { color: colors.textMuted }]}
                    >
                      {version.name}
                    </Text>
                  </View>
                </View>

                {version.isDownloaded ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleSelectVersion(version.id)}
                    style={[
                      styles.selectButton,
                      {
                        backgroundColor: isActive
                          ? colors.primarySoft
                          : colors.background,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {isActive ? (
                      <>
                        <Check size={16} color={colors.primary} />
                        <Text
                          style={[
                            styles.selectButtonText,
                            { color: colors.primary },
                          ]}
                        >
                          Em uso
                        </Text>
                      </>
                    ) : (
                      <Text
                        style={[
                          styles.selectButtonText,
                          { color: colors.text },
                        ]}
                      >
                        Selecionar
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleDownloadVersion(version.id)}
                    disabled={isDownloading}
                    style={[
                      styles.downloadButton,
                      {
                        backgroundColor: colors.primary,
                      },
                    ]}
                  >
                    {isDownloading ? (
                      <ActivityIndicator size="small" color="#FFF8F1" />
                    ) : (
                      <>
                        <Download size={16} color="#FFF8F1" />
                        <Text style={styles.downloadButtonText}>Baixar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Aplicativo
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBubble,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <Star size={18} color={colors.icon} />
              </View>

              <View>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  Avaliar o app
                </Text>
                <Text
                  style={[styles.itemSubtitle, { color: colors.textMuted }]}
                >
                  Depois ligamos esse botão na loja
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingTop: AppTheme.spacing.lg,
    paddingBottom: 120,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontFamily: Fonts.serif,
    fontWeight: "700",
    marginBottom: AppTheme.spacing.xl,
  },
  section: {
    marginBottom: AppTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.serif,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    minHeight: 72,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: AppTheme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  versionCard: {
    minHeight: 84,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: AppTheme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: AppTheme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: Fonts.sans,
    fontWeight: "700",
  },
  itemSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    marginTop: 2,
  },
  selectButton: {
    minWidth: 98,
    height: 40,
    borderRadius: AppTheme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  downloadButton: {
    minWidth: 98,
    height: 40,
    borderRadius: AppTheme.radius.pill,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  downloadButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFF8F1",
  },
});
