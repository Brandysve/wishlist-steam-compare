export type SteamWishlistReference =
  | { kind: "profile"; value: string; canonicalUrl: string }
  | { kind: "vanity"; value: string; canonicalUrl: string };

const STEAM_ID_PATTERN = /^\d{17}$/;
const VANITY_PATTERN = /^[A-Za-z0-9_-]{2,64}$/;

export function parseSteamWishlistInput(
  rawInput: string,
): SteamWishlistReference | null {
  const input = rawInput.trim();

  if (!input) return null;

  if (STEAM_ID_PATTERN.test(input)) {
    return {
      kind: "profile",
      value: input,
      canonicalUrl: `https://store.steampowered.com/wishlist/profiles/${input}/`,
    };
  }

  if (VANITY_PATTERN.test(input)) {
    return {
      kind: "vanity",
      value: input,
      canonicalUrl: `https://store.steampowered.com/wishlist/id/${input}/`,
    };
  }

  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.hostname !== "store.steampowered.com") {
      return null;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] !== "wishlist" || segments.length < 3) return null;

    const type = segments[1];
    const value = segments[2];

    if (type === "profiles" && STEAM_ID_PATTERN.test(value)) {
      return {
        kind: "profile",
        value,
        canonicalUrl: `https://store.steampowered.com/wishlist/profiles/${value}/`,
      };
    }

    if (type === "id" && VANITY_PATTERN.test(value)) {
      return {
        kind: "vanity",
        value,
        canonicalUrl: `https://store.steampowered.com/wishlist/id/${value}/`,
      };
    }
  } catch {
    return null;
  }

  return null;
}
