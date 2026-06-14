import React, { useEffect, useState } from "react";
import axios from "axios";

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "Search location",
}) => {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedText, setSelectedText] = useState(value || "");

  useEffect(() => {
    setQuery(value || "");
    setSelectedText(value || "");
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2 || query === selectedText) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: query,
              format: "json",
              addressdetails: 1,
              limit: 5,
            },
          }
        );

        setSuggestions(res.data || []);
      } catch (error) {
        console.error("Location search error:", error);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, selectedText]);

  const handleSelect = (place) => {
    const address = place.address || {};

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

    const country = address.country || "";

    const displayName =
      city && country ? `${city}, ${country}` : place.display_name;

    const selectedLocation = {
      displayName,
      city,
      country,
    };

    setQuery(displayName);
    setSelectedText(displayName);
    setSuggestions([]);

    onChange(selectedLocation);
  };

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedText("");
        }}
        placeholder={placeholder}
        className="w-full border-[1.5px] border-blue-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-200 transition"
      />

      {suggestions.length > 0 && query !== selectedText && (
        <div className="absolute z-[100001] mt-1 w-full bg-white border border-blue-100 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((place) => (
            <button
              key={place.place_id}
              type="button"
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