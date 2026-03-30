"use client";

import { ToastProvider } from "./ui/toast-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

