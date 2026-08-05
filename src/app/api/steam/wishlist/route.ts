import { NextRequest, NextResponse } from "next/server";
import { fetchSteamWishlist } from "@/lib/steam/fetch-wishlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const wishlist = request.nextUrl.searchParams.get("wishlist") ?? "";

  try {
    const games = await fetchSteamWishlist(wishlist);
    return NextResponse.json(
      { games, total: games.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        },
      },
    );
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

    if (code === "STEAM_RATE_LIMITED") {
      return NextResponse.json(
        {
          error:
            "Steam limite temporairement les requêtes. Patientez quelques heures avant de réessayer.",
        },
        {
          status: 429,
          headers: { "Retry-After": "3600" },
        },
      );
    }

    console.error("Steam wishlist request failed", { code });

    return NextResponse.json(
      { error: "Steam ne répond pas pour le moment. Réessayez plus tard." },
      { status: 502 },
    );
  }
}
