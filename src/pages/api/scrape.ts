import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { ScrapedProperty } from "@/types";

const propertyCardSelector = ".projdis__prjcard";

async function scrapeMagicbricks(cityName: string): Promise<ScrapedProperty[]> {
  const url = `https://www.magicbricks.com/new-projects-${encodeURIComponent(
    cityName
  )}`;

  let browser;

  console.log(`Scraping: ${url}`);

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    await page.waitForSelector(propertyCardSelector, { timeout: 20000 });

    const htmlContent = await page.content();
    const $ = cheerio.load(htmlContent);

    const properties: ScrapedProperty[] = [];

    $(propertyCardSelector).each((i, element) => {
      const container = $(element);

      const imageContainer = container.find(".mghome__prjblk__imgsec");

      const imageUrl =
        imageContainer.find(".mghome__prjblk__imgsec__img").attr("src") || "";

      const projectName = imageContainer
        .find(".mghome__prjblk__txtsec h2 a")
        .text()
        .trim();

      const location = imageContainer
        .find(".mghome__prjblk__locname")
        .text()
        .trim();

      const priceRange = imageContainer
        .find(".mghome__prjblk__price")
        .text()
        .trim()
        .replace(/[\n\r\t]/g, "");

      const bhkPossession = imageContainer
        .find(".mghome__prjblk__bhk")
        .text()
        .trim();

      const amenitiesCount = container
        .find(".mghome__linkblks__card--amenities .mghome__linkblks__card__txt")
        .text()
        .trim()
        .replace(/All | Amenities in the Project/g, "");

      if (projectName && location) {
        properties.push({
          projectName,
          location,
          priceRange,
          bhkPossession,
          imageUrl,
          amenitiesCount: amenitiesCount || "N/A",
        });
      }
    });

    console.log(`Scraped ${properties.length} properties.`);

    return properties;
  } catch (error: any) {
    console.error("Scraping Error:", error.message);
    throw new Error(
      `Scraping failed for ${cityName}. Details: ${error.message}`
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { cityName } = req.query;

  if (!cityName || typeof cityName !== "string") {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    const data = await scrapeMagicbricks(cityName);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
