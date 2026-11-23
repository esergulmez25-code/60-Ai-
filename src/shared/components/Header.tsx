"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import TokenHealthBadge from "./TokenHealthBadge";
import DegradationBadge from "./DegradationBadge";
import LanguageSelector from "./LanguageSelector";
import ProviderIcon from "./ProviderIcon";
import { useTranslations } from "next-intl";
import {
  OAUTH_PROVIDERS,
  APIKEY_PROVIDERS,
  FREE_PROVIDERS,
  CLAUDE_CODE_COMPATIBLE_PREFIX,
  OPENAI_COMPATIBLE_PREFIX,
  ANTHROPIC_COMPATIBLE_PREFIX,
} from "@/shared/constants/providers";
import { useIsElectron } from "@/shared/hooks/useElectron";

const isE2EMode = process.env.NEXT_PUBLIC_OMNIROUTE_E2E_MODE === "1";

function usePageInfo(pathname: string | null): {
  title: string;
  description: string;
  breadcrumbs: { label: string; href?: string; image?: string; providerId?: string }[];
} {
  const t = useTranslations("header");
  const tSidebar = useTranslations("sidebar");

  // Read a label from the "sidebar" namespace, falling back to English when a
  // locale has not been translated yet.
  const tNav = (key: string, fallback: string) =>
    typeof tSidebar.has === "function" && tSidebar.has(key) ? tSidebar(key) : fallback;

  if (!pathname) return { title: "", description: "", breadcrumbs: [] };

  // Provider detail page: /dashboard/providers/[id]
  const providerMatch = pathname.match(/\/providers\/([^/]+)$/);
  if (providerMatch) {
    const providerId = providerMatch[1];
    const providerInfo =
      OAUTH_PROVIDERS[providerId] || FREE_PROVIDERS[providerId] || APIKEY_PROVIDERS[providerId];

    if (providerInfo) {
      return {
        title: providerInfo.name,
        description: "",
        breadcrumbs: [
          { label: t("providers"), href: "/dashboard/providers" },
          { label: providerInfo.name, providerId: providerInfo.id },
        ],
      };
    }

    if (providerId.startsWith(CLAUDE_CODE_COMPATIBLE_PREFIX)) {
      return {
        title: "CC Compatible",
        description: "",
        breadcrumbs: [
          { label: t("providers"), href: "/dashboard/providers" },
          { label: "CC Compatible", providerId: "claude" },
        ],
      };
    }

    if (providerId.startsWith(OPENAI_COMPATIBLE_PREFIX)) {
      return {
        title: t("openaiCompatible"),
        description: "",
        breadcrumbs: [
          { label: t("providers"), href: "/dashboard/providers" },
          { label: t("openaiCompatible"), providerId: "oai-cc" },
        ],
      };
    }

    if (providerId.startsWith(ANTHROPIC_COMPATIBLE_PREFIX)) {
      return {
        title: t("anthropicCompatible"),
        description: "",
        breadcrumbs: [
          { label: t("providers"), href: "/dashboard/providers" },
          { label: t("anthropicCompatible"), providerId: "anthropic-m" },
        ],
      };
    }
  }

  if (pathname.includes("/providers"))
    return {
      title: t("providers"),
      description: t("providerDescription"),
      breadcrumbs: [],
    };
  if (pathname.includes("/combos"))
    return { title: t("combos"), description: t("comboDescription"), breadcrumbs: [] };
  if (pathname.includes("/usage"))
    return {
      title: t("usage"),
      description: t("usageDescription"),
      breadcrumbs: [],
    };
  if (pathname.includes("/analytics"))
    return {
      title: t("analytics"),
      description: t("analyticsDescription"),
      breadcrumbs: [],
    };
  if (pathname.includes("/cli-tools"))
    return { title: t("cliTools"), description: t("cliToolsDescription"), breadcrumbs: [] };
  if (pathname === "/dashboard")
    return { title: t("home"), description: t("homeDescription"), breadcrumbs: [] };
  // Logs and More are bottom-tab destinations but have no "header" namespace
  // entry; take their titles from "sidebar", which already names every
  // navigation destination in every locale.
  if (pathname.includes("/logs"))
    return { title: tNav("logs", "Logs"), description: "", breadcrumbs: [] };
  if (pathname.includes("/more"))
    return { title: tNav("more", "More"), description: "", breadcrumbs: [] };
  if (pathname.includes("/mcp"))
    return { title: t("mcp"), description: t("mcpDescription"), breadcrumbs: [] };
  if (pathname.includes("/a2a"))
    return { title: t("a2a"), description: t("a2aDescription"), breadcrumbs: [] };
  if (pathname.includes("/endpoint"))
    return { title: t("endpoint"), description: t("endpointDescription"), breadcrumbs: [] };
  if (pathname.includes("/profile"))
    return { title: t("settings"), description: t("settingsDescription"), breadcrumbs: [] };
  // Note: /themes page removed – theme settings live in /settings → AppearanceTab

  return { title: "", description: "", breadcrumbs: [] };
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isElectron = useIsElectron();
  const t = useTranslations("header");
  const { title, description, breadcrumbs } = usePageInfo(pathname);
  const isMacElectron =
    isElectron && typeof window !== "undefined" && window.electronAPI?.platform === "darwin";

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  return (
    <header
      // --safe-pad / --safe-pad-x are the paddings pt-safe and px-safe fall
      // back to when the display has no inset to clear; set as classes rather
      // than inline style so they stay responsive.
      className="pt-safe px-safe sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-bg/80 pb-4 backdrop-blur-xl [--safe-pad-x:1rem] [--safe-pad:1rem] lg:pb-5 lg:[--safe-pad-x:2rem] lg:[--safe-pad:1.25rem] dark:border-white/5"
      style={{
        paddingTop: isMacElectron ? "calc(1.25rem + var(--desktop-safe-top))" : undefined,
      }}
    >
      {/* Page title with breadcrumbs. Shown on every breakpoint: on mobile the
          bottom tab bar replaced the menu button that used to sit here. */}
      <div className="flex min-w-0 flex-col">
        {breadcrumbs.length > 0 ? (
          <div className="flex min-w-0 items-center gap-2">
            {breadcrumbs.map((crumb, index) => (
              <div
                key={`${crumb.label}-${crumb.href || "current"}`}
                className="flex min-w-0 items-center gap-2"
              >
                {index > 0 && (
                  <span className="material-symbols-outlined text-text-muted text-base">
                    chevron_right
                  </span>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="truncate text-text-muted hover:text-primary transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <div className="flex min-w-0 items-center gap-2">
                    {crumb.image && (
                      <Image
                        src={crumb.image}
                        alt={crumb.label}
                        width={28}
                        height={28}
                        className="object-contain rounded max-w-[28px] max-h-[28px]"
                        sizes="28px"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    {crumb.providerId && (
                      <ProviderIcon providerId={crumb.providerId} size={28} type="color" />
                    )}
                    <h1 className="truncate text-lg font-semibold tracking-tight text-text-main lg:text-2xl">
                      {crumb.label}
                    </h1>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : title ? (
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-text-main lg:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="hidden text-sm text-text-muted lg:block">{description}</p>
            )}
          </div>
        ) : null}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Language selector */}
        <LanguageSelector />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Degradation & Token health */}
        {!isE2EMode && <DegradationBadge />}
        {!isE2EMode && <TokenHealthBadge />}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
          title={t("logout")}
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
}
