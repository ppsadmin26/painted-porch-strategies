// Backward-compatible re-export. The canonical component lives at
// src/components/pps/ExploreBeforeDecideSection.tsx — edit it there.
import { ExploreBeforeDecideSection } from "@/components/pps/ExploreBeforeDecideSection";

export function ExploreBeforeCommitSection() {
  return <ExploreBeforeDecideSection background="white" />;
}

export default ExploreBeforeCommitSection;
