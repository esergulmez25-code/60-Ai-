"use client";

import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import Breadcrumbs from "../Breadcrumbs";
import MobileTabBar from "../MobileTabBar";
import NotificationToast from "../NotificationToast";
import MaintenanceBanner from "../MaintenanceBanner";
import { useIsElectron } from "@/shared/hooks/useElectron";

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";
const isE2EMode = process.env.NEXT_PUBLIC_OMNIROUTE_E2E_MODE === "1";

export default function DashboardLayout({ children }) {
  const isElectron = useIsElectron();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  const isMacElectron =
    isElectron && typeof window !== "undefined" && window.electronAPI?.platform === "darwin";

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.body.classList.toggle("electron-macos", isMacElectron);

    return () => {
      document.body.classList.remove("electron-macos");
    };
  }, [isMacElectron]);

  const handleToggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
  };

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-bg">
      {/* Sidebar - Desktop. On mobile the bottom tab bar navigates instead. */}
      <div className="hidden min-h-0 lg:flex">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          isMacElectron={isMacElectron}
        />
      </div>

      {/* Main content */}
      <main
        id="main-content"
        className="relative flex min-h-0 flex-1 min-w-0 flex-col transition-colors duration-300"
      >
        <Header />
        {!isE2EMode && <MaintenanceBanner />}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto w-full">
            <Breadcrumbs />
            {children}
          </div>
        </div>
        <MobileTabBar />
      </main>

      {/* Global notification toast system */}
      <NotificationToast />
    </div>
  );
}
