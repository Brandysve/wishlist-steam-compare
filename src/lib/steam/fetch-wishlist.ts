import { parseSteamWishlistInput } from "@/lib/steam/parse-wishlist-input";
import type { SteamGame } from "@/types/steam";

type RawSteamSub = {
  price?: number;
  discount_pct?: number;
  discount_block?: string;
};

type RawSteamGame = {
  name?: string;
  capsule?: string;
  subs?: RawSteamSub[];
};

type RawSteamWishlistPage = Record<string, RawSteamGame>;

const MAX_PAGES = 20;
const PAGE_SIZE = 50;

function parseCurrency(discountBlock?: string): string | null {
  if (!discountBlock) return null;
  const match = discountBlock.match(/(?:€|EUR|USD|GBP|£|\$)/i);
  if (!match) return null;
  if (match[0] === "€" || match[0].toUpperCase() === "EUR") return "EUR";
  if (match[0] === "£" || match[0].toUpperCase() === "GBP") return "GBP";
  return "USD";
}

function normalizeGame(appId: string, raw: RawSteamGame): SteamGame | null {
  const numericAppId = Number(appId);
  if (!Number.isSafeInteger(numericAppId) || !raw.name) return null;

  const pricedSub = raw.subs?.find((sub) => typeof sub.price === "number");
  const currentPrice = pricedSub?.price != null ? pricedSub.price / 100 : null;
  const discountPercent = pricedSub?.discount_pct ?? 0;
  const normalPrice =
    currentPrice != null && discountPercent > 0
      ? Number((currentPrice / (1 - discountPercent / 100)).toFixed(2))
      : currentPrice;

  return {
    appId: numericAppId,
    name: raw.name,
    capsuleUrl:
      raw.capsule ??
      `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${numericAppId}/header.jpg`,
    steamUrl: `https://store.steampowered.com/app/${numericAppId}/`,
    normalPrice,
    currentPrice,
    discountPercent,
    currency: parseCurrency(pricedSub?.discount_block),
  };
}

export async function fetchSteamWishlist(rawInput: string): Promise<SteamGame[]> {
  const reference = parseSteamWishlistInput(rawInput);
  if (!reference) throw new Error("INVALID_WISHLIST");

  const games = new Map<number, SteamGame>();

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const endpoint = new URL("wishlistdata/", reference.canonicalUrl);
    endpoint.searchParams.set("p", String(page));
    endpoint.searchParams.set("cc", "be");
    endpoint.searchParams.set("l", "french");

    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Accept-Language": "fr-BE,fr;q=0.9,en;q=0.8",
        Referer: reference.canonicalUrl,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127.0 Safari/537.36",
      },
      cache: "no-store",
      redirect: "follow",
    });

    if (response.status === 403 || response.status === 404) {
      throw new Error("WISHLIST_UNAVAILABLE");
    }
    if (!response.ok) throw new Error(`STEAM_HTTP_${response.status}`);

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      throw new Error(`STEAM_INVALID_CONTENT_${response.status}`);
    }

    const data = (await response.json()) as RawSteamWishlistPage;
    const entries = Object.entries(data);
    if (entries.length === 0) break;

    for (const [appId, rawGame] of entries) {
      const game = normalizeGame(appId, rawGame);
      if (game) games.set(game.appId, game);
    }

    if (entries.length < PAGE_SIZE) break;
  }

  return [...games.values()].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
