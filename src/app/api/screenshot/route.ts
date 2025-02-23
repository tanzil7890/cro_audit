import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

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

    // Launch headless browser with additional options
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1280,800'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });

    // Set default timeout
    page.setDefaultTimeout(30000);

    // Handle page errors
    page.on('error', err => {
      console.error('Page error:', err);
    });

    // Block unnecessary resources to speed up loading
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (['media', 'font', 'websocket'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    try {
      // Navigate to URL with timeout and wait for content
      await page.goto(url, {
        waitUntil: ['domcontentloaded', 'networkidle2'],
        timeout: 15000,
      });

      // Wait for main content to be visible
      await page.waitForSelector('body', { timeout: 5000 });

      // Optional: Wait a bit for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Take screenshot with better options
      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: 85,
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1280,
          height: 800
        },
        encoding: 'base64'
      });

      await browser.close();

      return NextResponse.json({
        success: true,
        data: {
          screenshot: `data:image/jpeg;base64,${screenshot}`,
          timestamp: new Date().toISOString()
        }
      });
    } catch (pageError) {
      console.error('Error during page operations:', pageError);
      
      // Try to take a screenshot anyway, even if page didn't fully load
      try {
        const screenshot = await page.screenshot({
          type: 'jpeg',
          quality: 80,
          fullPage: false,
          encoding: 'base64'
        });

        await browser.close();

        return NextResponse.json({
          success: true,
          data: {
            screenshot: `data:image/jpeg;base64,${screenshot}`,
            timestamp: new Date().toISOString(),
            partial: true
          }
        });
      } catch (screenshotError) {
        throw screenshotError;
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to capture screenshot',
        code: 'SCREENSHOT_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
} 