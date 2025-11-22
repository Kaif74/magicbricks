import { NextApiRequest, NextApiResponse } from "next";

const POSITIONSTACK_BASE_URL = "http://api.positionstack.com/v1/forward";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { location, cityName, apiKey } = req.body;

  if (!location || !cityName) {
    return res
      .status(400)
      .json({ error: "Location and city name are required" });
  }

  // If no API key provided, return mock data
  if (!apiKey) {
    return res.status(200).json({
      lat: 0,
      lng: 0,
      mocked: true,
    });
  }

  try {
    const query = `${location}, ${cityName}`;
    const url = `${POSITIONSTACK_BASE_URL}?access_key=${apiKey}&query=${encodeURIComponent(
      query
    )}&limit=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data && data.data && data.data.length > 0) {
      const result = data.data[0];
      return res.status(200).json({
        lat: result.latitude,
        lng: result.longitude,
        mocked: false,
      });
    }

    return res.status(404).json({ error: "Location not found" });
  } catch (error: any) {
    console.error("Geocoding error:", error);
    return res.status(500).json({ error: error.message });
  }
}
