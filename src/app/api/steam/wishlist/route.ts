import { NextRequest, NextResponse } from "next/server";
import { fetchSteamWishlist } from "@/lib/steam/fetch-wishlist";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const wishlist = request.nextUrl.searchParams.get("wishlist") ?? "";

  try {
    const games = await fetchSteamWishlist(wishlist);
    return NextResponse.json({ games, total: games.length });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";

    if (code === "INVALID_WISHLIST") {
      return NextResponse.json({ error: "Adresse de wishlist invalide." }, { status: 400 });
    }

    if (code === "WISHLIST_UNAVAILABLE") {
      return NextResponse.json(
        { error: "Cette wishlist est privée, introuvable ou indisponible." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Steam ne répond pas pour le moment. Réessayez plus tard." },
      { status: 502 },
    );
  }
}
