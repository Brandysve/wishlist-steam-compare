import type {
  ClassifiedPriceOffer,
  OfferProductType,
  RawPriceOffer,
} from "@/types/offers";

const REJECTED_KEYWORDS: Array<[OfferProductType, RegExp]> = [
  ["currency", /\b(coins?|credits?|tokens?|points?|currency)\b/i],
  ["upgrade", /\b(upgrade|edition upgrade|deluxe upgrade)\b/i],
  ["dlc", /\b(dlc|season pass|soundtrack|skin pack|costume pack|weapon pack)\b/i],
  ["expansion", /\b(expansion|add-on|story pack)\b/i],
];

const ENHANCED_EDITIONS = [
  "deluxe",
  "gold",
  "ultimate",
  "complete",
  "goty",
  "game of the year",
  "definitive",
  "premium",
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function detectEdition(title: string): string | null {
  const normalized = normalize(title);
  const edition = ENHANCED_EDITIONS.find((candidate) =>
    normalized.includes(candidate),
  );

  return edition ?? null;
}

function detectProductType(title: string): OfferProductType {
  for (const [type, pattern] of REJECTED_KEYWORDS) {
    if (pattern.test(title)) return type;
  }

  if (/\b(bundle|collection|pack)\b/i.test(title)) return "bundle";
  if (detectEdition(title)) return "enhanced-edition";
  return "base-game";
}

function titleSimilarity(gameTitle: string, offerTitle: string): number {
  const gameWords = new Set(normalize(gameTitle).split(" ").filter(Boolean));
  const offerWords = new Set(normalize(offerTitle).split(" ").filter(Boolean));

  if (gameWords.size === 0 || offerWords.size === 0) return 0;

  let matches = 0;
  for (const word of gameWords) {
    if (offerWords.has(word)) matches += 1;
  }

  return matches / gameWords.size;
}

export function classifyOffer(
  gameTitle: string,
  offer: RawPriceOffer,
): ClassifiedPriceOffer {
  const productType = detectProductType(offer.title);
  const rejectionReasons: string[] = [];
  let confidence = Math.round(titleSimilarity(gameTitle, offer.title) * 70);

  if (/steam/i.test(offer.platform ?? "")) confidence += 15;
  if (/europe|eu|global/i.test(offer.region ?? "")) confidence += 10;
  if (offer.inStock) confidence += 5;

  if (["dlc", "expansion", "upgrade", "currency"].includes(productType)) {
    rejectionReasons.push("Le produit nécessite ou complète un jeu existant.");
  }

  if (offer.platform && !/steam|pc/i.test(offer.platform)) {
    rejectionReasons.push("La plateforme ne correspond pas à Steam sur PC.");
  }

  if (offer.region && !/europe|eu|global/i.test(offer.region)) {
    rejectionReasons.push("La région n'est pas compatible avec l'Europe.");
  }

  if (!offer.inStock) rejectionReasons.push("L'offre est indisponible.");

  return {
    ...offer,
    productType,
    editionLabel: detectEdition(offer.title),
    confidence: Math.min(confidence, 100),
    rejectionReasons,
  };
}
