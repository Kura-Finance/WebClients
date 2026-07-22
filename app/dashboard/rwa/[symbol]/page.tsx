"use client";

import { use } from "react";
import StockDetailView from "@/components/stocks/StockDetailView";

export default function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = use(params);
  return <StockDetailView symbol={decodeURIComponent(symbol)} />;
}
