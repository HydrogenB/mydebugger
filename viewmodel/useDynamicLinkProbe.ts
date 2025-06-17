/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useState } from "react";
import {
  parseQueryParams,
  storeTrace,
  loadTrace,
  DynamicLinkTrace,
} from "../model/dynamicLink";

declare global {
  interface Window {
    plausible?: (event: string, opts: { props: Record<string, string> }) => void;
  }
}

export const useDynamicLinkProbe = () => {
  const [trace, setTrace] = useState<DynamicLinkTrace | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = parseQueryParams(window.location.search);
    const hasParams = Object.keys(params).length > 0;
    if (hasParams) {
      const data: DynamicLinkTrace = {
        params,
        sourceUrl: window.location.href,
        timestamp: Date.now(),
      };
      storeTrace(data);
      setTrace(data);
      window.plausible?.("dynamic_link_landed", { props: params });
    } else {
      setTrace(loadTrace());
    }
  }, []);

  return { trace };
};

export default useDynamicLinkProbe;
