/**
 * Mobile navigation model — bottom tab bar + "More".
 *
 * Implements navigation model 1a from the OmniRoute mobile wireframes:
 * four daily destinations in a fixed bottom tab bar, with a fifth "More"
 * tab holding the long tail grouped by purpose.
 *
 * Single source of truth is still SIDEBAR_SECTIONS in ./sidebarVisibility —
 * this module only decides *where* each of those destinations surfaces on
 * mobile. Items the user has hidden, and debug-only items while debug mode
 * is off, are filtered out exactly as the desktop sidebar does.
 */

import {
  SIDEBAR_SECTIONS,
  type HideableSidebarItemId,
  type SidebarItemDefinition,
} from "./sidebarVisibility";

/** The four destinations that earn a permanent tab, in bar order. */
export const MOBILE_TAB_ITEM_IDS = ["home", "providers", "combos", "logs"] as const;

export type MobileTabItemId = (typeof MOBILE_TAB_ITEM_IDS)[number];

/** Route backing the "More" tab. */
export const MOBILE_MORE_HREF = "/dashboard/more";

export interface MobileMoreGroupDefinition {
  id: string;
  titleKey: string;
  titleFallback: string;
  /** Item ids in display order. Ids absent from SIDEBAR_SECTIONS are ignored. */
  items: readonly HideableSidebarItemId[];
}

/**
 * Grouping for the "More" screen.
 *
 * The wireframe sketches four groups — MONITOR / ACCESS / TOOLS / SYSTEM —
 * against a subset of destinations. These groups keep that intent and place
 * every remaining real destination into one of them, with HELP split out
 * because those two items leave the app.
 */
export const MOBILE_MORE_GROUPS: readonly MobileMoreGroupDefinition[] = [
  {
    id: "monitor",
    titleKey: "mobileMonitor",
    titleFallback: "Monitor",
    items: ["analytics", "health", "costs", "limits", "cache"],
  },
  {
    id: "access",
    titleKey: "mobileAccess",
    titleFallback: "Access",
    items: ["endpoints", "api-manager"],
  },
  {
    id: "tools",
    titleKey: "mobileTools",
    titleFallback: "Tools",
    items: [
      "playground",
      "cli-tools",
      "agents",
      "memory",
      "skills",
      "media",
      "auto-combo",
      "translator",
      "search-tools",
    ],
  },
  {
    id: "system",
    titleKey: "mobileSystem",
    titleFallback: "System",
    items: ["audit", "settings"],
  },
  {
    id: "help",
    titleKey: "mobileHelp",
    titleFallback: "Help",
    items: ["docs", "issues"],
  },
] as const;

export interface MobileNavItem extends SidebarItemDefinition {
  /** True when the item only shows while debug mode is on. */
  debugOnly: boolean;
}

export interface MobileMoreGroup extends Omit<MobileMoreGroupDefinition, "items"> {
  items: MobileNavItem[];
}

export interface MobileNav {
  tabs: MobileNavItem[];
  groups: MobileMoreGroup[];
}

/** Every sidebar item by id, with the debug flag of its owning section. */
function allItems(): Map<HideableSidebarItemId, MobileNavItem> {
  const byId = new Map<HideableSidebarItemId, MobileNavItem>();

  for (const section of SIDEBAR_SECTIONS) {
    for (const item of section.items) {
      byId.set(item.id, { ...item, debugOnly: section.visibility === "debug" });
    }
  }

  return byId;
}

export interface BuildMobileNavOptions {
  /** Item ids the user has hidden in settings. */
  hiddenItems?: readonly string[];
  /** Whether debug mode is on. */
  showDebug?: boolean;
}

/**
 * Resolve the mobile navigation for the current visibility settings.
 *
 * Returns the tab items in bar order (excluding "More", which is always
 * present) and the "More" groups with empty groups dropped.
 */
export function buildMobileNav({
  hiddenItems = [],
  showDebug = false,
}: BuildMobileNavOptions = {}): MobileNav {
  const byId = allItems();
  const hidden = new Set(hiddenItems);

  const isVisible = (item: MobileNavItem | undefined): item is MobileNavItem =>
    item !== undefined && !hidden.has(item.id) && (showDebug || !item.debugOnly);

  const tabs = MOBILE_TAB_ITEM_IDS.map((id) => byId.get(id)).filter(isVisible);

  // Anything with a permanent tab must not also appear under "More".
  const tabIds = new Set<string>(tabs.map((item) => item.id));

  const groups = MOBILE_MORE_GROUPS.map((group) => ({
    ...group,
    items: group.items
      .filter((id) => !tabIds.has(id))
      .map((id) => byId.get(id))
      .filter(isVisible),
  })).filter((group) => group.items.length > 0);

  return { tabs, groups };
}
