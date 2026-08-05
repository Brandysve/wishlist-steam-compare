import type { PriceProvider } from "@/lib/providers/price-provider";
import { classifyOffer } from "@/lib/offers/classify-offer";
import { selectBestOffer } from "@/lib/offers/select-best-offer";
import type { SteamGame } from "@/types/steam";
import type { ClassifiedPriceOffer, SelectedOffer } from "@/types/offers";

export interface OfferComparisonResult {
  game: SteamGame;
  offers: ClassifiedPriceOffer[];
  bestOffer: SelectedOffer | null;
}

export async function buildOfferComparison(
  game: SteamGame,
  providers: PriceProvider[],
): Promise<OfferComparisonResult> {
  const providerResults = await Promise.allSettled(
    providers.map((provider) => provider.search(game)),
  );

  const rawOffers = providerResults.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  const offers = rawOffers.map((offer) => classifyOffer(game.name, offer));

  return {
    game,
    offers,
    bestOffer: selectBestOffer(game, offers),
  };
}
