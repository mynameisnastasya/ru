"use client";
import { useEffect, useState } from "react";
import { API_URL, Catalog, FALLBACK_CATALOG, parseCatalog } from "./wink-shop";

export function useWinkCatalog() {
  const [catalog, setCatalog] = useState<Catalog>(FALLBACK_CATALOG);
  const [status, setStatus] = useState<"loading" | "live" | "reference">(
    "loading",
  );
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    let active = true;
    fetch(`${API_URL}/api/catalog`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((r) => {
        if (!r.ok) throw new Error("catalog");
        return r.json();
      })
      .then(parseCatalog)
      .then((data) => {
        if (active) {
          setCatalog(data);
          setStatus("live");
        }
      })
      .catch(() => {
        if (active) setStatus("reference");
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);
  return { catalog, status };
}
