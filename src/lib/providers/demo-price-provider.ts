import type { PriceProvider } from "@/lib/providers/price-provider";
import type { SteamGame } from "@/types/steam";
import type { RawPriceOffer } from "@/types/offers";

/**
 * Development-only provider used to validate the comparison engine without
 * relying on a retailer integration. It must never be enabled in production.
 */
export class DemoPriceProvider implements PriceProvider {
  readonly id = "demo";
  readonly name = "Démonstration";

  async search(game: SteamGame): Promise<RawPriceOffer[]> {
    const referencePrice = game.normalPrice ?? game.currentPrice ?? 39.99;
    const basePrice = Math.max(Math.round(referencePrice * 0.55 * 100) / 100, 4.99);

    return [
      {
        providerId: this.id,
        providerName: this.name,
        externalId: `${game.appId}-base`,
        title: game.name,
        url: game.steamUrl,
        price: basePrice,
        currency: game.currency ?? "EUR",
        platform: "Steam PC",
        region: "Europe",
        inStock: true,
      },
      {
        providerId: this.id,
        providerName: this.name,
        externalId: `${game.appId}-deluxe`,
        title: `${game.name} Deluxe Edition`,
        url: game.steamUrl,
        price: Math.max(basePrice - 2, 2.99),
        currency: game.currency ?? "EUR",
        platform: "Steam PC",
        region: "Europe",
        inStock: true,
      },
      {
        providerId: this.id,
        providerName: this.name,
        externalId: `${game.appId}-dlc`,
        title: `${game.name} DLC Pack`,
        url: game.steamUrl,
        price: 3.99,
        currency: game.currency ?? "EUR",
        platform: "Steam PC",
        region: "Europe",
        inStock: true,
      },
    ];
  }
}
