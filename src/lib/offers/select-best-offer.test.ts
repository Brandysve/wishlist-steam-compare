import { describe, expect, it } from "vitest";
import { selectBestOffer } from "./select-best-offer";
import type { ClassifiedPriceOffer } from "@/types/offers";
import type { SteamGame } from "@/types/steam";

const game: SteamGame = {
  appId: 1,
  name: "Resident Evil 4",
  capsuleUrl: "https://example.com/image.jpg",
  steamUrl: "https://store.steampowered.com/app/1",
  normalPrice: 59.99,
  currentPrice: 39.99,
  discountPercent: 33,
  currency: "EUR",
};

function offer(
  title: string,
  price: number,
  productType: ClassifiedPriceOffer["productType"],
): ClassifiedPriceOffer {
  return {
    providerId: "test",
    providerName: "Test",
    externalId: title,
    title,
    url: "https://example.com",
    price,
    currency: "EUR",
    platform: "Steam PC",
    region: "Europe",
    inStock: true,
    productType,
    editionLabel: null,
    confidence: 95,
    rejectionReasons: [],
  };
}

describe("selectBestOffer", () => {
  it("retient une édition Deluxe moins chère que le jeu de base", () => {
    const selected = selectBestOffer(game, [
      offer("Resident Evil 4", 29.99, "base-game"),
      offer("Resident Evil 4 Deluxe Edition", 24.99, "enhanced-edition"),
    ]);

    expect(selected?.offer.title).toBe("Resident Evil 4 Deluxe Edition");
  });

  it("ignore les DLC même lorsqu’ils sont moins chers", () => {
    const selected = selectBestOffer(game, [
      offer("Resident Evil 4", 29.99, "base-game"),
      offer("Resident Evil 4 Separate Ways", 4.99, "dlc"),
    ]);

    expect(selected?.offer.productType).toBe("base-game");
  });

  it("marque une offre comme intéressante sous 18 euros", () => {
    const selected = selectBestOffer(game, [
      offer("Resident Evil 4", 17.99, "base-game"),
    ]);

    expect(selected?.isInteresting).toBe(true);
  });
});
