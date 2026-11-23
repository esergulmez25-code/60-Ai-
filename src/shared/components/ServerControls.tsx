"use client";

/**
 * ServerControls — Restart / Shutdown buttons with confirmation.
 *
 * Extracted from Sidebar so both the desktop sidebar footer and the mobile
 * "More" screen offer the same controls. Renders the two buttons, their
 * confirm modals, and the blocking "Server Disconnected" overlay shown once
 * the proxy has been stopped or is restarting.
 *
 * @module shared/components/ServerControls
 */

import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import Button from "./Button";
import { ConfirmModal } from "./Modal";

export default function ServerControls({
  collapsed = false,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  const t = useTranslations("sidebar");
  const tc = useTranslations("common");
  const [showShutdownModal, setShowShutdownModal] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);

  const handleShutdown = async () => {
    setIsShuttingDown(true);
    try {
      await fetch("/api/shutdown", { method: "POST" });
    } catch (e) {
      // Expected to fail as server shuts down; ignore error
    }
    setIsShuttingDown(false);
    setShowShutdownModal(false);
    setIsDisconnected(true);
  };

  const handleRestart = async () => {
    setIsRestarting(true);
    try {
      await fetch("/api/restart", { method: "POST" });
    } catch (e) {
      // Expected to fail as server restarts
    }
    setIsRestarting(false);
    setShowRestartModal(false);
    setIsDisconnected(true);
    setTimeout(() => {
      globalThis.location.reload();
    }, 3000);
  };

  return (
    <>
      <div className={cn(collapsed ? "flex flex-col gap-1" : "flex gap-2", className)}>
        <button
          onClick={() => setShowRestartModal(true)}
          title={t("restart")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg font-medium transition-all",
            "text-amber-500 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40",
            collapsed ? "p-2" : "flex-1 min-w-0 px-3 py-2 text-xs"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          {!collapsed && t("restart")}
        </button>
        <button
          onClick={() => setShowShutdownModal(true)}
          title={t("shutdown")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg font-medium transition-all",
            "text-red-500 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40",
            collapsed ? "p-2" : "flex-1 min-w-0 px-3 py-2 text-xs"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
          {!collapsed && t("shutdown")}
        </button>
      </div>

      <ConfirmModal
        isOpen={showShutdownModal}
        onClose={() => setShowShutdownModal(false)}
        onConfirm={handleShutdown}
        title={t("shutdown")}
        message={t("shutdownConfirm")}
        confirmText={t("shutdown")}
        cancelText={tc("cancel")}
        variant="danger"
        loading={isShuttingDown}
      />

      <ConfirmModal
        isOpen={showRestartModal}
        onClose={() => setShowRestartModal(false)}
        onConfirm={handleRestart}
        title={t("restart")}
        message={t("restartConfirm")}
        confirmText={t("restart")}
        cancelText={tc("cancel")}
        variant="warning"
        loading={isRestarting}
      />

      {isDisconnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center p-8">
            <div className="flex items-center justify-center size-16 rounded-full bg-red-500/20 text-red-500 mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">power_off</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Server Disconnected</h2>
            <p className="text-text-muted mb-6">
              The proxy server has been stopped or is restarting.
            </p>
            <Button variant="secondary" onClick={() => globalThis.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

ServerControls.propTypes = {
  collapsed: PropTypes.bool,
  className: PropTypes.string,
};
