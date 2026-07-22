"use client";

import React, { useState } from "react";
import Image from "next/image";

interface AssetIconProps {
  src: string | null | undefined;
  label: string;
  color: string;
  size?: number;
  className?: string;
}

/**
 * Circular asset icon with image + glyph fallback (stocks & crypto).
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
      style={{
        width: size,
        height: size,
        backgroundColor: showImage ? `${color}22` : color,
      }}
    >
      {showImage ? (
        <Image
          src={src}
          alt={label}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="font-bold text-white"
          style={{ fontSize: Math.max(10, Math.round(size * 0.28)) }}
        >
          {glyph}
        </span>
      )}
    </div>
  );
}
