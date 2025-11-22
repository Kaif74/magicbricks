export interface Project {
  id: string;
  name: string;
  location: string;
  cityName: string;
  priceRange: string;
  builderName: string;
  bhkPossession?: string;
  imageUrl?: string;
  amenitiesCount?: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  status: "Scraped" | "Geocoding" | "Ready" | "Error";
}

export interface CityConfig {
  name: string;
  center: {
    lat: number;
    lng: number;
  };
}

export interface GeocodingResponse {
  data: Array<{
    latitude: number;
    longitude: number;
    label: string;
  }>;
}

export interface ScrapedProperty {
  projectName: string;
  location: string;
  priceRange: string;
  bhkPossession: string;
  imageUrl: string;
  amenitiesCount: string;
}
