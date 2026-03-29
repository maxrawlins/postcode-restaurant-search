import { useState } from "react";
import type { Restaurant } from "./types/restaurant";

//uk postcode regex accounting for the GIR 0AA special case
const postcodeRegex = /^(GIR 0AA|((([A-Z][0-9]{1,2})|([A-Z][A-HJ-Y][0-9]{1,2})|([A-Z][0-9][A-Z])|([A-Z][A-HJ-Y][0-9]?[A-Z])) [0-9][A-Z]{2}))$/;

function App() {

  const [postcode, setPostcode] = useState("");

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // submit button handler
  const handleSubmit = async (e: React.FormEvent) => {
    // prevents page refresh
    e.preventDefault();

    // removes whitespace form start and end of postcode
    const trimmedPostcode = postcode.trim().toUpperCase();

    // check if empty
    if (!trimmedPostcode) {
      setRestaurants([]);
      setErrorMessage("Please enter a postcode.");
      setHasSearched(false);
      return;
    }
    // validate the postcode input against the regex
    if (!postcodeRegex.test(trimmedPostcode)) {
      setRestaurants([]);
      setErrorMessage("Please enter a valid UK postcode.");
      setHasSearched(false);
      return;
    }

    //remove spaces in postcode
    const cleanedPostcode = trimmedPostcode.replaceAll(" ", "");

    setIsLoading(true);
    setErrorMessage("");
    setHasSearched(true);

    try {

      // calls backend proxy instead of external API to avoid CORS issue
      const url = `http://localhost:3001/api/restaurants/${cleanedPostcode}`;

      // sends request to backend and handles unsuccessful response
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants from back end server");
      }

      // parses json response 
      const data = await response.json();

      // transforms raw api data into 10 simplified restaurant objects for the ui
      const mappedRestaurants = mapRestaurants(data.restaurants);

      setRestaurants(mappedRestaurants);

    } catch (error) {
      setRestaurants([]);
      setErrorMessage("Unable to fetch restaurant data. Please try again!");
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">Postcode Restaurant Search</h1>
        <p className="app__description">
          Search for restaurants by UK postcode
        </p>
      </header>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          className="search-input"
          type="text"
          placeholder="Enter a UK postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
        />
        <button className="search-button" type="submit">
          Search
        </button>
      </form>

      <section className="results">
        <h2>Results</h2>

        {errorMessage && <p>{errorMessage}</p>}

        {isLoading && <p>Loading restaurants...</p>}

        {!hasSearched && !errorMessage && !isLoading && (
          <p>Enter a postcode to search for restaurants.</p>
        )}

        {hasSearched && !isLoading && restaurants.length === 0 && !errorMessage && (
          <p>No restaurants found.</p>
        )}

        {!isLoading &&
          restaurants.map((restaurant) => (
            <article
              className="restaurant-card"
              key={`${restaurant.name}-${restaurant.address}`}
            >
              <div className="restaurant-card__header">
                <h3 className="restaurant-card__title">{restaurant.name}</h3>
                <span
                  className="rating-badge"
                  style={{ backgroundColor: getRatingColor(restaurant.rating) }}
                >
                  {restaurant.rating}
                </span>
              </div>

              <div className="cuisine-tags">
                {restaurant.cuisines.length > 0 ? (
                  restaurant.cuisines.map((cuisine) => (
                    <span className="cuisine-tag" key={cuisine}>
                      {cuisine}
                    </span>
                  ))
                ) : (
                  <span className="cuisine-tag">Not available</span>
                )}
              </div>

              <p className="restaurant-card__text">
                {restaurant.address || "Not available"}
              </p>
            </article>
          ))}
      </section>
    </main>
  );
}

// extracts required fields (name, cuisines, rating, address) from API response and limits it to first 10 restaurants
function mapRestaurants(restaurants: any[]): Restaurant[] {
  return restaurants.slice(0, 10).map((restaurant: any) => ({
    name: restaurant.name ?? "Unknown restaurant",
    cuisines: restaurant.cuisines?.map((cuisine: any) => cuisine.name) ?? [],
    rating: restaurant.rating?.starRating ?? 0,
    address: [restaurant.address?.firstLine, restaurant.address?.city, restaurant.address?.postalCode].filter(Boolean).join(", "),
  }));
}

// returns a colour based on rating value 0-5
function getRatingColor(rating: number): string {
  const hue = (rating / 5) * 120;
  return `hsl(${hue}, 70%, 45%)`;
}

export default App;