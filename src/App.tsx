import { useState } from "react";

function App() {
  const [postcode, setPostcode] = useState("");

  // submit button handler
  const handleSubmit = async (e: React.FormEvent) => {
    // prevents page refresh
    e.preventDefault();

    // removes spaces from postcode and checks field not empty
    const cleanedPostcode = postcode.trim().replaceAll(" ", "");
    if (!cleanedPostcode) {
      return;
    }

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
      console.log(data);

    } catch (error) {
      console.log(error)
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

      </section>
    </main>
  );
}



export default App;