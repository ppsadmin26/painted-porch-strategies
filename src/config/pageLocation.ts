/**
 * Derives a page's structural "location" from the sitemap tree.
 *
 * Single source of structural truth = `sitemapData` in `src/pages/pps/Sitemap.tsx`.
 * No DB column needed; everything is computed from the tree.
 *
 *   - `main-nav`  — top-level node (depth 0) with a path
 *   - `subpage`   — nested under a Main Nav parent (depth >= 1)
 *   - `standalone` — exists somewhere in App.tsx routing but NOT in the sitemap tree
 *   - `unlisted`  — DB row only (cleanup candidate)
 */

import { sitemapData, type SitemapNode } from "@/pages/pps/Sitemap";

export type LocationKind = "main-nav" | "subpage" | "standalone" | "unlisted";

export interface PageLocation {
  kind: LocationKind;
  /** Closest ancestor path in the sitemap tree, if any. */
  parentPath?: string;
  /** Closest ancestor label in the sitemap tree, if any. */
  parentLabel?: string;
  /** Top-level section label this path lives under, if any. */
  sectionLabel?: string;
}

export const LOCATION_META: Record<LocationKind, { label: string; description: string; pillClass: string }> = {
  "main-nav": {
    label: "Main Nav",
    description: "Top-level section in the public navigation tree.",
    pillClass: "bg-pps-teal/15 text-pps-navy border border-pps-teal/40",
  },
  subpage: {
    label: "Subpage",
    description: "Nested under a Main Nav parent.",
    pillClass: "bg-pps-navy/10 text-pps-navy border border-pps-navy/20",
  },
  standalone: {
    label: "Standalone",
    description: "Routed in the app but not listed in the sitemap tree (utility, thank-you, redirect, etc.).",
    pillClass: "bg-pps-charcoal/10 text-pps-charcoal border border-pps-charcoal/25",
  },
  unlisted: {
    label: "Unlisted",
    description: "Database row exists but the path is not in the sitemap tree.",
    pillClass: "bg-pps-raspberry/10 text-pps-raspberry border border-pps-raspberry/30",
  },
};

interface IndexEntry {
  depth: number;
  parentPath?: string;
  parentLabel?: string;
  sectionLabel?: string;
}

let cachedIndex: Map<string, IndexEntry> | null = null;

function buildIndex(): Map<string, IndexEntry> {
  if (cachedIndex) return cachedIndex;
  const idx = new Map<string, IndexEntry>();
  const walk = (
    nodes: SitemapNode[],
    depth: number,
    parent: { path?: string; label?: string } | null,
    sectionLabel: string | undefined,
  ) => {
    for (const node of nodes) {
      const nextSection = depth === 0 ? node.label : sectionLabel;
      if (node.path) {
        idx.set(node.path, {
          depth,
          parentPath: parent?.path,
          parentLabel: parent?.label,
          sectionLabel: nextSection,
        });
      }
      if (node.children) {
        // If this node has no path, children still inherit it as label-only parent.
        walk(node.children, depth + 1, { path: node.path, label: node.label }, nextSection);
      }
    }
  };
  walk(sitemapData, 0, null, undefined);
  cachedIndex = idx;
  return idx;
}

/** Look up the structural location for a given route path. */
export function resolveLocation(
  path: string,
  options?: { knownRoutePaths?: Set<string> },
): PageLocation {
  const idx = buildIndex();
  const entry = idx.get(path);
  if (entry) {
    if (entry.depth === 0) {
      return { kind: "main-nav", sectionLabel: entry.sectionLabel };
    }
    return {
      kind: "subpage",
      parentPath: entry.parentPath,
      parentLabel: entry.parentLabel,
      sectionLabel: entry.sectionLabel,
    };
  }
  if (options?.knownRoutePaths && !options.knownRoutePaths.has(path)) {
    return { kind: "unlisted" };
  }
  return { kind: "standalone" };
}
