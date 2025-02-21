'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';
import { WebsiteInfo } from '../types/api';

export async function scrapeWebsite(url: string): Promise<WebsiteInfo> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Extract website information
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content')?.trim();
    const mainHeadings = $('h1, h2').map((_, el) => $(el).text().trim()).get();
    
    // Get main content by combining text from p tags and other relevant elements
    const mainContent = $('p, article, section')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(text => text.length > 50) // Filter out short texts
      .join('\n')
      .slice(0, 5000); // Limit content length

    return {
      title,
      description: metaDescription || '',
      metaDescription,
      mainHeadings,
      mainContent
    };
  } catch (error) {
    console.error('Error scraping website:', error);
    throw new Error('Failed to scrape website');
  }
} 