"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Project } from "@/types";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  projects: Project[];
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function Map({ projects }: MapProps) {
  // Center map on the first project or a default location
  const center =
    projects.length > 0 && projects[0].latitude && projects[0].longitude
      ? ([projects[0].latitude, projects[0].longitude] as [number, number])
      : ([17.385, 78.4867] as [number, number]); // Default to Hyderabad

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: "100%", width: "100%" }}
    >
      <ChangeView center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {projects.map(
        (project) =>
          project.latitude &&
          project.longitude && (
            <Marker
              key={project.id}
              position={[project.latitude, project.longitude]}
              icon={icon}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.location}</p>
                  <p className="text-sm font-semibold mt-1">
                    {project.priceRange}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    By {project.builder}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {project.latitude?.toFixed(4)},{" "}
                    {project.longitude?.toFixed(4)}
                  </p>
                </div>
              </Tooltip>
            </Marker>
          )
      )}
    </MapContainer>
  );
}
