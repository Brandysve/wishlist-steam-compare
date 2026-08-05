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

const APP_DETAILS_BATCH_SIZE = 20;
const APP_DETAILS_CONCURRENCY = 4;

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
    cache: "no-store",
    redirect: "follow",
  });

  if (response.status === 404) throw new Error("WISHLIST_UNAVAILABLE");
  if (!response.ok) throw new Error(`STEAM_PROFILE_HTTP_${response.status}`);

  const xml = await response.text();
  const steamId = xml.match(/<steamID64>(\d{17})<\/steamID64>/)?.[1];
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
    cache: "no-store",
  });

  if (response.status === 403 || response.status === 404) {
    throw new Error("WISHLIST_UNAVAILABLE");
  }
  if (!response.ok) throw new Error(`STEAM_WISHLIST_HTTP_${response.status}`);

  const payload = (await response.json()) as WishlistResponse;
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

async function fetchAppDetailsBatch(appIds: number[]): Promise<SteamGame[]> {
  const endpoint = new URL("https://store.steampowered.com/api/appdetails");
  endpoint.searchParams.set("appids", appIds.join(","));
  endpoint.searchParams.set("cc", "be");
  endpoint.searchParams.set("l", "french");

  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "fr-BE,fr;q=0.9,en;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127.0 Safari/537.36",
    },
    next: { revalidate: 900 },
  });

  if (!response.ok) throw new Error(`STEAM_DETAILS_HTTP_${response.status}`);
  const payload = (await response.json()) as AppDetailsResponse;

  return appIds.flatMap((appId) => {
    const entry = payload[String(appId)];
    if (!entry?.success || !entry.data) return [];
    const game = normalizeGame(appId, entry.data);
    return game ? [game] : [];
  });
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

  const batches: number[][] = [];
  for (let index = 0; index < appIds.length; index += APP_DETAILS_BATCH_SIZE) {
    batches.push(appIds.slice(index, index + APP_DETAILS_BATCH_SIZE));
  }

  const games = (
    await mapWithConcurrency(batches, APP_DETAILS_CONCURRENCY, fetchAppDetailsBatch)
  ).flat();

  return games.sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
