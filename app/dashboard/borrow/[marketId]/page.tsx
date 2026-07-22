"use client";

import { use } from "react";
import BorrowMarketDetailView from "@/components/borrow/BorrowMarketDetailView";

export default function BorrowMarketPage({
  params,
}: {
  params: Promise<{ marketId: string }>;
}) {
  const { marketId } = use(params);
  return <BorrowMarketDetailView marketId={decodeURIComponent(marketId)} />;
}
