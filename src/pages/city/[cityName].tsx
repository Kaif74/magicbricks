"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { ArrowLeft, RefreshCw, Key, Loader2 } from "lucide-react";
import { Project } from "@/types";
import { CITY_CENTERS } from "@/config/cities";
import ProjectCard from "@/components/ProjectCard";

// Dynamically import Map component (client-side only)
const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

const CityDashboard: React.FC = () => {
  const router = useRouter();
  const { cityName } = router.query;

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [isScraping, setIsScraping] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [apiKey, setApiKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const decodedCityName = cityName
    ? decodeURIComponent(cityName as string)
    : "";

  // Load API key from localStorage
  useEffect(() => {
    const storedKey = localStorage.getItem("positionstack_key") || "";
    setApiKey(storedKey);
  }, []);

  // Initialize map center
  useEffect(() => {
    if (!decodedCityName) return;
    const defaultCenter =
      CITY_CENTERS[decodedCityName]?.center || CITY_CENTERS["Hyderabad"].center;
    setMapCenter(defaultCenter);
  }, [decodedCityName]);

  // Mock geocode function for fallback
  const mockGeocode = useCallback((center: { lat: number; lng: number }) => {
    const offsetLat = (Math.random() - 0.5) * 0.1;
    const offsetLng = (Math.random() - 0.5) * 0.1;
    return {
      lat: center.lat + offsetLat,
      lng: center.lng + offsetLng,
    };
  }, []);

  // Geocode a single project
  const geocodeProject = useCallback(
    async (project: Project) => {
      try {
        if (apiKey) {
          const response = await fetch("/api/geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: project.location,
              cityName: project.cityName,
              apiKey,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (!data.mocked && data.lat && data.lng) {
              return { lat: data.lat, lng: data.lng };
            }
          }
        }

        // Fallback to mock
        const center =
          CITY_CENTERS[decodedCityName]?.center ||
          CITY_CENTERS["Hyderabad"].center;
        return mockGeocode(center);
      } catch (error) {
        console.error("Geocoding error:", error);
        const center =
          CITY_CENTERS[decodedCityName]?.center ||
          CITY_CENTERS["Hyderabad"].center;
        return mockGeocode(center);
      }
    },
    [apiKey, decodedCityName, mockGeocode]
  );

  // Handle Geocoding Queue
  useEffect(() => {
    const processQueue = async () => {
      const pending = projects.find((p) => p.status === "Scraped");
      if (!pending) return;

      // Mark as processing
      setProjects((prev) =>
        prev.map((p) =>
          p.id === pending.id ? { ...p, status: "Geocoding" } : p
        )
      );

      // Geocode
      let coords: { lat: number; lng: number } | null = null;
      let status: Project["status"] = "Error";

      try {
        coords = await geocodeProject(pending);
        status = "Ready";
      } catch (e) {
        console.error(e);
        status = "Error";
      }

      // Update Project
      setProjects((prev) =>
        prev.map((p) =>
          p.id === pending.id ? { ...p, coordinates: coords, status } : p
        )
      );

      setProcessedCount((prev) => prev + 1);
    };

    processQueue();
  }, [projects, geocodeProject]);

  // Start Scraping via Server-Sent Events
  useEffect(() => {
    if (!decodedCityName) return;

    setProjects([]);
    setIsScraping(true);
    setProcessedCount(0);
    setError(null);

    const eventSource = new EventSource(
      `/api/stream-scrape?cityName=${encodeURIComponent(decodedCityName)}`
    );

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        setIsScraping(false);
        eventSource.close();
        return;
      }

      try {
        const data = JSON.parse(event.data);

        if (data.error) {
          setError(data.error);
          setIsScraping(false);
          eventSource.close();
          return;
        }

        setProjects((prev) => [...prev, data as Project]);
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = () => {
      setError("Connection error. Retrying...");
      eventSource.close();
      setIsScraping(false);
    };

    return () => {
      eventSource.close();
    };
  }, [decodedCityName]);

  const handleKeySave = (key: string) => {
    setApiKey(key);
    localStorage.setItem("positionstack_key", key);
    setShowKeyInput(false);
  };

  const handleProjectClick = useCallback((project: Project) => {
    setSelectedProjectId(project.id);
    if (project.coordinates) {
      setMapCenter(project.coordinates);
    }
  }, []);

  const handleMarkerClick = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    // Scroll to project card
    const element = document.getElementById(`project-${projectId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  if (!cityName) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {decodedCityName}
              <span className="text-brand-600 text-sm font-normal bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                Live Feed
              </span>
            </h1>
            <p className="text-xs text-gray-500 flex items-center mt-0.5">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  isScraping ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              ></span>
              {isScraping ? "Scraping MagicBricks..." : "Scraping Complete"}
              <span className="mx-2">•</span>
              {projects.length} Found
              <span className="mx-2">•</span>
              {processedCount} Geocoded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors
              ${
                apiKey
                  ? "text-green-600 bg-green-50 hover:bg-green-100"
                  : "text-orange-600 bg-orange-50 hover:bg-orange-100"
              }
            `}
          >
            <Key className="w-4 h-4" />
            <span className="hidden md:inline">
              {apiKey ? "API Key Active" : "Add API Key"}
            </span>
          </button>
        </div>
      </header>

      {/* API Key Input Modal */}
      {showKeyInput && (
        <div className="absolute top-16 right-4 z-50 bg-white p-4 rounded-lg shadow-xl border border-gray-200 w-80 animate-in fade-in slide-in-from-top-2">
          <h3 className="font-semibold text-gray-800 mb-2">
            PositionStack API Key
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Enter your key to enable real geocoding. Without a key, we simulate
            locations near the city center.
          </p>
          <input
            type="text"
            placeholder="Enter Access Key"
            className="w-full p-2 border border-gray-300 rounded mb-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            defaultValue={apiKey}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleKeySave((e.target as HTMLInputElement).value);
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowKeyInput(false)}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                const input = e.currentTarget.parentElement
                  ?.previousElementSibling as HTMLInputElement;
                handleKeySave(input.value);
              }}
              className="text-xs bg-brand-600 text-white px-4 py-2 rounded hover:bg-brand-700"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Project List */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col z-10 shadow-lg">
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Latest Listings
            </span>
            {isScraping && (
              <RefreshCw className="w-3 h-3 animate-spin text-brand-500" />
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
            {projects.length === 0 && isScraping && (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-brand-300" />
                <p className="text-sm">Fetching properties...</p>
              </div>
            )}

            {projects.length === 0 && !isScraping && (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-3">
                <p className="text-sm">No properties found</p>
              </div>
            )}

            {projects.map((project) => (
              <div key={project.id} id={`project-${project.id}`}>
                <ProjectCard
                  project={project}
                  isSelected={selectedProjectId === project.id}
                  onClick={() => handleProjectClick(project)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="flex-1 relative">
          {mapCenter && (
            <MapComponent
              projects={projects}
              center={mapCenter}
              selectedProjectId={selectedProjectId}
              onMarkerClick={handleMarkerClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CityDashboard;
