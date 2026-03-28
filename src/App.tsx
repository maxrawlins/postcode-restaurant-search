import { useState } from "react";


type Restaurant = {
  name: string;
  cuisines: string[];
  rating: number;
  address: string;
};




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

    // removes spaces from postcode and checks field not empty
    const cleanedPostcode = postcode.trim().replaceAll(" ", "");
    if (!cleanedPostcode) {
      setErrorMessage("Please enter a postcode.");
      setHasSearched(false);
      return;
    }

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

      // parses json response and logs response to console
      const data = await response.json();

      // takes first 10 restaurants returned and maps them to the restaurant type and stores them in an array
      const mappedRestaurants: Restaurant[] = data.restaurants.slice(0, 10).map((restaurant: any) => ({
        name: restaurant.name,
        cuisines: restaurant.cuisines.map((cuisine: any) => cuisine.name),
        rating: restaurant.rating.starRating,
        address: `${restaurant.address.firstLine}, ${restaurant.address.city}, ${restaurant.address.postalCode}`,
      }));

      setRestaurants(mappedRestaurants);
    } catch (error) {
      setRestaurants([]);
      setErrorMessage("Unable to fetch restaurant data. Please try again!");
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <main>
      <h1>Postcode Restaurant Search</h1>

      <p>Search for restaurants by UK postcode</p>

      <form onSubmit={handleSubmit}>
        <input type="text"
          placeholder="Enter a UK postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <section>
        <h2>Results</h2>

        {errorMessage && <p>{errorMessage}</p>}

        {isLoading && <p>Loading restaurants...</p>}

        {hasSearched && !isLoading && restaurants.length === 0 && !errorMessage && (
          <p>No restaurants found.</p>
        )}

        {!isLoading &&
          restaurants.map((restaurant) => (
            <article key={`${restaurant.name}-${restaurant.address}`}>
              <h3>{restaurant.name}</h3>
              <p><strong>Cuisines:</strong> {restaurant.cuisines.join(", ")}</p>
              <p><strong>Rating:</strong> {restaurant.rating}</p>
              <p><strong>Address:</strong> {restaurant.address}</p>
            </article>
          ))}
      </section>

    </main>
  );
}



export default App;