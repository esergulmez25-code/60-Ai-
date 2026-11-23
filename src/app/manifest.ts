import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/db/settings";

/**
 * Web app manifest — lets the dashboard be installed to a phone's home
 * screen and opened without browser chrome, which is what makes the mobile
 * bottom-tab navigation read as an app rather than a web page.
 *
 * Served at /manifest.webmanifest; Next.js injects the <link rel="manifest">
 * automatically. Honours the instanceName branding setting, as the page
 * metadata does.
 */

// The manifest reads a runtime setting, so it must not be baked at build
// time: this package is built once and shipped, and a statically rendered
// manifest would pin every install to whatever name the build machine had.
export const dynamic = "force-dynamic";
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let instanceName = "OmniRoute";

  try {
    const settings = await getSettings();
    if (typeof settings?.instanceName === "string" && settings.instanceName.trim()) {
      instanceName = settings.instanceName.trim();
    }
  } catch {
    // Manifest must still be served if settings are unavailable (e.g. before
    // the database is initialised); fall back to the default name.
  }

  return {
    name: `${instanceName} — AI Gateway`,
    short_name: instanceName,
    description:
      "One endpoint for all your AI providers, with automatic fallback when one runs out.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f9f9fb",
    theme_color: "#e54d5e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
