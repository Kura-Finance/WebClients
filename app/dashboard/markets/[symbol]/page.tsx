"use client";

import { use } from "react";
import { redirect } from "next/navigation";
import MarketDetailView from "@/components/markets/MarketDetailView";

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = use(params);
  const decoded = decodeURIComponent(symbol);
  if (decoded.toLowerCase() === "eth") {
    redirect("/dashboard/markets/weth");
  }
  return <MarketDetailView symbol={decoded} />;
}
