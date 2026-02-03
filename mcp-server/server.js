import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config.js';
import { BookAnalyzerAgent } from './agent.js';
import { tools, getToolDefinitions } from './tools/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate configuration
if (!validateConfig()) {
  console.error('\nPlease configure your environment variables in .env file');
  console.error('Copy .env.example to .env and add your API keys\n');
  process.exit(1);
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rate limiting (simple in-memory implementation)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(identifier) {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier) || [];
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= config.rateLimit.maxRequestsPerMinute) {
    return false;
  }
  
  recentRequests.push(now);
  requestCounts.set(identifier, recentRequests);
  return true;
}

// Initialize agent
const agent = new BookAnalyzerAgent();

// ========================================
// ROUTES
// ========================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    config: {
      llmProvider: config.llm.provider,
      llmModel: config.llm.model,
      ttsProvider: config.tts.provider,
    },
  });
});

/**
 * Get available tools
 */
app.get('/tools', (req, res) => {
  res.json({
    success: true,
    tools: getToolDefinitions(),
  });
});

/**
 * Analyze a book - Main endpoint for n8n
 * POST /analyze
 * Body: { "bookTitle": "Atomic Habits" }
 */
app.post('/analyze', async (req, res) => {
  try {
    const { bookTitle } = req.body;
    
    // Validation
    if (!bookTitle) {
      return res.status(400).json({
        success: false,
        error: 'bookTitle is required',
      });
    }
    
    if (typeof bookTitle !== 'string' || bookTitle.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'bookTitle must be a non-empty string',
      });
    }
    
    if (bookTitle.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'bookTitle must be less than 200 characters',
      });
    }
    
    // Rate limiting
    const clientId = req.ip || 'unknown';
    if (!checkRateLimit(clientId)) {
      return res.status(429).json({
        success: false,
        error: `Rate limit exceeded. Maximum ${config.rateLimit.maxRequestsPerMinute} requests per minute.`,
      });
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📖 New book analysis request: "${bookTitle}"`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Perform analysis with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Analysis timeout')), config.rateLimit.timeoutSeconds * 1000)
    );
    
    const analysisPromise = agent.analyzeBook(bookTitle);
    
    const result = await Promise.race([analysisPromise, timeoutPromise]);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    // Return result
    res.json(result);
    
  } catch (error) {
    console.error('Error in /analyze endpoint:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * Execute a specific tool
 * POST /tool/:toolName
 * Body: tool-specific parameters
 */
app.post('/tool/:toolName', async (req, res) => {
  try {
    const { toolName } = req.params;
    const params = req.body;
    
    // Find the tool
    const tool = tools.find(t => t.name === toolName);
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: `Tool '${toolName}' not found`,
        availableTools: tools.map(t => t.name),
      });
    }
    
    console.log(`🔧 Executing tool: ${toolName}`);
    
    // Execute the tool
    const result = await tool.handler(...Object.values(params));
    
    res.json(result);
    
  } catch (error) {
    console.error(`Error executing tool ${req.params.toolName}:`, error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * Download audio file
 * GET /audio/:filename
 */
app.get('/audio/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security: prevent directory traversal
    const safeName = path.basename(filename);
    const audioPath = path.join(__dirname, 'output', 'audio', safeName);
    
    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({
        success: false,
        error: 'Audio file not found',
      });
    }
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    
    const fileStream = fs.createReadStream(audioPath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error serving audio file:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get base64 encoded audio
 * GET /audio/:filename/base64
 */
app.get('/audio/:filename/base64', (req, res) => {
  try {
    const { filename } = req.params;
    
    const safeName = path.basename(filename);
    const audioPath = path.join(__dirname, 'output', 'audio', safeName);
    
    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({
        success: false,
        error: 'Audio file not found',
      });
    }
    
    const audioBuffer = fs.readFileSync(audioPath);
    const base64Audio = audioBuffer.toString('base64');
    
    res.json({
      success: true,
      filename: safeName,
      mimeType: 'audio/mpeg',
      base64: base64Audio,
    });
    
  } catch (error) {
    console.error('Error encoding audio file:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /tools',
      'POST /analyze',
      'POST /tool/:toolName',
      'GET /audio/:filename',
      'GET /audio/:filename/base64',
    ],
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('Book Analyzer MCP Server');
  console.log('='.repeat(60));
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`LLM Provider: ${config.llm.provider} (${config.llm.model})`);
  console.log(`TTS Provider: ${config.tts.provider}`);
  console.log(`Timeout: ${config.rateLimit.timeoutSeconds}s`);
  console.log(`Rate limit: ${config.rateLimit.maxRequestsPerMinute} req/min`);
  console.log('='.repeat(60));
  console.log('\nAvailable endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /tools');
  console.log('  POST /analyze');
  console.log('  POST /tool/:toolName');
  console.log('  GET  /audio/:filename');
  console.log('\nReady to analyze books!\n');
});

export default app;