import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { InventoryPage } from "@/features/inventory/InventoryPage";
import { AnalyticsPage } from "@/features/analytics/AnalyticsPage";
import { ExpensesPage } from "@/features/expenses/ExpensesPage";
import { SettingsPage } from "@/features/settings/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
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
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: "0.875rem",
              border: "1px solid #e8eaee",
              boxShadow: "0 4px 12px rgb(15 23 42 / 0.06), 0 12px 32px rgb(15 23 42 / 0.1)",
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
