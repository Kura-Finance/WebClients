"use client";

import React, { useState } from "react";
import Image from "next/image";

/** Dark-mode style disc behind transparent token / stock logos. */
export const ICON_BACKGROUND_SRC = "/icon_background.webp";

interface AssetIconProps {
  src: string | null | undefined;
  label: string;
  color: string;
  size?: number;
  className?: string;
}

/**
 * Circular asset icon with dark icon_background.webp + image / glyph fallback.
 */
export default function AssetIcon({
  src,
  label,
  color,
  size = 40,
  className = "",
}: AssetIconProps) {
  const [failed, setFailed] = useState(false);
  const glyph = (label || "?").slice(0, 2).toUpperCase();
  const showImage = !!src && !failed;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={ICON_BACKGROUND_SRC}
        alt=""
        fill
        sizes={`${size}px`}
        className="object-cover"
        aria-hidden
        unoptimized
      />
      {showImage ? (
        <Image
          src={src}
          alt={label}
          width={size}
          height={size}
          className="relative z-[1] h-full w-full object-cover"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="relative z-[1] font-bold text-white drop-shadow-sm"
          style={{
            fontSize: Math.max(10, Math.round(size * 0.28)),
            textShadow: `0 0 12px ${color}`,
          }}
        >
          {glyph}
        </span>
      )}
    </div>
  );
}
