export type OfferProductType =
  | "base-game"
  | "enhanced-edition"
  | "bundle"
  | "dlc"
  | "expansion"
  | "upgrade"
  | "currency"
  | "unknown";

export interface RawPriceOffer {
  providerId: string;
  providerName: string;
  externalId: string;
  title: string;
  url: string;
  price: number;
  currency: string;
  platform: string | null;
  region: string | null;
  inStock: boolean;
}

export interface ClassifiedPriceOffer extends RawPriceOffer {
  productType: OfferProductType;
  editionLabel: string | null;
  confidence: number;
  rejectionReasons: string[];
}

export interface SelectedOffer {
  offer: ClassifiedPriceOffer;
  savingsAmount: number | null;
  savingsPercent: number | null;
  isInteresting: boolean;
  alternatives: ClassifiedPriceOffer[];
}
