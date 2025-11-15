import { useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { fetchDish } from "@/utils/fetchDish";
import type { NormalizedEntry } from "@/types/dictionary.types";
import { DEBOUNCE_MS } from "@/utils/constants";

// Urban Dictionary endpoint
const API_BASE = "https://api.urbandictionary.com/v0/define?term=";

type Status = "idle" | "loading" | "success" | "error";

export function useDishLookup(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const debounced = useDebouncedValue(query, DEBOUNCE_MS);

  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<NormalizedEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, NormalizedEntry>>(new Map());
  const controllerRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    const term = debounced.trim();
    if (!term) {
      setStatus("idle");
      setData(null);
      setError(null);
      controllerRef.current?.abort();
      return;
    }

    const key = term.toLowerCase();
    const cached = cacheRef.current.get(key);
    if (cached) {
      setStatus("success");
      setData(cached);
      setError(null);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const rid = ++reqIdRef.current;

    (async () => {
      try {
        setStatus("loading");
        setError(null);

        const url = `${API_BASE}${encodeURIComponent(term)}`;
        const res = await axios.get(url, { signal: controller.signal });

        const normalized = fetchDish(res.data);
        cacheRef.current.set(key, normalized);

        if (reqIdRef.current === rid) {
          setData(normalized);
          setStatus("success");
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        let msg = "Request failed";
        if (axios.isAxiosError(err)) {
          const ax = err as AxiosError;
          if (ax.response?.status === 404) msg = `No results for "${term}"`;
          else msg = ax.message || msg;
        } else if (err instanceof Error) {
          msg = err.message || msg;
        }

        setError(msg);
        if (reqIdRef.current === rid) setStatus("error");
      }
    })();

    return () => {
      controller.abort();
    };
  }, [debounced]);

  return { query, setQuery, status, data, error };
}
