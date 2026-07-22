"use client";

import { use } from "react";
import EarnVaultDetailView from "@/components/earn/EarnVaultDetailView";

export default function EarnVaultPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  return <EarnVaultDetailView address={decodeURIComponent(address)} />;
}
