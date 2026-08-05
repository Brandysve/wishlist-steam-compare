import type { SteamGame } from "@/types/steam";
import type { RawPriceOffer } from "@/types/offers";

export interface PriceProvider {
  readonly id: string;
  readonly name: string;
  search(game: SteamGame): Promise<RawPriceOffer[]>;
}
