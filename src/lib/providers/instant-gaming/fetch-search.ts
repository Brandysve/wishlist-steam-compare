import { parseInstantGamingSearchHtml } from "@/lib/providers/instant-gaming/parse-search-html";
import type { RawPriceOffer } from "@/types/offers";

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; offers: RawPriceOffer[] }>();

export async function fetchInstantGamingOffers(
  query: string,
): Promise<RawPriceOffer[]> {
  const normalizedQuery = query.trim().slice(0, 120);
  if (!normalizedQuery) return [];

  const cacheKey = normalizedQuery.toLocaleLowerCase("fr");
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.offers;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const url = new URL("https://www.instant-gaming.com/fr/rechercher/");
    url.searchParams.set("query", normalizedQuery);
    url.searchParams.set("currency", "EUR");

    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "fr-BE,fr;q=0.9,en;q=0.7",
        "User-Agent":
          "WishlistSteamCompare/0.1 (+https://github.com/Brandysve/wishlist-steam-compare)",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Instant Gaming a répondu ${response.status}.`);
    }

    const html = await response.text();
    const offers = parseInstantGamingSearchHtml(html).slice(0, 20);
    cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, offers });
    return offers;
  } finally {
    clearTimeout(timeout);
  }
}
