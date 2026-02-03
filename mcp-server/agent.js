import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { config } from './config.js';
import { tools, toolMap } from './tools/index.js';

/**
 * AI Agent that orchestrates tools to analyze books
 */
export class BookAnalyzerAgent {
  constructor() {
    this.llmClient = this.initializeLLM();
    this.conversationHistory = [];
  }
  
  /**
   * Initialize the LLM client based on configuration
   */
  initializeLLM() {
    if (config.llm.provider === 'anthropic') {
      return new Anthropic({
        apiKey: config.llm.anthropicApiKey,
      });
    } else if (config.llm.provider === 'openai') {
      return new OpenAI({
        apiKey: config.llm.openaiApiKey,
      });
    } else if (config.llm.provider === 'groq') {
      return new Groq({
        apiKey: config.llm.groqApiKey,
      });
    }
    throw new Error(`Unsupported LLM provider: ${config.llm.provider}`);
  }
  
  /**
   * Main method to analyze a book
   * @param {string} bookTitle - The title of the book to analyze
   * @returns {Promise<Object>} Complete analysis results
   */
  async analyzeBook(bookTitle) {
    console.log(`\nStarting book analysis for: "${bookTitle}"\n`);
    
    try {
      // Step 1: Search for the book
      console.log('Step 1: Searching for book information...');
      const bookInfo = await toolMap.searchBook(bookTitle);
      
      if (!bookInfo.success) {
        throw new Error(bookInfo.error || 'Failed to find book');
      }
      
      console.log(`   ✓ Found: "${bookInfo.title}" by ${bookInfo.authors.join(', ')}`);
      
      // Step 2: Get content to analyze
      // We'll use the description from Google Books as our content
      // In a real-world scenario, we might scrape the preview link
      let contentToAnalyze = bookInfo.description;
      
      // If we have a preview link, try to scrape it (optional)
      if (bookInfo.previewLink && contentToAnalyze.length < 500) {
        console.log('Step 2: Attempting to scrape preview content...');
        const scrapedContent = await toolMap.scrapeContent(bookInfo.previewLink);
        
        if (scrapedContent.success && scrapedContent.content.length > contentToAnalyze.length) {
          contentToAnalyze = scrapedContent.content;
          console.log(`   ✓ Scraped ${scrapedContent.wordCount} words`);
        } else {
          console.log('   Using description from book info');
        }
      } else {
        console.log('Step 2: Using book description for analysis');
        console.log(`   ✓ Content length: ${contentToAnalyze.length} characters`);
      }
      
      // Step 3: Analyze the content
      console.log('Step 3: Analyzing content with AI...');
      const analysis = await toolMap.analyzeText(contentToAnalyze, bookInfo.title);
      
      if (!analysis.success) {
        throw new Error(analysis.error || 'Failed to analyze content');
      }
      
      console.log(`   ✓ Summary: ${analysis.summary.substring(0, 100)}...`);
      console.log(`   ✓ Key ideas: ${analysis.keyIdeas.length}`);
      
      // Step 4: Generate audio
      console.log('Step 4: Converting summary to speech...');
      const audioFilename = `${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary`;
      const audio = await toolMap.textToSpeech(analysis.summary, audioFilename);
      
      if (!audio.success) {
        console.warn('   Audio generation failed, continuing without audio');
      } else {
        console.log(`   ✓ Audio: ${audio.filename} (${audio.sizeKB} KB, ${audio.duration})`);
      }
      
      // Compile final result
      const result = {
        success: true,
        bookInfo: {
          title: bookInfo.title,
          authors: bookInfo.authors,
          publishedDate: bookInfo.publishedDate,
          categories: bookInfo.categories,
          pageCount: bookInfo.pageCount,
          isbn: bookInfo.isbn,
          thumbnail: bookInfo.thumbnail,
          infoLink: bookInfo.infoLink,
        },
        analysis: {
          summary: analysis.summary,
          keyIdeas: analysis.keyIdeas,
        },
        audio: audio.success ? {
          filename: audio.filename,
          path: audio.path,
          sizeKB: audio.sizeKB,
          duration: audio.duration,
        } : null,
        metadata: {
          analyzedAt: new Date().toISOString(),
          contentLength: contentToAnalyze.length,
          llmProvider: config.llm.provider,
          llmModel: config.llm.model,
        },
      };
      
      console.log('\nBook analysis complete!\n');
      
      return result;
      
    } catch (error) {
      console.error('\nError during book analysis:', error.message, '\n');
      
      return {
        success: false,
        error: error.message,
        bookTitle: bookTitle,
      };
    }
  }
  
  /**
   * Use LLM with tool calling for more complex analysis
   * This is an advanced version that lets the LLM decide which tools to use
   */
  async analyzeBookWithLLM(bookTitle) {
    console.log(`\n Starting AI-guided book analysis for: "${bookTitle}"\n`);
    
    const systemPrompt = `You are a book analysis assistant. Your goal is to analyze a book and provide:
1. A comprehensive summary (150-250 words)
2. Exactly 7 key ideas or takeaways

You have access to these tools:
- searchBook: Find book information
- scrapeContent: Get content from URLs
- analyzeText: Use AI to analyze text
- textToSpeech: Convert text to audio

Analyze the book "${bookTitle}" step by step.`;

    try {
      if (config.llm.provider === 'anthropic') {
        return await this.analyzeWithAnthropicTools(systemPrompt, bookTitle);
      } else {
        // For OpenAI or others, use the simpler direct approach
        return await this.analyzeBook(bookTitle);
      }
    } catch (error) {
      console.error('Error in AI-guided analysis:', error.message);
      return await this.analyzeBook(bookTitle);
    }
  }
  
  /**
   * Analyze using Anthropic's tool calling
   */
  async analyzeWithAnthropicTools(systemPrompt, bookTitle) {
    const messages = [{
      role: 'user',
      content: `Please analyze the book "${bookTitle}" using the available tools.`,
    }];
    
    const toolDefinitions = tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters,
    }));
    
    let continueLoop = true;
    let iterationCount = 0;
    const maxIterations = 10;
    
    while (continueLoop && iterationCount < maxIterations) {
      iterationCount++;
      
      const response = await this.llmClient.messages.create({
        model: config.llm.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages,
        tools: toolDefinitions,
      });
      
      // Add assistant's response to messages
      messages.push({
        role: 'assistant',
        content: response.content,
      });
      
      // Check if we should continue
      if (response.stop_reason === 'end_turn') {
        continueLoop = false;
        
        // Extract final text response
        const textContent = response.content.find(c => c.type === 'text');
        if (textContent) {
          console.log('Agent response:', textContent.text);
        }
        break;
      }
      
      // Execute any tool calls
      if (response.stop_reason === 'tool_use') {
        const toolResults = [];
        
        for (const content of response.content) {
          if (content.type === 'tool_use') {
            console.log(`🔧 Agent calling tool: ${content.name}`);
            
            const tool = tools.find(t => t.name === content.name);
            if (tool) {
              const result = await tool.handler(...Object.values(content.input));
              toolResults.push({
                type: 'tool_result',
                tool_use_id: content.id,
                content: JSON.stringify(result),
              });
            }
          }
        }
        
        // Add tool results to messages
        messages.push({
          role: 'user',
          content: toolResults,
        });
      }
    }
    
    // Parse the final result from messages
    // This is a simplified version - in production you'd want more robust parsing
    return {
      success: true,
      message: 'Analysis completed by AI agent',
      iterations: iterationCount,
    };
  }
}