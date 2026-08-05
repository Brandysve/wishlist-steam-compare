import { parseSteamWishlistInput } from "@/lib/steam/parse-wishlist-input";
import type { SteamGame } from "@/types/steam";

type WishlistItem = { appid?: number };
type WishlistResponse = { response?: { items?: WishlistItem[] } };

type AppDetailsData = {
  name?: string;
  header_image?: string;
  price_overview?: {
    currency?: string;
    initial?: number;
    final?: number;
    discount_percent?: number;
  };
};

type AppDetailsResponse = Record<
  string,
  { success?: boolean; data?: AppDetailsData }
>;

type AppDetailsResult = {
  game: SteamGame | null;
  rateLimited: boolean;
};

const APP_DETAILS_CONCURRENCY = 3;
const RATE_LIMIT_PATTERNS = [
  "too many requests",
  "trop de demandes",
  "please wait and try your request again later",
  "veuillez patienter",
];

function isRateLimitedBody(body: string): boolean {
  const normalized = body.toLowerCase();
  return RATE_LIMIT_PATTERNS.some((pattern) => normalized.includes(pattern));
}

async function readResponseText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

async function resolveSteamId(
  reference: NonNullable<ReturnType<typeof parseSteamWishlistInput>>,
): Promise<string> {
  if (reference.kind === "profile") return reference.value;

  const profileUrl = new URL(
    `https://steamcommunity.com/id/${encodeURIComponent(reference.value)}/`,
  );
  profileUrl.searchParams.set("xml", "1");

  const response = await fetch(profileUrl, {
    headers: {
      Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "fr-BE,fr;q=0.9,en;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127.0 Safari/537.36",
    },
    next: { revalidate: 86400 },
    redirect: "follow",
  });

  const body = await readResponseText(response);
  if (response.status === 429 || isRateLimitedBody(body)) {
    throw new Error("STEAM_RATE_LIMITED");
  }
  if (response.status === 404) throw new Error("WISHLIST_UNAVAILABLE");
  if (!response.ok) throw new Error(`STEAM_PROFILE_HTTP_${response.status}`);

  const steamId = body.match(/<steamID64>(\d{17})<\/steamID64>/)?.[1];
  if (!steamId) throw new Error("WISHLIST_UNAVAILABLE");
  return steamId;
}

async function fetchWishlistAppIds(steamId: string): Promise<number[]> {
  const endpoint = new URL(
    "https://api.steampowered.com/IWishlistService/GetWishlist/v1/",
  );
  endpoint.searchParams.set("steamid", steamId);

  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "fr-BE,fr;q=0.9,en;q=0.8",
      "User-Agent": "WishlistSteamCompare/0.1",
    },
    next: { revalidate: 1800 },
  });

  const body = await readResponseText(response);
  if (response.status === 429 || isRateLimitedBody(body)) {
    throw new Error("STEAM_RATE_LIMITED");
  }
  if (response.status === 403 || response.status === 404) {
    throw new Error("WISHLIST_UNAVAILABLE");
  }
  if (!response.ok) throw new Error(`STEAM_WISHLIST_HTTP_${response.status}`);

  let payload: WishlistResponse;
  try {
    payload = JSON.parse(body) as WishlistResponse;
  } catch {
    throw new Error("STEAM_WISHLIST_INVALID_RESPONSE");
  }

  return (payload.response?.items ?? [])
    .map((item) => item.appid)
    .filter((appid): appid is number => Number.isSafeInteger(appid));
}

function normalizeGame(appId: number, details: AppDetailsData): SteamGame | null {
  if (!details.name) return null;

  const price = details.price_overview;
  return {
    appId,
    name: details.name,
    capsuleUrl:
      details.header_image ??
      `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
    steamUrl: `https://store.steampowered.com/app/${appId}/`,
    normalPrice: price?.initial != null ? price.initial / 100 : null,
    currentPrice: price?.final != null ? price.final / 100 : null,
    discountPercent: price?.discount_percent ?? 0,
    currency: price?.currency ?? null,
  };
}

async function fetchAppDetails(appId: number): Promise<AppDetailsResult> {
  const endpoint = new URL("https://store.steampowered.com/api/appdetails");
  endpoint.searchParams.set("appids", String(appId));
  endpoint.searchParams.set("cc", "be");
  endpoint.searchParams.set("l", "french");

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "fr-BE,fr;q=0.9,en;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127.0 Safari/537.36",
      },
      next: { revalidate: 21600 },
    });

    const body = await readResponseText(response);
    if (response.status === 429 || isRateLimitedBody(body)) {
      return { game: null, rateLimited: true };
    }
    if (!response.ok) return { game: null, rateLimited: false };

    const payload = JSON.parse(body) as AppDetailsResponse;
    const entry = payload[String(appId)];
    if (!entry?.success || !entry.data) {
      return { game: null, rateLimited: false };
    }

    return {
      game: normalizeGame(appId, entry.data),
      rateLimited: false,
    };
  } catch {
    return { game: null, rateLimited: false };
  }
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(values[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () => worker()),
  );
  return results;
}

export async function fetchSteamWishlist(rawInput: string): Promise<SteamGame[]> {
  const reference = parseSteamWishlistInput(rawInput);
  if (!reference) throw new Error("INVALID_WISHLIST");

  const steamId = await resolveSteamId(reference);
  const appIds = await fetchWishlistAppIds(steamId);
  if (appIds.length === 0) return [];

  const results = await mapWithConcurrency(
    appIds,
    APP_DETAILS_CONCURRENCY,
    fetchAppDetails,
  );
  const games = results.flatMap((result) => (result.game ? [result.game] : []));

  if (games.length === 0 && results.some((result) => result.rateLimited)) {
    throw new Error("STEAM_RATE_LIMITED");
  }

  return games.sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
