export default async function handler(req, res) {
    const { query, location } = req.query;

    if (!query || !location) {
        return res.status(400).json({ error: "Query and location required" });
    }

    const apiKey = process.env.YELP_API_KEY;

    if (!apiKey) {
        console.error("Missing YELP_API_KEY");
        return res.status(500).json({ error: "Server configuration error (Missing API Key)" });
    }

    try {
        const response = await fetch(
            `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&limit=20`,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error("Yelp API Error:", data.error);
            return res.status(400).json({ error: data.error.description || "Yelp API Error" });
        }

        if (!data.businesses) {
            return res.status(200).json([]);
        }

        const retailers = data.businesses.map(business => ({
            id: business.id,
            name: business.name,
            address: business.location.display_address.join(", "),
            phone: business.display_phone,
            rating: business.rating,
            review_count: business.review_count,
            categories: business.categories.map(c => c.title),
            image_url: business.image_url,
            url: business.url
        }));

        res.status(200).json(retailers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
