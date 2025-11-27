import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import {Sidebar} from "@/components/layout/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function AdminDashboard({ children }: DashboardLayoutProps) {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
