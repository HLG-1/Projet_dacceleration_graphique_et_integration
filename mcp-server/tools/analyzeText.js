import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { config } from '../config.js';

/**
 * Analyze text using LLM to extract summary and key ideas
 * @param {string} text - The text to analyze
 * @param {string} bookTitle - The title of the book (for context)
 * @returns {Promise<Object>} Analysis results with summary and 7 key ideas
 */
export async function analyzeText(text, bookTitle = '') {
  try {
    console.log(` Analyzing text (${text.length} chars) for book: "${bookTitle}"`);
    
    if (!text || text.trim().length === 0) {
      throw new Error('Text content is empty');
    }
    
    // Truncate text if too long (to avoid token limits)
    const maxChars = 50000;
    const truncatedText = text.length > maxChars 
      ? text.substring(0, maxChars) + '...[truncated]'
      : text;
    
    // Create the prompt
    const prompt = `You are an expert book analyst. Analyze the following content ${bookTitle ? `from the book "${bookTitle}"` : ''} and provide:

1. A comprehensive summary (2-3 paragraphs, 150-250 words)
2. Exactly 7 key ideas or takeaways from the content (each idea should be 1-2 sentences)

Content to analyze:
${truncatedText}

Please respond in the following JSON format:
{
  "summary": "Your comprehensive summary here...",
  "keyIdeas": [
    "Key idea 1",
    "Key idea 2",
    "Key idea 3",
    "Key idea 4",
    "Key idea 5",
    "Key idea 6",
    "Key idea 7"
  ]
}

IMPORTANT: 
- Provide exactly 7 key ideas, no more, no less
- Make the summary detailed and informative
- Base your analysis only on the provided content
- Return ONLY valid JSON, no other text`;

    let analysisResult;
    
    // Use configured LLM provider
    if (config.llm.provider === 'anthropic') {
      analysisResult = await analyzeWithAnthropic(prompt);
    } else if (config.llm.provider === 'openai') {
      analysisResult = await analyzeWithOpenAI(prompt);
    } else if (config.llm.provider === 'groq') {
      analysisResult = await analyzeWithGroq(prompt);
    } else {
      throw new Error(`Unsupported LLM provider: ${config.llm.provider}`);
    }
    
    // Parse and validate the response
    let parsed;
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(analysisResult);
      }
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON:', analysisResult);
      throw new Error('LLM did not return valid JSON');
    }
    
    // Validate the structure
    if (!parsed.summary || !Array.isArray(parsed.keyIdeas)) {
      throw new Error('Invalid response structure from LLM');
    }
    
    if (parsed.keyIdeas.length !== 7) {
      console.warn(`Expected 7 key ideas, got ${parsed.keyIdeas.length}`);
      // Adjust to exactly 7
      if (parsed.keyIdeas.length < 7) {
        while (parsed.keyIdeas.length < 7) {
          parsed.keyIdeas.push('Additional insight from the content');
        }
      } else {
        parsed.keyIdeas = parsed.keyIdeas.slice(0, 7);
      }
    }
    
    console.log(`Analysis complete: ${parsed.summary.length} chars summary, ${parsed.keyIdeas.length} key ideas`);
    
    return {
      success: true,
      summary: parsed.summary,
      keyIdeas: parsed.keyIdeas,
      bookTitle: bookTitle,
    };
    
  } catch (error) {
    console.error('Error in analyzeText:', error.message);
    
    return {
      success: false,
      error: error.message,
      summary: '',
      keyIdeas: [],
    };
  }
}

/**
 * Analyze text using Anthropic Claude
 */
async function analyzeWithAnthropic(prompt) {
  const anthropic = new Anthropic({
    apiKey: config.llm.anthropicApiKey,
  });
  
  const message = await anthropic.messages.create({
    model: config.llm.model,
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });
  
  return message.content[0].text;
}

/**
 * Analyze text using OpenAI GPT
 */
async function analyzeWithOpenAI(prompt) {
  const openai = new OpenAI({
    apiKey: config.llm.openaiApiKey,
  });
  
  const completion = await openai.chat.completions.create({
    model: config.llm.model,
    messages: [{
      role: 'system',
      content: 'You are an expert book analyst. Always respond with valid JSON.',
    }, {
      role: 'user',
      content: prompt,
    }],
    temperature: 0.7,
    max_tokens: 2000,
  });
  
  return completion.choices[0].message.content;
}

/**
 * Analyze text using Groq (Fast & Free!)
 */
async function analyzeWithGroq(prompt) {
  const groq = new Groq({
    apiKey: config.llm.groqApiKey,
  });
  
  const completion = await groq.chat.completions.create({
    model: config.llm.model,
    messages: [{
      role: 'system',
      content: 'You are an expert book analyst. Always respond with valid JSON.',
    }, {
      role: 'user',
      content: prompt,
    }],
    temperature: 0.7,
    max_tokens: 2000,
  });
  
  return completion.choices[0].message.content;
}

// Tool definition for MCP
export const analyzeTextTool = {
  name: 'analyzeText',
  description: 'Analyze text content using AI to extract a comprehensive summary and exactly 7 key ideas. Uses configured LLM (Claude or GPT).',
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'The text content to analyze',
      },
      bookTitle: {
        type: 'string',
        description: 'Optional: The title of the book for context',
      },
    },
    required: ['text'],
  },
  handler: analyzeText,
};