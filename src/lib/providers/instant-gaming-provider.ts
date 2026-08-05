import type { PriceProvider } from "@/lib/providers/price-provider";
import type { RawPriceOffer } from "@/types/offers";
import type { SteamGame } from "@/types/steam";

interface InstantGamingResponse {
  offers?: RawPriceOffer[];
  error?: string;
}

export class InstantGamingProvider implements PriceProvider {
  readonly id = "instant-gaming";
  readonly name = "Instant Gaming";

  async search(game: SteamGame): Promise<RawPriceOffer[]> {
    const response = await fetch(
      `/api/providers/instant-gaming?query=${encodeURIComponent(game.name)}`,
    );
    const payload = (await response.json()) as InstantGamingResponse;

    if (!response.ok) {
      throw new Error(payload.error ?? "Instant Gaming est indisponible.");
    }

    return payload.offers ?? [];
  }
}
