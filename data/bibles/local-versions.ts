import type {
  BibleVersionCatalogItem,
  BibleVersionId,
  RawBibleBook,
} from "@/types/bible";

const nviRaw = require("../../assets/bibles/nvi.json") as RawBibleBook[];

export const LOCAL_BUNDLED_BIBLE_VERSIONS: Partial<
  Record<BibleVersionId, RawBibleBook[]>
> = {
  nvi: nviRaw,
};

export const BIBLE_VERSION_CATALOG: BibleVersionCatalogItem[] = [
  {
    id: "nvi",
    name: "Nova Versão Internacional",
    shortName: "NVI",
    bundled: true,
  },
  {
    id: "acf",
    name: "Almeida Corrigida Fiel",
    shortName: "ACF",
    bundled: false,
    downloadUrl: "https://SEU-FUTURO-DOMINIO.com/bibles/acf.json",
  },
];
