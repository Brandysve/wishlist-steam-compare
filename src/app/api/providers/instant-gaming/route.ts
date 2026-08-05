import { NextRequest, NextResponse } from "next/server";
import { fetchInstantGamingOffers } from "@/lib/providers/instant-gaming/fetch-search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  if (query.length < 2) {
    return NextResponse.json({ error: "La recherche est trop courte." }, { status: 400 });
  }

  try {
    const offers = await fetchInstantGamingOffers(query);
    return NextResponse.json({ offers });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Instant Gaming n’a pas répondu à temps."
        : "Les prix Instant Gaming sont temporairement indisponibles.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
