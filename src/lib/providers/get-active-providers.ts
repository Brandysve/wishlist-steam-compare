import { DemoPriceProvider } from "@/lib/providers/demo-price-provider";
import { InstantGamingProvider } from "@/lib/providers/instant-gaming-provider";
import type { PriceProvider } from "@/lib/providers/price-provider";

export interface ActiveProviders {
  providers: PriceProvider[];
  isDemo: boolean;
  hasRealProvider: boolean;
}

export function getActiveProviders(): ActiveProviders {
  const demoEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_PROVIDER === "true";

  return {
    providers: [new InstantGamingProvider(), ...(demoEnabled ? [new DemoPriceProvider()] : [])],
    isDemo: demoEnabled,
    hasRealProvider: true,
  };
}
