"use client";

/**
 * MobileTabBar — bottom tab navigation for small screens.
 *
 * Navigation model 1a from the OmniRoute mobile wireframes: four daily
 * destinations plus "More" for the long tail. Hidden on lg and up, where the
 * persistent sidebar takes over.
 *
 * The "More" tab is active whenever the current route is not one of the four
 * tab destinations, so drilling into anything reached through More keeps the
 * bar showing where you are.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { useSidebarSettings } from "@/shared/hooks/useSidebarSettings";
import { buildMobileNav, MOBILE_MORE_HREF, type MobileNavItem } from "@/shared/constants/mobileNav";

function isItemActive(pathname: string, item: MobileNavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function MobileTabBar() {
  const pathname = usePathname() || "";
  const t = useTranslations("sidebar");
  const { hiddenItems, showDebug } = useSidebarSettings();
  const { tabs } = buildMobileNav({ hiddenItems, showDebug });

  // Fall back to the message key's own text when a locale has not been
  // translated yet, the way the sidebar does for its section titles.
  const label = (key: string, fallback: string) =>
    typeof t.has === "function" && t.has(key) ? t(key) : fallback;

  const activeTab = tabs.find((item) => isItemActive(pathname, item));
  const moreActive = !activeTab;

  const cells: {
    key: string;
    href: string;
    icon: string;
    text: string;
    active: boolean;
  }[] = [
    ...tabs.map((item) => ({
      key: item.id,
      href: item.href,
      icon: item.icon,
      text: t(item.i18nKey),
      active: item === activeTab,
    })),
    {
      key: "more",
      href: MOBILE_MORE_HREF,
      icon: "more_horiz",
      text: label("more", "More"),
      active: moreActive,
    },
  ];

  return (
    <nav
      aria-label="Primary"
      // pb-safe clears the home indicator once installed to a home screen;
      // px-safe clears the notch in landscape.
      className="pb-safe px-safe z-30 shrink-0 border-t border-black/5 bg-vibrancy backdrop-blur-xl [--safe-pad-x:0px] [--safe-pad:var(--desktop-safe-bottom)] lg:hidden dark:border-white/5"
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
      >
        {cells.map((cell) => (
          <li key={cell.key} className="min-w-0">
            <Link
              href={cell.href}
              aria-current={cell.active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 transition-colors",
                cell.active ? "text-primary" : "text-text-muted active:text-text-main"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "material-symbols-outlined text-[22px] leading-none",
                  cell.active && "fill-1"
                )}
              >
                {cell.icon}
              </span>
              <span className="w-full truncate text-center text-[11px] font-medium leading-tight">
                {cell.text}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
