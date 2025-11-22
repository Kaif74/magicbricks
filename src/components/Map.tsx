"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Project } from "@/types";
// @ts-ignore: CSS module declarations missing for side-effect import
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  projects: Project[];
  center: { lat: number; lng: number };
  selectedProjectId: string | null;
  onMarkerClick: (projectId: string) => void;
}

// Component to update map center
function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);

  return null;
}

const MapComponent: React.FC<MapProps> = ({
  projects,
  center,
  selectedProjectId,
  onMarkerClick,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  const projectsWithCoords = projects.filter((p) => p.coordinates !== null);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      style={{ width: "100%", height: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={center} />

      {projectsWithCoords.map((project) => (
        <Marker
          key={project.id}
          position={[project.coordinates!.lat, project.coordinates!.lng]}
          eventHandlers={{
            click: () => onMarkerClick(project.id),
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-sm mb-1">{project.name}</h3>
              <p className="text-xs text-gray-600 mb-1">{project.location}</p>
              <p className="text-xs font-medium text-brand-600">
                {project.priceRange}
              </p>
              {project.builderName && (
                <p className="text-xs text-gray-500 mt-1">
                  Builder: {project.builderName}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
