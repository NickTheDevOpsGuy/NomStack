import type { DishEntry } from "@/types/dish.types"; // or wherever

export function fetchDish(raw: any): DishEntry {
  // map raw API response -> { name, variants, ... }
  return {
    name: raw.meals[0].strMeal,
    variants: [
      {
        label: raw.meals[0].strArea,
        description: raw.meals[0].strInstructions,
      },
    ],
  };
}
