"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function FirstPartyAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    void fetch("/api/events/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "page_view", path: pathname }), keepalive: true });
  }, [pathname]);
  return null;
}
