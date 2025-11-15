import { API_BASE } from "@/utils/constants";

export async function fetchDish(word: string, signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}${encodeURIComponent(word)}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
