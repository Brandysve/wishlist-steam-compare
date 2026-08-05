export interface SteamGame {
  appId: number;
  name: string;
  capsuleUrl: string;
  steamUrl: string;
  normalPrice: number | null;
  currentPrice: number | null;
  discountPercent: number;
  currency: string | null;
}

export interface SteamWishlistResponse {
  games: SteamGame[];
  total: number;
}
