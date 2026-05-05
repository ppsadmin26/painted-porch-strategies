import HeroSectionAlt from "@/components/pps/blue-door/_archive-v1.0/HeroSectionAlt";
import ProblemSectionAlt from "@/components/pps/blue-door/_archive-v1.0/ProblemSectionAlt";
import PositioningSectionAlt from "@/components/pps/blue-door/_archive-v1.0/PositioningSectionAlt";
import DiscoverSectionAlt from "@/components/pps/blue-door/_archive-v1.0/DiscoverSectionAlt";
import HowItWorksSectionAlt from "@/components/pps/blue-door/_archive-v1.0/HowItWorksSectionAlt";
import WhoThisIsForSectionAlt from "@/components/pps/blue-door/_archive-v1.0/WhoThisIsForSectionAlt";
import InvestmentSectionAlt from "@/components/pps/blue-door/_archive-v1.0/InvestmentSectionAlt";
import TruthSectionAlt from "@/components/pps/blue-door/_archive-v1.0/TruthSectionAlt";
import FAQSectionAlt from "@/components/pps/blue-door/_archive-v1.0/FAQSectionAlt";
import ExploreBeforeCommitSection from "@/components/pps/blue-door/_archive-v1.0/ExploreBeforeCommitSection";
import FinalCTASectionAlt from "@/components/pps/blue-door/_archive-v1.0/FinalCTASectionAlt";
import FooterAlt from "@/components/pps/blue-door/_archive-v1.0/FooterAlt";

export default function BlueDoorLandingArchive() {
  return (
    <div className="min-h-screen">
      <div className="bg-gold/90 text-navy text-center py-2 text-sm font-semibold font-poppins">
        ⚠️ ARCHIVE — This is the v1.0 version. <a href="/blue-door" className="underline">View current version →</a>
      </div>
      <HeroSectionAlt />
      <ProblemSectionAlt />
      <PositioningSectionAlt />
      <DiscoverSectionAlt />
      <HowItWorksSectionAlt />
      <WhoThisIsForSectionAlt />
      <InvestmentSectionAlt />
      <TruthSectionAlt />
      <FAQSectionAlt />
      <ExploreBeforeCommitSection />
      <FinalCTASectionAlt />
      <FooterAlt />
    </div>
  );
}
