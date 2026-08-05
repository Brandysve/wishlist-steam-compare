import { describe, expect, it } from "vitest";
import { classifyOffer } from "./classify-offer";
import type { RawPriceOffer } from "@/types/offers";

function rawOffer(platform: string | null): RawPriceOffer {
  return {
    providerId: "instant-gaming",
    providerName: "Instant Gaming",
    externalId: platform ?? "unknown",
    title: "Baldur's Gate 3",
    url: "https://example.com",
    price: 29.99,
    currency: "EUR",
    platform,
    region: "Europe",
    inStock: true,
  };
}

describe("classifyOffer platform filtering", () => {
  it("accepte une offre Steam", () => {
    const result = classifyOffer("Baldur's Gate 3", rawOffer("Steam"));

    expect(result.rejectionReasons).not.toContain(
      "Seules les offres activables sur Steam sont acceptées.",
    );
  });

  it.each(["GOG.com", "Epic Games", "Ubisoft Connect", "Xbox", null])(
    "rejette la plateforme %s",
    (platform) => {
      const result = classifyOffer("Baldur's Gate 3", rawOffer(platform));

      expect(result.rejectionReasons).toContain(
        "Seules les offres activables sur Steam sont acceptées.",
      );
    },
  );
});
