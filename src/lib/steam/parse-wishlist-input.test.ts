import { describe, expect, it } from "vitest";
import { parseSteamWishlistInput } from "./parse-wishlist-input";

describe("parseSteamWishlistInput", () => {
  it("normalise un SteamID64", () => {
    expect(parseSteamWishlistInput("76561198000000000")?.canonicalUrl).toBe(
      "https://store.steampowered.com/wishlist/profiles/76561198000000000/",
    );
  });

  it("normalise un identifiant personnalisé", () => {
    expect(parseSteamWishlistInput("Brandysve")?.canonicalUrl).toBe(
      "https://store.steampowered.com/wishlist/id/Brandysve/",
    );
  });

  it("refuse les domaines non Steam", () => {
    expect(
      parseSteamWishlistInput("https://example.com/wishlist/id/Brandysve/"),
    ).toBeNull();
  });
});
