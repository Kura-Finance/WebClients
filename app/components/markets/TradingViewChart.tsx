"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface TradingViewChartProps {
  symbol: string;
  /** Pixel height, or omit when using className for fill (e.g. min-h / h-full). */
  height?: number;
  interval?: string;
  theme?: "light" | "dark";
  className?: string;
}

function useDocumentTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTheme(root.classList.contains("dark") ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

/**
 * TradingView Advanced Chart — free public widget (no API key).
 *
 * Embed host is `s.tradingview.com` (official). Older
 * `tradingview-widget.com` URLs often return blank / 403.
 * @see https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/
 */
export default function TradingViewChart({
  symbol,
  height,
  interval = "60",
  theme: themeProp,
  className,
}: TradingViewChartProps) {
  const documentTheme = useDocumentTheme();
  const theme = themeProp ?? documentTheme;

  const src = useMemo(() => {
    const config = {
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      backgroundColor: theme === "dark" ? "#0B0B0F" : "#ffffff",
      gridColor:
        theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: true,
      allow_symbol_change: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    };
    return (
      `https://s.tradingview.com/embed-widget/advanced-chart/?locale=en&symbol=${encodeURIComponent(symbol)}#` +
      encodeURIComponent(JSON.stringify(config))
    );
  }, [symbol, interval, theme]);

  return (
    <div
      className={cn(
        "tradingview-widget-container overflow-hidden rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)]",
        className,
      )}
      style={height != null ? { height, width: "100%" } : { width: "100%" }}
    >
      <iframe
        key={src}
        title={`TradingView chart ${symbol}`}
        src={src}
        style={{ width: "100%", height: "100%", border: 0 }}
        allow="fullscreen; clipboard-write"
        referrerPolicy="origin-when-cross-origin"
        loading="lazy"
      />
    </div>
  );
}
