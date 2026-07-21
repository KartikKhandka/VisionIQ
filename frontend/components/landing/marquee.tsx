"use client";

import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  className?: string;
}

export function Marquee({ items, className }: MarqueeProps) {
  return (
    <div className={cn("w-full bg-brandAccent py-4 overflow-hidden whitespace-nowrap", className)}>
      <div className="inline-flex gap-16 animate-marquee min-w-full">
        {/* Render items multiple times for seamless looping */}
        {[...Array(4)].map((_, arrayIndex) => (
          <div key={arrayIndex} className="flex gap-16 shrink-0">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-16">
                <span className="font-display text-base font-black tracking-[0.2em] text-black uppercase">
                  {item}
                </span>
                <span className="text-black/30 text-xl font-black">·</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
