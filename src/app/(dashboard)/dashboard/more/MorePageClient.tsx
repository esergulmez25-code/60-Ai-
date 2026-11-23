"use client";

/**
 * MorePageClient — the "More" tab of the mobile bottom-tab navigation.
 *
 * Holds every destination that does not earn a permanent tab, grouped by
 * purpose (Monitor / Access / Tools / System / Help) as sketched in the
 * OmniRoute mobile wireframes. Also carries the cloud sync indicator and the
 * restart/shutdown controls, which on desktop live in the sidebar footer.
 *
 * Only reachable on small screens — the bottom tab bar is hidden from lg up,
 * where the sidebar already lists these destinations. Visiting the route on a
 * wide screen still works and simply renders the same list.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSidebarSettings } from "@/shared/hooks/useSidebarSettings";
import { buildMobileNav, type MobileNavItem } from "@/shared/constants/mobileNav";
import CloudSyncStatus from "@/shared/components/CloudSyncStatus";
import ServerControls from "@/shared/components/ServerControls";

const isE2EMode = process.env.NEXT_PUBLIC_OMNIROUTE_E2E_MODE === "1";

function MoreRow({ item, label }: { item: MobileNavItem; label: string }) {
  const content = (
    <>
      <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-text-muted">
        {item.icon}
      </span>
      <span className="flex-1 truncate text-[15px] font-medium text-text-main">{label}</span>
      <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-text-muted/60">
        {item.external ? "open_in_new" : "chevron_right"}
      </span>
    </>
  );

  const className =
    "flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-black/5 dark:active:bg-white/5";

  if (item.external) {
    return (
      <li className="border-b border-border last:border-b-0">
        <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
          {content}
        </a>
      </li>
    );
  }

  return (
    <li className="border-b border-border last:border-b-0">
      <Link href={item.href} className={className}>
        {content}
      </Link>
    </li>
  );
}

export default function MorePageClient() {
  const t = useTranslations("sidebar");
  const { hiddenItems, showDebug } = useSidebarSettings();
  const { groups } = buildMobileNav({ hiddenItems, showDebug });

  // Fall back to English when a locale has not been translated yet, the way
  // the sidebar does for its section titles.
  const label = (key: string, fallback: string) =>
    typeof t.has === "function" && t.has(key) ? t(key) : fallback;

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.id}>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-text-muted/60">
            {label(group.titleKey, group.titleFallback)}
          </h2>
          <ul className="overflow-hidden rounded-xl border border-border bg-surface">
            {group.items.map((item) => (
              <MoreRow key={item.id} item={item} label={t(item.i18nKey)} />
            ))}
          </ul>
        </section>
      ))}

      {/* Server controls and sync status, which on desktop live in the sidebar
          footer. CloudSyncStatus renders nothing while sync is disabled, so it
          is left unwrapped rather than leaving an empty card behind. */}
      <div className="flex flex-col gap-3 border-t border-border pt-5">
        {!isE2EMode && <CloudSyncStatus />}
        <ServerControls />
      </div>
    </div>
  );
}
