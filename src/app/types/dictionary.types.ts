export interface Sense {
  pos: string;
  def: string;
  example?: string;
}

export interface NormalizedEntry {
  word: string;
  senses: Sense[];
}
