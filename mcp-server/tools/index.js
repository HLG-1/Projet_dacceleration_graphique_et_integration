import { searchBookTool } from './searchBook.js';
import { scrapeContentTool } from './scrapeContent.js';
import { analyzeTextTool } from './analyzeText.js';
import { textToSpeechTool } from './textToSpeech.js';

// Export all tools
export const tools = [
  searchBookTool,
  scrapeContentTool,
  analyzeTextTool,
  textToSpeechTool,
];

// Export tool map for easy access
export const toolMap = {
  searchBook: searchBookTool.handler,
  scrapeContent: scrapeContentTool.handler,
  analyzeText: analyzeTextTool.handler,
  textToSpeech: textToSpeechTool.handler,
};

// Get tool by name
export function getTool(name) {
  return tools.find(tool => tool.name === name);
}

// Get all tool definitions (without handlers)
export function getToolDefinitions() {
  return tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));
}