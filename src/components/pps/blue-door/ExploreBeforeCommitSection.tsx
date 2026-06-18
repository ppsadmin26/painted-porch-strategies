// Backward-compatible re-export. The canonical component lives at
// src/components/pps/ExploreBeforeDecideSection.tsx — edit it there.
import { ExploreBeforeDecideSection } from "@/components/pps/ExploreBeforeDecideSection";

export default function ExploreBeforeCommitSection() {
  return (
    <ExploreBeforeDecideSection
      background="muted"
      freeResourcesDescription="Get a taste of our frameworks and tools with our free resources."
    />
  );
}
