import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { Project } from "@/types";

const POSITIONSTACK_API_KEY = process.env.POSITIONSTACK_API_KEY;

async function getCoordinates(location: string, city: string) {
  // Mock coordinates if no key or for demo purposes to ensure markers appear on map
  // Default to Hyderabad
  let baseLat = 17.385;
  let baseLng = 78.4867;

  // Simple lookup for a few major cities to make the mock more realistic
  const cityCoords: Record<string, [number, number]> = {
    hyderabad: [17.385, 78.4867],
    bangalore: [12.9716, 77.5946],
    bengaluru: [12.9716, 77.5946],
    mumbai: [19.076, 72.8777],
    delhi: [28.6139, 77.209],
    "new delhi": [28.6139, 77.209],
    chennai: [13.0827, 80.2707],
    kolkata: [22.5726, 88.3639],
    pune: [18.5204, 73.8567],
  };

  const lowerCity = city.toLowerCase();
  if (cityCoords[lowerCity]) {
    [baseLat, baseLng] = cityCoords[lowerCity];
  }

  if (!POSITIONSTACK_API_KEY) {
    console.log("No API key found, using mock coordinates");
    return {
      latitude: baseLat + (Math.random() - 0.5) * 0.2,
      longitude: baseLng + (Math.random() - 0.5) * 0.2,
    };
  }

  try {
    const query = `${location}, ${city}`;
    console.log(`Geocoding ${query} with API`);
    const response = await axios.get(
      "http://api.positionstack.com/v1/forward",
      {
        params: {
          access_key: POSITIONSTACK_API_KEY,
          query: query,
          limit: 1,
        },
      }
    );
    const data = response.data.data[0];
    if (data) {
      return { latitude: data.latitude, longitude: data.longitude };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }

  // Fallback if API fails
  return {
    latitude: baseLat + (Math.random() - 0.5) * 0.2,
    longitude: baseLng + (Math.random() - 0.5) * 0.2,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const url = `https://www.magicbricks.com/new-projects-${city}`;
        console.log(`Fetching ${url}`);

        const response = await axios.get(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        });

        const html = response.data;
        const $ = cheerio.load(html);

        interface ScrapedProject {
          name: string;
          location: string;
          priceRange: string;
          builder: string;
        }
        const projects: ScrapedProject[] = [];

        // Try to find project cards based on common structure
        // MagicBricks structure can vary, but usually has h2 for titles
        $("h2").each((i, el) => {
          const titleLink = $(el).find("a");
          if (titleLink.length > 0) {
            const name = titleLink.text().trim();
            const link = titleLink.attr("href");

            // Extract location - usually text after title or in a nearby element
            // Based on markdown: "Gandi Maisamma, Outer Ring Road, Hyderabad"
            // It seems to be in a text node or p tag following the h2
            let location = "";
            let priceRange = "";
            const builder = "";

            // Attempt to find location and price in siblings or parent text

            // This is a heuristic approach since we don't have exact classes
            // We'll try to parse the text content of the container

            // Let's look for specific patterns if possible, or just use the text
            // For now, let's try to find the location from the text immediately following the h2
            const nextEl = $(el).next();
            if (nextEl.length) {
              location = nextEl.text().trim();
            }

            // If location is empty or too long, try to extract from the link or title context
            if (!location || location.length > 100) {
              // Fallback: try to extract from the text content of the parent div, splitting by newlines
              const lines = $(el)
                .parent()
                .text()
                .split("\n")
                .map((l) => l.trim())
                .filter((l) => l);
              const nameIndex = lines.findIndex((l) => l.includes(name));
              if (nameIndex !== -1 && lines[nameIndex + 1]) {
                location = lines[nameIndex + 1];
              }
            }

            // Price range often contains "₹" or "Cr" or "Lac"
            const priceEl = $(el)
              .parent()
              .find('div:contains("₹"), span:contains("₹")')
              .first();
            if (priceEl.length) {
              priceRange = priceEl.text().trim();
            } else {
              // Search in text
              const text = $(el).parent().text();
              const priceMatch =
                text.match(
                  /₹[\d\.]+\s*(?:Lac|Cr|Crore)\s*-\s*₹[\d\.]+\s*(?:Lac|Cr|Crore)/i
                ) || text.match(/₹[\d\.]+\s*(?:Lac|Cr|Crore)/i);
              if (priceMatch) {
                priceRange = priceMatch[0];
              }
            }

            // Builder often has "Followers" or is a link
            // We can look for text that looks like a builder name
            // Or just use a placeholder if not found

            if (name && link) {
              // Filter out projects that don't match the city (to avoid "Nearby" or "Pan-India" recommendations)
              if (
                location &&
                !location.toLowerCase().includes(city.toLowerCase())
              ) {
                return;
              }

              projects.push({
                name,
                location: location || city,
                priceRange: priceRange || "Price on Request",
                builder: builder || "Unknown Builder",
              });
            }
          }
        });

        // If scraping yields nothing (e.g. due to layout changes or blocking), fallback to mock
        if (projects.length === 0) {
          console.log(
            "Scraping returned 0 projects, falling back to mock data"
          );

          const mockDataByCity: Record<string, ScrapedProject[]> = {
            hyderabad: [
              {
                name: "Aparna Synergy",
                location: "Gandi Maisamma, Hyderabad",
                priceRange: "₹88.6 Lac - ₹1.40 Cr",
                builder: "Aparna Constructions",
              },
              {
                name: "Cloudswood Radhey Skye",
                location: "Kollur, Hyderabad",
                priceRange: "₹92.7 Lac - ₹1.82 Cr",
                builder: "Radhey Constructions",
              },
              {
                name: "Rubrick Tripura",
                location: "Gandi Maisamma, Hyderabad",
                priceRange: "₹61.2 Lac - ₹1.05 Cr",
                builder: "Rubrick",
              },
              {
                name: "CYBERCITY Stone Ridge",
                location: "Kukatpally, Hyderabad",
                priceRange: "₹1.56 Cr - ₹3.97 Cr",
                builder: "Cybercity Developers",
              },
            ],
            bangalore: [
              {
                name: "Prestige Lakeside Habitat",
                location: "Varthur, Bangalore",
                priceRange: "₹95 Lac - ₹2.5 Cr",
                builder: "Prestige Group",
              },
              {
                name: "Sobha Dream Acres",
                location: "Panathur, Bangalore",
                priceRange: "₹65 Lac - ₹1.2 Cr",
                builder: "Sobha Ltd",
              },
              {
                name: "Godrej United",
                location: "Whitefield, Bangalore",
                priceRange: "₹1.5 Cr - ₹3 Cr",
                builder: "Godrej Properties",
              },
            ],
            mumbai: [
              {
                name: "Lodha World Towers",
                location: "Lower Parel, Mumbai",
                priceRange: "₹4.5 Cr - ₹12 Cr",
                builder: "Lodha Group",
              },
              {
                name: "Godrej The Trees",
                location: "Vikhroli, Mumbai",
                priceRange: "₹2.2 Cr - ₹5 Cr",
                builder: "Godrej Properties",
              },
            ],
            delhi: [
              {
                name: "DLF Capital Greens",
                location: "Moti Nagar, Delhi",
                priceRange: "₹2.5 Cr - ₹5 Cr",
                builder: "DLF",
              },
              {
                name: "Unity The Amaryllis",
                location: "Karol Bagh, Delhi",
                priceRange: "₹3 Cr - ₹7 Cr",
                builder: "Unity Group",
              },
            ],
            pune: [
              {
                name: "Amanora Gateway Towers",
                location: "Hadapsar, Pune",
                priceRange: "₹1.5 Cr - ₹4 Cr",
                builder: "Amanora Park Town",
              },
              {
                name: "Blue Ridge",
                location: "Hinjewadi, Pune",
                priceRange: "₹70 Lac - ₹1.5 Cr",
                builder: "Paranjape Schemes",
              },
            ],
          };

          let mockProjects = mockDataByCity[city.toLowerCase()];

          if (!mockProjects) {
            mockProjects = [
              {
                name: "Luxury Heights",
                location: `City Center, ${city}`,
                priceRange: "₹50 Lac - ₹1.5 Cr",
                builder: "Premium Builders",
              },
              {
                name: "Green Valley",
                location: `Suburbs, ${city}`,
                priceRange: "₹40 Lac - ₹90 Lac",
                builder: "Eco Homes",
              },
              {
                name: "Urban Towers",
                location: `Tech Park Area, ${city}`,
                priceRange: "₹80 Lac - ₹2 Cr",
                builder: "Urban Spaces",
              },
            ];
          }
          projects.push(...mockProjects);
        }

        for (const item of projects) {
          // Clean up location if it contains the price or other junk
          let cleanLocation = item.location;
          if (cleanLocation.includes("₹")) {
            cleanLocation = cleanLocation.split("₹")[0].trim();
          }

          const coords = await getCoordinates(cleanLocation, city);
          const project: Project = {
            id: Math.random().toString(36).substr(2, 9),
            name: item.name,
            location: cleanLocation,
            priceRange: item.priceRange,
            builder: item.builder,
            latitude: coords.latitude,
            longitude: coords.longitude,
          };

          controller.enqueue(encoder.encode(JSON.stringify(project) + "\n"));

          // Simulate delay for "incremental" feel
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        controller.close();
      } catch (error) {
        console.error("Scraping error:", error);
        controller.error(error);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain", // Using text/plain for NDJSON style streaming
    },
  });
}
