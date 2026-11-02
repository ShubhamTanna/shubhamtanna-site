"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Every page change lands at the very top (Next otherwise stops at the page's first block, under the sticky nav). Links with a #anchor are left alone. */
export default function ScrollTop() {
  const path = usePathname();
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [path]);
  return null;
}
