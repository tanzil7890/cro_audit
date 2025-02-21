import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { scrapeWebsite } from '@/app/utils/scraper';
import { APIResponse, ScrapeResponse } from '@/app/types/api';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'URL is required',
          code: 'MISSING_URL'
        }
      }, { status: 400 });
    }

    // Scrape website content
    const websiteInfo = await scrapeWebsite(url);

    // Generate AI description using OpenAI
    const prompt = `
      Analyze this website and create a concise, professional description (max 2 sentences) that highlights its main purpose and value proposition.
      
      Website Title: ${websiteInfo.title}
      Meta Description: ${websiteInfo.metaDescription}
      Main Headings: ${websiteInfo.mainHeadings.join(', ')}
      Main Content Excerpt: ${websiteInfo.mainContent.slice(0, 1000)}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional website analyzer. Create concise, accurate descriptions that capture the essence of websites."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    const aiDescription = completion.choices[0].message.content || '';

    const response: APIResponse<ScrapeResponse> = {
      success: true,
      data: {
        websiteInfo,
        aiDescription
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error analyzing website:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to analyze website',
        code: 'ANALYSIS_FAILED'
      }
    }, { status: 500 });
  }
} 