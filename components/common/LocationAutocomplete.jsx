import React, { useEffect, useState } from "react";
import axios from "axios";

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "Search location",
}) => {

  // Stores whatever user types into the input box
  const [query, setQuery] = useState(value || "");

  // Stores location suggestions returned by OpenStreetMap API
  const [suggestions, setSuggestions] = useState([]);

  // Stores the location that was actually selected
  // Used to prevent the dropdown reopening after selection
  const [selectedText, setSelectedText] = useState(value || "");

  // ==========================================
  // Sync parent value with component state
  // ==========================================
  useEffect(() => {

    // Update input field when parent changes value
    setQuery(value || "");

    // Also update selected location
    setSelectedText(value || "");

  }, [value]);

  // ==========================================
  // Search OpenStreetMap locations
  // ==========================================
  useEffect(() => {

    // Delay API call by 400ms
    // Prevents API request on every keystroke
    const timer = setTimeout(async () => {

      // Don't search if:
      // 1. User typed less than 2 characters
      // 2. User already selected this exact location
      if (query.length < 2 || query === selectedText) {

        // Clear suggestion list
        setSuggestions([]);

        return;
      }

      try {

        // Search locations from OpenStreetMap
        const res = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {

              // User search text
              q: query,

              // Return JSON
              format: "json",

              // Include city/country details
              addressdetails: 1,

              // Maximum suggestions
              limit: 5,
            },
          }
        );

        // Store results
        setSuggestions(res.data || []);

      } catch (error) {

        console.error("Location search error:", error);

      }

    }, 400);

    // Cleanup previous timer when user keeps typing
    return () => clearTimeout(timer);

  }, [query, selectedText]);

  // ==========================================
  // User selected one suggestion
  // ==========================================
  const handleSelect = (place) => {

    // OpenStreetMap address object
    const address = place.address || {};

    // Different countries return different field names
    // Try each possible field until one exists
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.municipality ||
      address.city_district ||
      address.suburb ||
      address.county ||
      address.state ||
      place.name ||
      "";

    // Country name
    const country = address.country || "";

    // Example:
    // "Tokyo, Japan"
    const displayName =
      city && country
        ? `${city}, ${country}`
        : place.display_name;

    // Create clean location object
    const selectedLocation = {
      displayName,
      city,
      country,
    };

    // Update input box
    setQuery(displayName);

    // Save selected value
    // This prevents suggestions from reopening
    setSelectedText(displayName);

    // Hide suggestion dropdown
    setSuggestions([]);

    // Send selected location back to parent component
    onChange(selectedLocation);
  };

  return (
    <div className="relative">

      {/* Location input */}
      <input
        value={query}
        onChange={(e) => {

          // Update search text
          setQuery(e.target.value);

          // User started typing again
          // Clear previous selection
          setSelectedText("");
        }}
        placeholder={placeholder}
        className="w-full border-[1.5px] border-blue-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-200 transition"
      />

      {/* Show dropdown only when:
          1. Suggestions exist
          2. User hasn't already selected current value
      */}
      {suggestions.length > 0 &&
        query !== selectedText && (

        <div className="absolute z-[100001] mt-1 w-full bg-white border border-blue-100 rounded-xl shadow-lg max-h-48 overflow-y-auto">

          {suggestions.map((place) => (

            <button
              key={place.place_id}
              type="button"

              // Use onMouseDown instead of onClick
              // Prevents input losing focus before selection happens
              onMouseDown={(e) => {

                e.preventDefault();

                handleSelect(place);

              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              {place.display_name}
            </button>

          ))}

        </div>
      )}

    </div>
  );
};

export default LocationAutocomplete;