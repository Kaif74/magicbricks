import React from "react";
import { Project } from "@/types";
import { MapPin, Building2, IndianRupee } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSelected,
  onClick,
}) => {
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "Scraped":
        return "bg-blue-100 text-blue-700";
      case "Geocoding":
        return "bg-yellow-100 text-yellow-700";
      case "Ready":
        return "bg-green-100 text-green-700";
      case "Error":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md
        ${
          isSelected
            ? "border-brand-500 bg-brand-50 shadow-lg"
            : "border-gray-200 bg-white hover:border-brand-300"
        }
      `}
    >
      {/* Status Badge */}
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
            project.status
          )}`}
        >
          {project.status}
        </span>
        {project.imageUrl && (
          <img
            src={project.imageUrl}
            alt={project.name}
            className="w-12 h-12 object-cover rounded"
          />
        )}
      </div>

      {/* Project Name */}
      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
        {project.name}
      </h3>

      {/* Location */}
      <div className="flex items-start gap-1 text-xs text-gray-600 mb-2">
        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
        <span className="line-clamp-2">{project.location}</span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-1 text-xs text-gray-700 mb-2">
        <IndianRupee className="w-3 h-3" />
        <span className="font-medium">
          {project.priceRange || "Price on Request"}
        </span>
      </div>

      {/* Builder */}
      {project.builderName && (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Building2 className="w-3 h-3" />
          <span className="truncate">{project.builderName}</span>
        </div>
      )}

      {/* Coordinates indicator */}
      {project.coordinates && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-green-600 font-medium">📍 Mapped</span>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
