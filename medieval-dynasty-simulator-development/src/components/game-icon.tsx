"use client";

import { memo, useState } from "react";

interface GameIconProps {
  /** data:image/svg+xml URI. When omitted or on decode failure a gold glyph fallback renders. */
  uri?: string;
  alt?: string;
  size?: number;
  className?: string;
  /** Round the corners so the dark tile backing looks deliberate. */
  tile?: boolean;
}

export const GameIcon = memo(function GameIcon({ uri, alt = "", size = 16, className = "", tile = true }: GameIconProps) {
  const [err, setErr] = useState(false);
  const style = { width: size, height: size };
  if (!uri || err) {
    return (
      <span aria-hidden className={`inline-grid select-none place-items-center font-serif text-[#c8a84e] ${className}`} style={style}>
        ✻
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- data-URI icons can't be optimized by next/image
    <img
      src={uri}
      alt={alt}
      draggable={false}
      loading="lazy"
      decoding="async"
      onError={() => setErr(true)}
      className={`inline-block select-none align-middle object-contain ${tile ? "rounded-[4px]" : ""} ${className}`}
      style={style}
    />
  );
});
