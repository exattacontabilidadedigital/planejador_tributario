"use client";

import { TaxPlannerDashboard } from "@/components/tax-planner-dashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TaxPlannerDashboard />
    </main>
  );
}
