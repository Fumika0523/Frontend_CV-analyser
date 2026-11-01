
import axios from "axios";

export default async function handler(req, res) {

  // Only allow GET requests.
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  // Get the location text entered by the user.
  const query =
    typeof req.query.q === "string"
      ? req.query.q.trim()
      : "";

  // Don't search when fewer than 2 characters.
  if (query.length < 2) {
    return res.status(200).json({
      suggestions: [],
    });
  }

  // Limit how much text can be submitted.
  if (query.length > 100) {
    return res.status(400).json({
      message: "Location search is too long",
    });
  }

  // Read the key from the server environment.
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      message: "Location search is not configured",
    });
  }

  try {
    // Ask Geoapify for matching locations.
    const response = await axios.get(
      "https://api.geoapify.com/v1/geocode/autocomplete",
      {
        params: {
          text: query,
          type: "locality",
          format: "json",
          lang: "en",
          limit: 7,
          apiKey,
        },
        timeout: 8000,
      }
    );

    // Convert Geoapify data into our own format.

    const suggestions = (response.data.results || [])
      // Exclude postcode-only results.
      .filter((place) => place.result_type !== "postcode")
      .map((place) => {
        // Choose a readable location name.
        const areaName =
          place.name ||
          place.city ||
          place.county ||
          place.state ||
          "";

        return {
          id: place.place_id,
          displayName: [areaName, place.country]
            .filter(Boolean)
            .join(", "),
          city: areaName,
          country: place.country || "",
          state: place.state || "",
          // Identify whether this is a city, county or region.
          locationType: place.result_type || "",
          // Preserve the county information.
          county: place.county || "",
        }
      })

      // Ignore results without a usable location.
      .filter((place) => place.city && place.country);

    // Remove locations with identical display names.
    const uniqueSuggestions = suggestions.filter(
      (place, index, allSuggestions) =>
        index ===
        allSuggestions.findIndex(
          (item) =>
            item.displayName.toLowerCase() ===
            place.displayName.toLowerCase()
        )
    );

    return res.status(200).json({
      suggestions: uniqueSuggestions,
    });

  } catch (error) {
    console.error(
      "Location autocomplete error:",
      error.response?.status || error.message
    );

    return res.status(502).json({
      message: "Unable to search locations",
    });
  }
}
