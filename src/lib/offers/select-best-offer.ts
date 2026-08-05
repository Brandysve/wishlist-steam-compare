import type { SteamGame } from "@/types/steam";
import type {
  ClassifiedPriceOffer,
  SelectedOffer,
} from "@/types/offers";

const ACCEPTED_PRODUCT_TYPES = new Set([
  "base-game",
  "enhanced-edition",
  "bundle",
]);

function calculateSavings(
  referencePrice: number | null,
  offerPrice: number,
): { amount: number | null; percent: number | null } {
  if (referencePrice === null || referencePrice <= 0) {
    return { amount: null, percent: null };
  }

  const amount = Math.max(referencePrice - offerPrice, 0);
  const percent = Math.round((amount / referencePrice) * 100);
  return { amount, percent };
}

export function selectBestOffer(
  game: SteamGame,
  offers: ClassifiedPriceOffer[],
): SelectedOffer | null {
  const eligible = offers
    .filter((offer) => offer.rejectionReasons.length === 0)
    .filter((offer) => ACCEPTED_PRODUCT_TYPES.has(offer.productType))
    .filter((offer) => offer.confidence >= 70)
    .sort((left, right) => {
      if (left.price !== right.price) return left.price - right.price;
      return right.confidence - left.confidence;
    });

  const [best, ...alternatives] = eligible;
  if (!best) return null;

  const referencePrice = game.normalPrice ?? game.currentPrice;
  const savings = calculateSavings(referencePrice, best.price);

  return {
    offer: best,
    savingsAmount: savings.amount,
    savingsPercent: savings.percent,
    isInteresting:
      best.price <= 18 || (savings.percent !== null && savings.percent >= 50),
    alternatives,
  };
}
