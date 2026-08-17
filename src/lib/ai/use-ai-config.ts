"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AI_CONFIG_CHANGED,
  clearAiConfig,
  readAiConfig,
  saveAiConfig,
  type AiProviderConfig,
} from "./provider-config";

export function useAiConfig() {
  const [config, setConfig] = useState<AiProviderConfig>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refresh = useCallback(() => {
    setConfig(readAiConfig());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(AI_CONFIG_CHANGED, onChange);
    return () => window.removeEventListener(AI_CONFIG_CHANGED, onChange);
  }, [refresh]);

  const save = useCallback((value: unknown) => {
    const result = saveAiConfig(value);
    setError(result.ok ? undefined : result.error);
    return result.ok;
  }, []);

  const clear = useCallback(() => {
    clearAiConfig();
    setError(undefined);
  }, []);

  return { config, loading, error, save, clear, configured: Boolean(config) };
}
