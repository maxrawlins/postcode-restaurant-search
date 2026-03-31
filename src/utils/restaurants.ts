import type { Restaurant } from "../types/restaurant";

//uk postcode regex accounting for the GIR 0AA special case
const postcodeRegex = /^(GIR 0AA|((([A-Z][0-9]{1,2})|([A-Z][A-HJ-Y][0-9]{1,2})|([A-Z][0-9][A-Z])|([A-Z][A-HJ-Y][0-9]?[A-Z])) [0-9][A-Z]{2}))$/;

export function isValidUkPostcode(postcode: string): boolean {
  return postcodeRegex.test(postcode);
}

// extracts required fields (name, cuisines, rating, address) from API response and limits it to first 10 restaurants
export function mapRestaurants(restaurants: any[]): Restaurant[] {
  return restaurants.slice(0, 10).map((restaurant: any) => ({
    name: restaurant.name ?? "Unknown restaurant",
    cuisines: restaurant.cuisines?.map((cuisine: any) => cuisine.name) ?? [],
    rating: restaurant.rating?.starRating ?? 0,
    address: [restaurant.address?.firstLine, restaurant.address?.city, restaurant.address?.postalCode].filter(Boolean).join(", "),
  }));
}

// returns a colour based on rating value 0-5
export function getRatingColor(rating: number): string {
  const hue = (rating / 5) * 120;
  return `hsl(${hue}, 70%, 45%)`;
}
