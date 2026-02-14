export default async function handler(req, res) {
    const { query, location } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Query is required" });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
        console.error("Missing GOOGLE_PLACES_API_KEY");
        return res.status(500).json({ error: "Server configuration error" });
    }

    const searchQuery = location ? `${query} in ${location}` : query;
    // Using Text Search (New) or Text Search (Legacy)? 
    // User snippet used `https://maps.googleapis.com/maps/api/place/textsearch/json`. This is the Legacy API but still widely used.
    // The new one is `https://places.googleapis.com/v1/places:searchText`.
    // I will stick to the user's requested URL structure for compatibility with their key/expectations.

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error("Google API Error:", data);
            return res.status(500).json({ error: data.error_message || "Google Places API error" });
        }

        if (!data.results) {
            return res.status(200).json([]);
        }

        const retailers = data.results.map(place => ({
            name: place.name,
            address: place.formatted_address,
            rating: place.rating || null,
            place_id: place.place_id,
            location: place.geometry?.location || null,
            types: place.types || []
        }));

        res.status(200).json(retailers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
