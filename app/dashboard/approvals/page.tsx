"use client";

import { Suspense } from "react";
import OrgApprovalsView from "@/dashboard/_components/OrgApprovalsView";
import { DashboardPage } from "@/components/dashboard/PageShell";

function ApprovalsFallback() {
  return (
    <DashboardPage>
      <div className="mb-8 space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-[var(--kura-bg-lighter)]" />
        <div className="h-9 w-56 animate-pulse rounded-lg bg-[var(--kura-bg-lighter)]" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[var(--kura-bg-lighter)]" />
      </div>
      <div className="mb-6 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-20 animate-pulse rounded-2xl bg-[var(--kura-bg-lighter)]" />
        <div className="h-20 animate-pulse rounded-2xl bg-[var(--kura-bg-lighter)]" />
      </div>
      <div className="mb-5 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-full bg-[var(--kura-bg-lighter)]"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-[var(--kura-bg-lighter)]" />
    </DashboardPage>
  );
}

export default function ApprovalsPage() {
  return (
    <Suspense fallback={<ApprovalsFallback />}>
      <OrgApprovalsView />
    </Suspense>
  );
}
