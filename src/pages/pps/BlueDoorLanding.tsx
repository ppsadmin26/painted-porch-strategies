import PartnershipPromise from "@/components/pps/PartnershipPromise";
import HeroSectionAlt from "@/components/pps/blue-door/HeroSectionAlt";
import ProblemSectionAlt from "@/components/pps/blue-door/ProblemSectionAlt";
import CostOfGapSection from "@/components/pps/blue-door/CostOfGapSection";
import DiscoverSectionAlt from "@/components/pps/blue-door/DiscoverSectionAlt";
import WhoThisIsForSectionAlt from "@/components/pps/blue-door/WhoThisIsForSectionAlt";
import HowItWorksInvestmentSection from "@/components/pps/blue-door/HowItWorksInvestmentSection";
import TrustSignalsSection from "@/components/pps/blue-door/TrustSignalsSection";
import FAQSectionAlt from "@/components/pps/blue-door/FAQSectionAlt";
import FinalCTASectionAlt from "@/components/pps/blue-door/FinalCTASectionAlt";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import blueDoorHero from "@/assets/blue-door-hero.jpg";
import { blueDoorSeoTitle, blueDoorSeoDescription, blueDoorServiceJsonLd } from "@/config/blueDoor";


export default function BlueDoorLanding() {
  useDocumentSeo({
    title: blueDoorSeoTitle(),
    description: blueDoorSeoDescription(),
    ogImage: blueDoorHero,
    jsonLd: blueDoorServiceJsonLd(),
  });
  return (
    <div className="min-h-screen">
      <HeroSectionAlt />
      <ProblemSectionAlt />
      <CostOfGapSection />
      <DiscoverSectionAlt />
      <WhoThisIsForSectionAlt />
      <HowItWorksInvestmentSection />
      <TrustSignalsSection />
      <FAQSectionAlt />
      <FinalCTASectionAlt />
      <PartnershipPromise />
    </div>
  );
}
