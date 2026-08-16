// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.clientportal.pro",
  appName: "ClientPortal Pro",
  webDir: "mobile-shell/public",
  android: {
    allowMixedContent: true,
  },
};

export default config;
