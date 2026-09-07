"use client";
import { useEffect, useState } from "react";
import { AddonCatalog, EMPTY_ADDONS } from "./wink-addons";
import { API_URL } from "./wink-shop";
import { WINK_DEMO } from "./wink-mode";
import { DEMO_ADDONS } from "./wink-demo";
export function useWinkAddons() {
  const [catalog, setCatalog] = useState<AddonCatalog>(
    WINK_DEMO ? DEMO_ADDONS : EMPTY_ADDONS,
  );
  const [loading, setLoading] = useState(!WINK_DEMO);
  useEffect(() => {
    if (WINK_DEMO) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch(`${API_URL}/api/addons`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("addons");
        return r.json();
      })
      .then((data: AddonCatalog) => {
        if (
          data.version !== 1 ||
          !Array.isArray(data.items) ||
          typeof data.recommendations !== "object" ||
          !data.recommendations
        )
          throw new Error("addons");
        setCatalog(data);
      })
      .catch(() => setCatalog(EMPTY_ADDONS))
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);
  return { catalog, loading };
}
