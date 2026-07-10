import { useEffect, useState } from "react";
import axios from "axios";

const LocationSearch = ({ label, value, onChange }) => {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search`,
          {
            params: {
              q: query,
              format: "json",
              addressdetails: 1,
              limit: 5,
            },
            headers: {
              "Accept-Language": "en",
            },
          }
        );

        setSuggestions(res.data);
      } catch (err) {
        console.log(err);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [query]);

  const selectLocation = (place) => {
  setQuery(place.display_name);
  onChange(place.display_name);
  setSuggestions([]);
  setShowSuggestions(false);
};




  return (
    <div className="relative z-50">
      <label className="input-label">{label}</label>

      <input
        type="text"
        className="input"
        value={query}
        placeholder={`Search ${label}`}
        onChange={(e) => {
    setQuery(e.target.value);
    onChange(e.target.value);   // <-- Add this line
    setShowSuggestions(true);
}}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
  className="absolute left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-lg z-[9999] max-h-60 overflow-auto"
>
        
          {suggestions.map((place) => (
            <div
              key={place.place_id}
              onClick={() => selectLocation(place)}
              className="px-4 py-3 cursor-pointer hover:bg-yellow-400 hover:text-black text-sm border-b border-white/5"
            >
             <>
  <div className="font-semibold">
    📍 {place.display_name.split(",")[0]}
  </div>

  <div className="text-xs text-gray-400 mt-1">
    {place.display_name}
  </div>
</>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;