# Postcode Restaurant Search

A web application that allows users to search for restaurants by entering UK postcodes.

The app fetches restaurant data from the Just Eat API and displays the first 10 results (name, cuisines, rating, and address).

---

## Tech Stack

-   React
-   TypeScript
-   Vite
-   Node.js
-   Express

---

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/maxrawlins/postcode-restaurant-search
cd postcode-restaurant-search
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the backend server

```bash
npm run server
```

The server will run on http://localhost:3001

### 4. Start the frontend

```bash
npm run dev
```

### 5. Open the app

Go to http://localhost:5173

---

## Features

-   Search for restaurants by UK postcodes
-   Postcode validation using regex
-   Displays:
    -   Name
    -   Cuisines
    -   Rating (as a number)
    -   Address
-   Shows first 10 restaurants returned by the API
-   Displayed as cards on a grid layout
-   Colour-coded rating badges

---

## Key Decisions

-   A backend proxy (Express server) was used to avoid CORS issues when calling the external API from the browser.
-   Postcode validation is handled on the frontend to prevent unnecessary API calls.
-   API data is mapped into a simplified structure before rendering to keep the UI clean and maintainable.
-   Defensive coding was used to handle missing or undefined API fields.

---

## Assumptions

-   User is based in the UK.
-   The application should return the first 10 restaurants provided by the API, as specified in the brief, rather than applying any new sorting or filtering logic.
-   The API response structure remains the same.
-   If restaurant data fields are missing, the fallback values (e.g. "Not available") are acceptable.
-   Ratings will always be between 0 and 5.

---

## Improvements

-   Improve accessibility for users such as people who struggle with vision
-   Add a ranking algorithm that combines distance from the user's postcode and restaurant rating to determine the order restaurants are shown
-   Add loading skeleton UI instead of text
-   Cache previous search results to avoid repeated API calls for the same postcode
-   Deploy the application via vercel, netlify etc
