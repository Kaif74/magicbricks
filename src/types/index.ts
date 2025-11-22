export interface Project {
  id: string;
  name: string;
  location: string;
  priceRange: string;
  builder: string;
  latitude?: number;
  longitude?: number;
}
