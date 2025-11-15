export interface DishVariant {
  label?: string; // e.g. "Italian", "Vegan", "Spicy"
  description: string; // the main text you’re showing
  exampleNote?: string; // optional note / example serving idea
}

export interface DishEntry {
  name: string; // dish name: "Carbonara", "Pho", etc.
  variants: DishVariant[];
}
