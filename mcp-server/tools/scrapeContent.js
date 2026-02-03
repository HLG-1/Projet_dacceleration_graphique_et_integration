import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrape and extract clean text content from a URL
 * @param {string} url - The URL to scrape
 * @returns {Promise<Object>} Scraped content with text and metadata
 */
export async function scrapeContent(url) {
  try {
    console.log(` Scraping content from: ${url}`);
    
    if (!url || !url.startsWith('http')) {
      throw new Error('Invalid URL provided');
    }
    
    // Fetch the webpage
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    
    // Load HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('header').remove();
    $('footer').remove();
    $('aside').remove();
    $('.advertisement').remove();
    $('.ad').remove();
    $('#comments').remove();
    
    // Extract title
    let title = $('h1').first().text().trim();
    if (!title) {
      title = $('title').text().trim();
    }
    
    // Extract main content
    // Try to find the main content area
    let mainContent = '';
    
    // Common content selectors
    const contentSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.content',
      '#content',
      '.post-content',
      '.entry-content',
      '.article-content',
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        mainContent = element.text();
        break;
      }
    }
    
    // Fallback to body if no main content found
    if (!mainContent) {
      mainContent = $('body').text();
    }
    
    // Clean up the text
    const cleanedText = mainContent
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
    
    // Extract metadata
    const metadata = {
      title: title,
      url: url,
      description: $('meta[name="description"]').attr('content') || '',
      author: $('meta[name="author"]').attr('content') || '',
      publishDate: $('meta[property="article:published_time"]').attr('content') || '',
    };
    
    // Count words
    const wordCount = cleanedText.split(/\s+/).length;
    
    console.log(`Scraped ${wordCount} words from ${url}`);
    
    return {
      success: true,
      content: cleanedText,
      metadata: metadata,
      wordCount: wordCount,
      url: url,
    };
    
  } catch (error) {
    console.error('Error in scrapeContent:', error.message);
    
    return {
      success: false,
      error: error.message,
      url: url,
      content: '',
    };
  }
}

// Tool definition for MCP
export const scrapeContentTool = {
  name: 'scrapeContent',
  description: 'Scrape and extract clean text content from a given URL. Removes ads, navigation, and other noise.',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to scrape content from',
      },
    },
    required: ['url'],
  },
  handler: scrapeContent,
};