import type { Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import "@/lib/initCloudSync"; // Auto-initialize cloud sync
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { RTL_LOCALES } from "@/i18n/config";
import { getSettings } from "@/lib/db/settings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

/**
 * viewportFit "cover" lets the page extend into the display's unsafe areas,
 * which is what makes env(safe-area-inset-*) report real values. The mobile
 * tab bar and the header pad themselves with those insets, so installed to a
 * home screen the layout clears the notch and the home indicator.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e14" },
  ],
};

export async function generateMetadata() {
  const settings = await getSettings();
  const instanceName = settings?.instanceName || "OmniRoute";
  const customFaviconUrl = settings?.customFaviconUrl || settings?.customFaviconBase64;

  return {
    title: `${instanceName} — AI Gateway for Multi-Provider LLMs`,
    description:
      "OmniRoute is an AI gateway for multi-provider LLMs. One endpoint for all your AI providers.",
    icons: {
      icon: customFaviconUrl ? "/api/settings/favicon" : "/favicon.svg",
      // iOS does not accept SVG for the home-screen icon, so point at the PNG.
      apple: "/apple-touch-icon.png",
    },
    // Opens without Safari's chrome once added to the iOS home screen.
    appleWebApp: {
      capable: true,
      title: instanceName,
      statusBarStyle: "default",
    },
  };
}

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isRtl = RTL_LOCALES.includes(locale as (typeof RTL_LOCALES)[number]);

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        {/* Next emits only the standardised "mobile-web-app-capable". Older
            iOS reads the legacy spelling, so add it by hand; without either,
            an icon added to the home screen opens in Safari with its chrome
            instead of full screen. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#6366f1] focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
        >
          Skip to content
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
