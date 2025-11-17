import type { DishEntry } from '@/types/dish.types';

// Define the minimal shape of the API you're parsing.
// This avoids `any` and keeps ESLint happy.
interface MealApiResponse {
  meals: Array<{
    strMeal: string;
    strArea?: string;
    strInstructions: string;
  }>;
}

export function fetchDish(raw: MealApiResponse): DishEntry {
  const meal = raw.meals[0];

  return {
    name: meal.strMeal,
    variants: [
      {
        label: meal.strArea ?? 'Unknown',
        description: meal.strInstructions,
      },
    ],
  };
}
