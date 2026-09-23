"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import type { Dictionary } from "@/dictionaries";

export interface ScrollToTopProps {
  t: Dictionary;
}

export function ScrollToTop({ t }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  const label = t.common.scrollToTop ?? "Scroll to top";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 flex size-10 items-center justify-center rounded-xl border border-border bg-card/90 text-foreground shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 cursor-pointer animate-in fade-in zoom-in-75 duration-200"
    >
      <ArrowUp className="size-4 stroke-[2.5]" />
    </button>
  );
}
