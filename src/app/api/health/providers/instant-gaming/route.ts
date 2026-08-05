import { NextResponse } from "next/server";
import { fetchInstantGamingOffers } from "@/lib/providers/instant-gaming/fetch-search";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    const offers = await fetchInstantGamingOffers("Resident Evil 4");
    const durationMs = Date.now() - startedAt;

    return NextResponse.json(
      {
        status: offers.length > 0 ? "ok" : "degraded",
        provider: "instant-gaming",
        offersFound: offers.length,
        durationMs,
        checkedAt: new Date().toISOString(),
      },
      {
        status: offers.length > 0 ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    return NextResponse.json(
      {
        status: "unavailable",
        provider: "instant-gaming",
        offersFound: 0,
        durationMs: Date.now() - startedAt,
        checkedAt: new Date().toISOString(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
