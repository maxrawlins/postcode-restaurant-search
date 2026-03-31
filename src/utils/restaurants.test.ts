import { describe, expect, it } from "vitest";
import {
  getRatingColor,
  isValidUkPostcode,
  mapRestaurants,
} from "./restaurants";

describe("isValidUkPostcode", () => {
  // accepts valid uk postcode formats
  it("accepts valid UK postcodes", () => {
    expect(isValidUkPostcode("SW1A 1AA")).toBe(true);
    expect(isValidUkPostcode("EC1A 1BB")).toBe(true);
    expect(isValidUkPostcode("GIR 0AA")).toBe(true);
  });

  // rejects empty and invalid postcode formats
  it("rejects invalid UK postcodes", () => {
    expect(isValidUkPostcode("")).toBe(false);
    expect(isValidUkPostcode("INVALID")).toBe(false);
    expect(isValidUkPostcode("sw1a 1aa")).toBe(false);
    expect(isValidUkPostcode("SW1A1AA")).toBe(false);
  });
});

describe("mapRestaurants", () => {
  // maps api restaurant fields into the ui-friendly shape
  it("maps api data into simplified restaurant objects", () => {
    const mapped = mapRestaurants([
      {
        name: "Test Kitchen",
        cuisines: [{ name: "Burgers" }, { name: "Desserts" }],
        rating: { starRating: 4.5 },
        address: {
          firstLine: "10 High Street",
          city: "London",
          postalCode: "SW1A 1AA",
        },
      },
    ]);

    expect(mapped).toEqual([
      {
        name: "Test Kitchen",
        cuisines: ["Burgers", "Desserts"],
        rating: 4.5,
        address: "10 High Street, London, SW1A 1AA",
      },
    ]);
  });

  // limits mapped results to the first 10 restaurants
  it("limits mapped results to 10 restaurants", () => {
    const restaurants = Array.from({ length: 12 }, (_, index) => ({
      name: `Restaurant ${index + 1}`,
      cuisines: [],
      rating: { starRating: 3 },
      address: {},
    }));

    const mapped = mapRestaurants(restaurants);

    expect(mapped).toHaveLength(10);
    expect(mapped[0].name).toBe("Restaurant 1");
    expect(mapped[9].name).toBe("Restaurant 10");
  });

  // applies fallback values when api fields are missing
  it("uses fallback values when fields are missing", () => {
    const mapped = mapRestaurants([
      {
        cuisines: undefined,
        rating: undefined,
        address: {},
      },
    ]);

    expect(mapped).toEqual([
      {
        name: "Unknown restaurant",
        cuisines: [],
        rating: 0,
        address: "",
      },
    ]);
  });
});

describe("getRatingColor", () => {
  // returns expected color values for low, mid, and high ratings
  it("returns expected hsl values across rating boundaries", () => {
    expect(getRatingColor(0)).toBe("hsl(0, 70%, 45%)");
    expect(getRatingColor(2.5)).toBe("hsl(60, 70%, 45%)");
    expect(getRatingColor(5)).toBe("hsl(120, 70%, 45%)");
  });
});
