import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

// enables CORS so frontend can call server
app.use(cors());

// route to fetch restaurant data by postcode
app.get("/api/restaurants/:postcode", async (req, res) => {

    // cleans the postcode (backend validation)
    const postcode = req.params.postcode.trim().replaceAll(" ", "");

    try {
        // calls external just eat api
        const response = await fetch(
            `https://uk.api.just-eat.io/discovery/uk/restaurants/enriched/bypostcode/${postcode}`
        );

        // handles failed API response
        if (!response.ok) {
            return res.status(response.status).json({
                error: "Failed to fetch restaurants from API",
            });
        }
        // parses api response
        const data = await response.json();

        // sends data to front end
        res.json(data);
    } catch (error) {
        console.error(error);

        //handles server errors
        res.status(500).json({
            error: "Something went wrong while fetching data from the API.",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});