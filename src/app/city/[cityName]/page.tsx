"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useProjectStore } from "@/store/useProjectStore";
import { Project } from "@/types";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function CityPage() {
  const { cityName } = useParams();
  const { projects, addProject, reset, setLoading } = useProjectStore();
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    if (!cityName) return;

    const fetchProjects = async () => {
      reset();
      setLoading(true);
      setIsScraping(true);

      try {
        const response = await fetch(`/api/scrape?city=${cityName}`);
        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              try {
                const project: Project = JSON.parse(line);
                addProject(project);
              } catch (e) {
                console.error("Error parsing JSON", e);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
        setIsScraping(false);
      }
    };

    fetchProjects();
  }, [cityName, reset, addProject, setLoading]);

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="w-full md:w-1/3 p-4 overflow-y-auto bg-gray-50 border-r">
        <h1 className="text-2xl font-bold mb-4 capitalize">
          New Projects in {cityName}
        </h1>

        {isScraping && (
          <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Fetching projects...
          </div>
        )}

        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow"
            >
              <h2 className="font-bold text-lg text-blue-600">
                {project.name}
              </h2>
              <p className="text-gray-600 text-sm">{project.location}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="font-semibold text-gray-800">
                  {project.priceRange}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">By {project.builder}</p>
              <p className="text-xs text-gray-400 mt-1">
                Lat: {project.latitude?.toFixed(4)}, Lng:{" "}
                {project.longitude?.toFixed(4)}
              </p>
            </div>
          ))}

          {!isScraping && projects.length === 0 && (
            <div className="text-gray-500 text-center mt-10">
              No projects found.
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-2/3 h-[50vh] md:h-auto relative">
        <Map projects={projects} />
      </div>
    </div>
  );
}
