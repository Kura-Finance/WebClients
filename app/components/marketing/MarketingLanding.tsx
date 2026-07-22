"use client";

import MarketingNav from "./MarketingNav";
import MarketingHero from "./MarketingHero";
import ProductPillars from "./ProductPillars";
import FeatureNarratives from "./FeatureNarratives";
import PrinciplesStrip from "./PrinciplesStrip";
import TrustInfra from "./TrustInfra";
import FinalCTA from "./FinalCTA";
import MarketingFooter from "./MarketingFooter";

export default function MarketingLanding() {
  return (
    <div className="marketing-site min-h-screen w-full">
      <MarketingNav />
      <main>
        <MarketingHero />
        <ProductPillars />
        <FeatureNarratives />
        <PrinciplesStrip />
        <TrustInfra />
        <FinalCTA />
      </main>
      <MarketingFooter />
    </div>
  );
}
