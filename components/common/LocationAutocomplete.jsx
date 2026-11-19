import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { url } from "../../utils/constant";

const DefaultLocationAutocomplete = ({
  // Identifies the input field and connects it to its label
  id,
  // Location value received from the parent
  value,
  // Function used to send the selected location back to the parent
  onChange,
  // a function the parent can provide
  onTyping,
  // Text displayed when the input is empty
  placeholder = "Search location",
  // Optional list of locations to search locally
  locations = null,
}) => {
  // We include query in the dependency array because we want the effect to run whenever the usr types something new.
  // if  we remove query, React will still store the typed text, but typing alone will no longer trigger the search effect. Therefore, the location suggestions may not update correctly.
  // Stores whatever user types into the input box
  const [query, setQuery] = useState(value || "");

  // matching locations to display.
  const [suggestions, setSuggestions] = useState([]);

  // the previously selected location.
  const [selectedText, setSelectedText] = useState(value || "");

  // Sync parent value with component state
  useEffect(() => {
    setQuery(value || "");
    setSelectedText(value || "");
  }, [value]);

  // Search OpenStreetMap locations
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

      // For job filters, use locations from our own job data.
      // No external API request is needed.
      // Q: Will Geoapify be called if locations =  [] ?
      // >> No because Array.isArray(locations) return true, even when the array is empty. The component searches the empty array, finds no matches, and returns before reaching the Geoapify API request.
      // Array.isArray([]);   // true
      // Array.isArray(null); // false
      if (Array.isArray(locations)) {
        const matchingLocations = locations
          .filter((location) =>
            location
              .toLowerCase()
              .includes(query.trim().toLowerCase())
          )
          .slice(0, 5)
          .map((location) => {
            const [city, ...countryParts] = location.split(",");

            return {
              place_id: location,
              display_name: location,
              address: {
                city: city.trim(),
                country: countryParts.join(",").trim(),
              },
            };
          });

        setSuggestions(matchingLocations);
        return;
      }
      try {
        // Call our own Next.js API route.
        // The API key stays on the server.
        const res = await axios.get(
          "/api/location-suggestions",
          {
            params: {
              // User search text
              q: query,
            },
          }
        );
        console.log("res from location autocomplete:", res.data)

        // Conver Geoapify's response into the format
        // our existing autocomplete component understands

        const places = (res.data.suggestions || []).map(
          (place) => ({
            place_id: place.id,
            display_name: place.displayName,
            address: {
              city:
                place.city === place.state
                  ? place.displayName.split(",")[0]
                  : place.city,
              country: place.country,
              // Additional geographical information
              county: place.county || "",
              locationType: place.locationType || "",
            },
          })
        );
        // Display the matching location
        setSuggestions(places);
      } catch (error) {
        console.error("Location search error:", error);
      }
      // setTimeout to wait 400 milliseconds after the user stops typing before searching for locations. If the user types another character before 400milliseconds have passed, clearTimeout cancels the previous timer. This reduces unnecessary API requests and improves performance.
    }, 400);

    // Cleanup previous timer when user keeps typing
    return () => clearTimeout(timer);

  }, [query, selectedText, locations]);

  // User selected one suggestion
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

  // Preserve the geographical information.
  county: address.county || "",
  locationType: address.locationType || "",
};

    // setQuery(displayName) updates the text in the input.
    setQuery(displayName);

    // setSelectedText(displayName) remembers that the location has been selected, so the suggestions don't reopen unnecessarily.
    setSelectedText(displayName);

    //setSuggestions([]) clears the dropdown,
    setSuggestions([]);

    // onChange(selectedLocation) sends the selected location to the parent component.
    onChange(selectedLocation);
  };

  // The important distinction is that setQuery() updates the child component, whereas onChange() informs the parent. Without the callback, the signup form or job filter wouldn't receive the new selection.



  return (
    <div className="relative">

      {/* Location input */}
      <input
        id={id}
        value={query}


onChange={(e) => {
  // Get the latest text entered by the user.
  const newText = e.target.value;

  // Update the text displayed in the input.
  setQuery(newText);

  // Clear the previously selected location.
  setSelectedText("");

  // Inform the parent that the user is editing.
  onTyping?.();

  // If the input is completely empty,
  // also clear the parent's saved location.
  if (newText === "") {
    onChange({
      displayName: "",
      city: "",
      country: "",
    });
  }
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

/**
 * Opt in with mode="job" and scope="locality" or scope="country".
 * value is display text, separate from the saved selection.
 * onChange receives { displayLabel, location, token }. On typing or a scope
 * change, location/token are null and displayLabel retains the current text.
 * Parents should save displayLabel as value and replace the saved selection.
 * Tokens are opaque: only the backend can verify them at submission time.
 */
const JobLocationAutocomplete = ({
  id,
  value,
  onChange,
  onTyping,
  placeholder = "Search location",
  scope = "locality",
}) => {
  const [query, setQuery] = useState(value || "");
const [selectedText, setSelectedText] = useState(value || "");  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const previousScope = useRef(scope);
  const latest = useRef({ query, onChange });
  latest.current = { query, onChange };

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    if (previousScope.current !== scope) {
      previousScope.current = scope;
      setSelectedText("");
      latest.current.onChange({
        displayLabel: latest.current.query,
        location: null,
        token: null,
      });
    }
  }, [scope]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setSuggestions([]);
    setError("");

    if (scope !== "locality" && scope !== "country") {
      setStatus("error");
      setError("Choose a locality or country search scope.");
      return;
    }

    const searchText = query.trim();
    if (searchText.length < 2 || query === selectedText) {
      setStatus("idle");
      return;
    }

    if (searchText.length > 100) {
      setStatus("error");
      setError("Location search must be 100 characters or fewer.");
      return;
    }

   
setStatus("loading");

const timer = setTimeout(async () => {
  try {
    const response = await axios.get(
      `${url.replace(/\/$/, "")}/api/locations/autocomplete`,
      {
        params: { q: searchText, scope },
        signal: controller.signal,
        timeout: 10000,
      }
    );

    const results = response.data?.suggestions;

    // Only accept complete, signed suggestions.
    if (
      !Array.isArray(results) ||
      results.some(
        (place) =>
          !place ||
          typeof place.displayLabel !== "string" ||
          !place.displayLabel.trim() ||
          !place.location ||
          typeof place.location !== "object" ||
          Array.isArray(place.location) ||
          typeof place.token !== "string" ||
          !place.token.trim()
      )
    ) {
      throw new Error("Invalid location suggestions");
    }

    // Ignore results from an outdated request.
    if (!active) return;

    setSuggestions(results);
    setStatus(results.length ? "success" : "empty");

  } catch (requestError) {

    // Ignore cancelled requests.
    if (
      !active ||
      controller.signal.aborted ||
      axios.isCancel(requestError)
    ) {
      return;
    }

    setSuggestions([]);
    setStatus("error");

    setError(
      requestError.response?.status === 429
        ? "Too many location searches. Please wait and try again."
        : "Unable to search locations. Please try again."
    );
  }
}, 400);

// Cleanup when the user types again or leaves the page.
return () => {
  active = false;
  clearTimeout(timer);
  controller.abort();
};

  }, [query, selectedText, scope]);

  return (
    <div className="relative">
      <input
        id={id}
        value={query}
        onChange={(event) => {
          const text = event.target.value;
          setQuery(text);
          setSelectedText("");
          setSuggestions([]);
          setStatus("idle");
          setError("");
          onChange({ displayLabel: text, location: null, token: null });
          onTyping?.(text);
        }}
        placeholder={placeholder}
        autoComplete="off"
        aria-busy={status === "loading"}
        className="w-full border-[1.5px] border-blue-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-200 transition"
      />
      <div role="status" aria-live="polite" className="text-sm text-slate-600">
        {status === "loading" && "Searching locations..."}
        {status === "empty" && "No locations found. Try another search."}
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {suggestions.length > 0 && query !== selectedText && (
        <div className="absolute z-[100001] mt-1 w-full bg-white border border-blue-100 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((place) => (
            <button
              key={place.token}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setQuery(place.displayLabel);
                setSelectedText(place.displayLabel);
                setSuggestions([]);
                setStatus("idle");
                onChange({
                  displayLabel: place.displayLabel,
                  location: { ...place.location },
                  token: place.token,
                });
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              {place.displayLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const LocationAutocomplete = ({ mode = "default", ...props }) =>
  mode === "job"
    ? <JobLocationAutocomplete {...props} />
    : <DefaultLocationAutocomplete {...props} />;

export default LocationAutocomplete;


// useState stores information.
// useEffect performs an action when its dependencies change.
