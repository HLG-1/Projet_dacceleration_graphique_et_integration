import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // LLM Configuration
  llm: {
    provider: process.env.LLM_PROVIDER || 'groq',
    model: process.env.LLM_MODEL || 'llama-3.1-70b-versatile',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
  },
  
  // TTS Configuration
  tts: {
    provider: process.env.TTS_PROVIDER || 'speechify',
    voice: process.env.TTS_VOICE || 'henry',
    speechifyApiKey: process.env.SPEECHIFY_API_KEY,
    hfApiKey: process.env.HF_API_KEY,
  },
  
  // Rate Limiting
  rateLimit: {
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 10,
    timeoutSeconds: parseInt(process.env.TIMEOUT_SECONDS) || 60,
  },
  
  // APIs
  googleBooksApiKey: process.env.GOOGLE_BOOKS_API_KEY || '',
  
  // Debug
  debug: process.env.DEBUG === 'true',
};

// Validation
export function validateConfig() {
  const errors = [];
  
  if (config.llm.provider === 'anthropic' && !config.llm.anthropicApiKey) {
    errors.push('ANTHROPIC_API_KEY is required when using anthropic provider');
  }
  
  if (config.llm.provider === 'openai' && !config.llm.openaiApiKey) {
    errors.push('OPENAI_API_KEY is required when using openai provider');
  }
  
  if (config.llm.provider === 'groq' && !config.llm.groqApiKey) {
    errors.push('GROQ_API_KEY is required when using groq provider');
  }
  
  if (config.tts.provider === 'openai' && !config.llm.openaiApiKey) {
    errors.push('OPENAI_API_KEY is required for OpenAI TTS');
  }
  
  if (config.tts.provider === 'speechify' && !config.tts.speechifyApiKey) {
    errors.push('SPEECHIFY_API_KEY is required for Speechify TTS');
  }
  
  if (config.tts.provider === 'huggingface' && !config.tts.hfApiKey) {
    errors.push('HF_API_KEY is required for Hugging Face TTS');
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    return false;
  }
  
  return true;
}