import type { NormalizedEntry } from '@/types/dictionary.types';

export interface UrbanDefinition {
  definition: string;
  permalink?: string;
  thumbs_up?: number;
  thumbs_down?: number;
  author?: string;
  word: string;
  example?: string;
}

export interface UrbanApiResponse {
  list: UrbanDefinition[];
}

/** Clean up brackets and newlines from UD strings */
const clean = (s: string | undefined): string =>
  (s ?? '')
    .replace(/\[([^\]]+)\]/g, '$1')
    .replace(/\r?\n/g, ' ')
    .trim();

/** Normalize Urban Dictionary API response into our app's shape. */
export function normalizeDictionaryData(
  raw: UrbanApiResponse
): NormalizedEntry {
  const list: UrbanDefinition[] = Array.isArray(raw?.list) ? raw.list : [];
  if (list.length === 0) return { word: '', senses: [] };

  const word = clean(list[0]?.word);

  const senses = list.map((item: UrbanDefinition) => ({
    pos: 'slang',
    def: clean(item.definition),
    example: clean(item.example) || undefined,
  }));

  return { word, senses };
}
