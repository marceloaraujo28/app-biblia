import {
  BIBLE_VERSION_CATALOG,
  LOCAL_BUNDLED_BIBLE_VERSIONS,
} from "@/data/bibles/local-versions";
import { getAppPreferences, saveAppPreferences } from "@/lib/storage";
import type {
  BibleVersionCatalogItem,
  BibleVersionId,
  InstalledBibleVersion,
  RawBibleBook,
} from "@/types/bible";
import * as FileSystem from "expo-file-system/legacy";

const BIBLES_DIR = `${FileSystem.documentDirectory}bibles/`;

async function ensureBiblesDir() {
  const dirInfo = await FileSystem.getInfoAsync(BIBLES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BIBLES_DIR, { intermediates: true });
  }
}

function getBibleFilePath(versionId: BibleVersionId) {
  return `${BIBLES_DIR}${versionId}.json`;
}

function mapCatalogToInstalled(
  item: BibleVersionCatalogItem,
): InstalledBibleVersion {
  return {
    id: item.id,
    name: item.name,
    shortName: item.shortName,
    bundled: item.bundled,
    isDownloaded: item.bundled,
    localPath: item.bundled ? null : undefined,
  };
}

export async function getInstalledBibleVersions(): Promise<
  InstalledBibleVersion[]
> {
  await ensureBiblesDir();

  const result: InstalledBibleVersion[] = [];

  for (const item of BIBLE_VERSION_CATALOG) {
    if (item.bundled) {
      result.push({
        ...mapCatalogToInstalled(item),
        isDownloaded: true,
        localPath: null,
      });
      continue;
    }

    const filePath = getBibleFilePath(item.id);
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    result.push({
      ...mapCatalogToInstalled(item),
      isDownloaded: fileInfo.exists,
      localPath: fileInfo.exists ? filePath : null,
    });
  }

  return result;
}

export async function downloadBibleVersion(versionId: BibleVersionId) {
  const version = BIBLE_VERSION_CATALOG.find((item) => item.id === versionId);

  if (!version) {
    throw new Error("Versão não encontrada.");
  }

  if (version.bundled) {
    return;
  }

  if (!version.downloadUrl) {
    throw new Error("URL de download não configurada.");
  }

  await ensureBiblesDir();

  const destination = getBibleFilePath(versionId);
  await FileSystem.downloadAsync(version.downloadUrl, destination);
}

export async function getBibleVersionData(
  versionId: BibleVersionId,
): Promise<RawBibleBook[]> {
  const bundledVersion = LOCAL_BUNDLED_BIBLE_VERSIONS[versionId];
  if (bundledVersion) {
    return bundledVersion;
  }

  const filePath = getBibleFilePath(versionId);
  const fileInfo = await FileSystem.getInfoAsync(filePath);

  if (!fileInfo.exists) {
    throw new Error(`A versão ${versionId} não está instalada.`);
  }

  const content = await FileSystem.readAsStringAsync(filePath);
  return JSON.parse(content) as RawBibleBook[];
}

export async function setActiveBibleVersion(versionId: BibleVersionId) {
  const installedVersions = await getInstalledBibleVersions();
  const version = installedVersions.find((item) => item.id === versionId);

  if (!version || !version.isDownloaded) {
    throw new Error("A versão selecionada não está instalada.");
  }

  const currentPreferences = await getAppPreferences();

  await saveAppPreferences({
    ...currentPreferences,
    activeVersionId: versionId,
  });
}

export async function getActiveBibleVersion() {
  const preferences = await getAppPreferences();
  return preferences.activeVersionId;
}
