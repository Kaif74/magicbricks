import React, { useState } from "react";
import { useRouter } from "next/router";
import { Building2, Search, MapPin } from "lucide-react";
import { POPULAR_CITIES } from "@/config/cities";

const Home: React.FC = () => {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState("");
  const [customCity, setCustomCity] = useState("");

  const handleNavigate = () => {
    const city = customCity || selectedCity;
    if (city) {
      router.push(`/city/${encodeURIComponent(city)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNavigate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-600 rounded-2xl mb-6 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            MagicBricks Real Estate Explorer
          </h1>
          <p className="text-lg text-gray-600">
            Discover real estate projects in real-time with interactive maps
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
          {/* Popular Cities */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select a City
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {POPULAR_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setCustomCity("");
                  }}
                  className={`
                    px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium
                    ${
                      selectedCity === city
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                or enter a custom city
              </span>
            </div>
          </div>

          {/* Custom City Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Custom City Name
            </label>
            <input
              type="text"
              placeholder="e.g., Jaipur, Chandigarh..."
              value={customCity}
              onChange={(e) => {
                setCustomCity(e.target.value);
                setSelectedCity("");
              }}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleNavigate}
            disabled={!selectedCity && !customCity}
            className={`
              w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2
              ${
                selectedCity || customCity
                  ? "bg-brand-600 hover:bg-brand-700 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            <Search className="w-5 h-5" />
            Explore {customCity || selectedCity || "City"} Projects
          </button>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Data is scraped in real-time from MagicBricks and displayed
            incrementally
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by Next.js, Puppeteer & PositionStack API</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
