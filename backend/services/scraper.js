const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const robotsParser = require('robots-parser');

async function checkRobotsTxt(url) {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
    
    const response = await axios.get(robotsUrl, { timeout: 5000 });
    const robots = robotsParser(robotsUrl, response.data);
    
    const isAllowed = robots.isAllowed(url, 'AI-Sentinel-Bot');
    
    return {
      allowed: isAllowed,
      robotsUrl,
    };
  } catch (error) {
    // If robots.txt doesn't exist or fails, assume allowed but warn
    console.warn('Could not check robots.txt:', error.message);
    return { allowed: true, warning: 'robots.txt check failed' };
  }
}

async function scrapeWithCheerio(url) {
  try {
    console.log('📡 Scraping with Cheerio (static content)...');
    
    const response = await axios.get(url, {
      timeout: 30000,
      maxContentLength: 1024 * 1024, // 1MB limit
      headers: {
        'User-Agent': 'AI-Sentinel-Bot/1.0 (Legal Document Analyzer)',
      },
    });

    const $ = cheerio.load(response.data);
    
    // Remove script, style, and other non-content elements
    $('script, style, nav, header, footer, iframe, noscript').remove();
    
    // Try to find main content
    let text = '';
    
    // Common content containers
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '#content',
      '.terms',
      '.privacy-policy',
      'body',
    ];
    
    for (const selector of contentSelectors) {
      const content = $(selector).first();
      if (content.length) {
        text = content.text();
        break;
      }
    }
    
    if (!text) {
      text = $('body').text();
    }
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    if (text.length < 100) {
      throw new Error('Extracted text too short, page may be JavaScript-rendered');
    }
    
    console.log(`✅ Cheerio extraction complete (${text.length} characters)`);
    return text;
  } catch (error) {
    console.error('Cheerio scraping failed:', error.message);
    throw error;
  }
}

async function scrapeWithPuppeteer(url) {
  let browser;
  try {
    console.log('🎭 Scraping with Puppeteer (dynamic content)...');
    
    // Determine if we're in production (Render) or local environment
    const isProduction = process.env.NODE_ENV === 'production';
    
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    };
    
    // Add production-specific args for Render
    if (isProduction) {
      launchOptions.args.push(
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      );
      // Use puppeteer's bundled Chrome in production
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      }
    }
    
    browser = await puppeteer.launch(launchOptions);
    
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('AI-Sentinel-Bot/1.0 (Legal Document Analyzer)');
    
    // Navigate to page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    
    // Wait a bit for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract text content
    const text = await page.evaluate(() => {
      // Remove unwanted elements
      const elementsToRemove = document.querySelectorAll('script, style, nav, header, footer, iframe, noscript');
      elementsToRemove.forEach(el => el.remove());
      
      // Get main content
      const main = document.querySelector('article, main, [role="main"], .content, #content, .terms, .privacy-policy');
      return main ? main.innerText : document.body.innerText;
    });
    
    await browser.close();
    
    // Clean up whitespace
    const cleanedText = text.replace(/\s+/g, ' ').trim();
    
    if (cleanedText.length < 100) {
      throw new Error('Extracted text too short');
    }
    
    console.log(`✅ Puppeteer extraction complete (${cleanedText.length} characters)`);
    return cleanedText;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Puppeteer scraping failed:', error.message);
    throw error;
  }
}

async function scrapeURL(url) {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol. Only HTTP and HTTPS are supported.');
    }
    
    console.log(`🌐 Starting URL scraping: ${url}`);
    
    // Check robots.txt (non-blocking, just log warning)
    const robotsCheck = await checkRobotsTxt(url);
    if (!robotsCheck.allowed) {
      console.warn('⚠️  Warning: robots.txt may disallow scraping this URL, proceeding anyway...');
    }
    
    // Try Cheerio first (faster)
    try {
      const text = await scrapeWithCheerio(url);
      return {
        text,
        method: 'cheerio',
        url,
      };
    } catch (cheerioError) {
      console.log('Cheerio failed, falling back to Puppeteer...');
      
      // Fall back to Puppeteer for dynamic content
      const text = await scrapeWithPuppeteer(url);
      return {
        text,
        method: 'puppeteer',
        url,
      };
    }
  } catch (error) {
    console.error('URL scraping error:', error);
    throw new Error(`Failed to scrape URL: ${error.message}`);
  }
}

module.exports = {
  scrapeURL,
  checkRobotsTxt,
};
