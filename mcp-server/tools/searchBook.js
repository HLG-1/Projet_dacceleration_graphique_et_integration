import axios from 'axios';
import { config } from '../config.js';

/**
 * Search for a book using Open Library API (primary) and Google Books API (fallback)
 * @param {string} title - The title of the book to search for
 * @returns {Promise<Object>} Book information including title, authors, description, and cover images
 */
export async function searchBook(title) {
  try {
    console.log(` Searching for book: "${title}"`);
    
    // Clean the title
    const cleanTitle = title.trim();
    
    if (!cleanTitle) {
      throw new Error('Book title cannot be empty');
    }
    
    // Try Open Library API first (no API key required)
    try {
      const openLibraryUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanTitle)}&limit=1&fields=key,title,author_name,first_publish_year,cover_i,edition_count,has_fulltext,isbn,language,publisher,subject`;
      
      const openLibraryResponse = await axios.get(openLibraryUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'BookAnalyzerMCP/1.0',
        },
      });
      
      if (openLibraryResponse.data.docs && openLibraryResponse.data.docs.length > 0) {
        const book = openLibraryResponse.data.docs[0];
        
        const result = {
          success: true,
          title: book.title || title,
          authors: book.author_name || ['Unknown'],
          publishedDate: book.first_publish_year?.toString() || 'Unknown',
          description: `This is "${book.title}" by ${book.author_name?.join(', ') || 'Unknown Author'}. Published in ${book.first_publish_year || 'Unknown'}.`,
          pageCount: book.edition_count || 'Unknown',
          categories: book.subject?.slice(0, 5) || [],
          averageRating: 'No rating',
          language: book.language?.[0] || 'en',
          previewLink: book.key ? `https://openlibrary.org${book.key}` : '',
          infoLink: book.key ? `https://openlibrary.org${book.key}` : '',
          thumbnail: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : 'https://via.placeholder.com/128x192?text=No+Cover',
          isbn: book.isbn?.[0] || '',
        };
        
        console.log(`Found via Open Library: "${result.title}" by ${result.authors.join(', ')}`);
        return result;
      }
    } catch (openLibraryError) {
      console.log('Open Library API failed, trying Google Books...');
    }

    // Fallback to Google Books API
    const baseUrl = 'https://www.googleapis.com/books/v1/volumes';
    const params = new URLSearchParams({
      q: cleanTitle,
      maxResults: 5,
      orderBy: 'relevance',
      printType: 'books',
      // langRestrict: 'en', // Removed to allow all languages
    });
    
    if (config.googleBooksApiKey) {
      params.append('key', config.googleBooksApiKey);
    }
    
    const url = `${baseUrl}?${params.toString()}`;
    
    // Make API request
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'BookAnalyzerMCP/1.0',
      },
    });
    
    if (!response.data.items || response.data.items.length === 0) {
      return {
        success: false,
        error: `No book found with title: "${title}" in either Open Library or Google Books APIs`,
        title: title,
      };
    }
    
    // Extract book information
    const book = response.data.items[0];
    const volumeInfo = book.volumeInfo;
    
    const result = {
      success: true,
      title: volumeInfo.title || title,
      authors: volumeInfo.authors || ['Unknown'],
      publishedDate: volumeInfo.publishedDate || 'Unknown',
      description: volumeInfo.description || 'No description available',
      pageCount: volumeInfo.pageCount || 'Unknown',
      categories: volumeInfo.categories || [],
      averageRating: volumeInfo.averageRating || 'No rating',
      language: volumeInfo.language || 'en',
      previewLink: volumeInfo.previewLink || '',
      infoLink: volumeInfo.infoLink || '',
      thumbnail: volumeInfo.imageLinks?.thumbnail || '',
      isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || '',
    };
    
    console.log(`Found: "${result.title}" by ${result.authors.join(', ')}`);
    
    return result;
    
  } catch (error) {
    console.error('Error in searchBook:', error.message);
    
    if (error.response) {
      return {
        success: false,
        error: `API error: ${error.response.status} - ${error.response.statusText}`,
        title: title,
      };
    }
    
    return {
      success: false,
      error: error.message,
      title: title,
    };
  }
}

// Tool definition for MCP
export const searchBookTool = {
  name: 'searchBook',
  description: 'Search for a book by title using Open Library API (primary) and Google Books API (fallback). Returns real book information including title, authors, description, and cover images.',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'The title of the book to search for',
      },
    },
    required: ['title'],
  },
  handler: searchBook,
};