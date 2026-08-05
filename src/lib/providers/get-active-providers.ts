import { DemoPriceProvider } from "@/lib/providers/demo-price-provider";
import type { PriceProvider } from "@/lib/providers/price-provider";

export interface ActiveProviders {
  providers: PriceProvider[];
  isDemo: boolean;
}

export function getActiveProviders(): ActiveProviders {
  const demoEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_PROVIDER === "true";

  if (demoEnabled) {
    return {
      providers: [new DemoPriceProvider()],
      isDemo: true,
    };
  }

  return {
    providers: [],
    isDemo: false,
  };
}
