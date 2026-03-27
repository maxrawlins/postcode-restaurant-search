import { useState } from "react";

function App() {
  const [postcode, setPostcode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    //prevents page refresh
    e.preventDefault();

    console.log(postcode);
  };

  return (
    <main>
      <h1>Postcode Restaurant Search</h1>
      
      <p>Search for restaurants by UK postcode</p>

      <form onSubmit={handleSubmit}> 
        <input type = "text" 
        placeholder =  "Enter a UK postcode"
        value = {postcode}
        onChange={(e) => setPostcode(e.target.value)}
        />
        <button type = "submit">Search</button>
      </form>

      <section>
      <h2>Results</h2>
      
      </section>
    </main>
  );
}



export default App;