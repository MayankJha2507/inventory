import { lazy, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { useSettings } from "@/features/settings/hooks";

const DashboardPage = lazy(() =>
  import("@/features/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const InventoryPage = lazy(() =>
  import("@/features/inventory/InventoryPage").then((m) => ({ default: m.InventoryPage })),
);
const AnalyticsPage = lazy(() =>
  import("@/features/analytics/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })),
);
const ExpensesPage = lazy(() =>
  import("@/features/expenses/ExpensesPage").then((m) => ({ default: m.ExpensesPage })),
);
const SettingsPage = lazy(() =>
  import("@/features/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Keeps the browser tab title in sync with the configured business name. */
function DocumentTitle() {
  const { data } = useSettings();
  const businessName = data?.business_name?.trim();
  useEffect(() => {
    document.title = `${businessName || "Loopstitch"} — Inventory`;
  }, [businessName]);
  return null;
}

function ThemedToaster() {
  const { resolved } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      theme={resolved}
      toastOptions={{
        style: {
          borderRadius: "0.875rem",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          color: "var(--color-foreground)",
          boxShadow: "var(--shadow-pop)",
        },
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <DocumentTitle />
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <ThemedToaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
