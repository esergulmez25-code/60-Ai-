"use client";

/**
 * useSidebarSettings — navigation visibility settings.
 *
 * Reads the two settings that decide which navigation destinations are
 * visible (hidden items and debug mode) and keeps them in sync with the
 * SIDEBAR_SETTINGS_UPDATED_EVENT the settings screens dispatch.
 *
 * Mirrors the logic the desktop Sidebar runs inline, so the mobile tab bar
 * and the "More" screen honour the same preferences.
 */

import { useEffect, useState } from "react";
import {
  HIDDEN_SIDEBAR_ITEMS_SETTING_KEY,
  SIDEBAR_SETTINGS_UPDATED_EVENT,
  normalizeHiddenSidebarItems,
  type HideableSidebarItemId,
} from "@/shared/constants/sidebarVisibility";

export interface SidebarSettings {
  hiddenItems: HideableSidebarItemId[];
  showDebug: boolean;
}

export function useSidebarSettings(): SidebarSettings {
  const [hiddenItems, setHiddenItems] = useState<HideableSidebarItemId[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setShowDebug(data?.debugMode === true);
        setHiddenItems(normalizeHiddenSidebarItems(data?.[HIDDEN_SIDEBAR_ITEMS_SETTING_KEY]));
      })
      .catch(() => {});

    const handleSettingsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<Record<string, unknown>>).detail || {};

      if ("debugMode" in detail) {
        setShowDebug(detail.debugMode === true);
      }

      if (HIDDEN_SIDEBAR_ITEMS_SETTING_KEY in detail) {
        setHiddenItems(normalizeHiddenSidebarItems(detail[HIDDEN_SIDEBAR_ITEMS_SETTING_KEY]));
      }
    };

    window.addEventListener(SIDEBAR_SETTINGS_UPDATED_EVENT, handleSettingsUpdated as EventListener);

    return () => {
      active = false;
      window.removeEventListener(
        SIDEBAR_SETTINGS_UPDATED_EVENT,
        handleSettingsUpdated as EventListener
      );
    };
  }, []);

  return { hiddenItems, showDebug };
}

export default useSidebarSettings;
