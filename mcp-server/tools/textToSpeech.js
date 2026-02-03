import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';
import axios from 'axios';
import { config } from '../config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert text to speech audio file
 * @param {string} text - The text to convert to speech
 * @param {string} filename - Optional filename for the output (without extension)
 * @returns {Promise<Object>} Information about the generated audio file
 */
export async function textToSpeech(text, filename = null) {
  try {
    console.log(`Converting text to speech (${text.length} chars) with ${config.tts.provider}`);
    
    if (!text || text.trim().length === 0) {
      throw new Error('Text content is empty');
    }
    
    // Truncate if text is too long
    const maxChars = 4000;
    let textToConvert = text;
    
    if (text.length > maxChars) {
      console.warn(`Text truncated from ${text.length} to ${maxChars} characters`);
      textToConvert = text.substring(0, maxChars) + '...';
    }
    
    // Generate filename
    const outputFilename = filename 
      ? `${filename}.mp3` 
      : `summary_${Date.now()}.mp3`;
    
    // Create output directory
    const outputDir = path.join(__dirname, '..', 'output', 'audio');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, outputFilename);
    
    // Use configured TTS provider
    if (config.tts.provider === 'openai') {
      await generateWithOpenAI(textToConvert, outputPath);
    } else if (config.tts.provider === 'speechify') {
      await generateWithSpeechify(textToConvert, outputPath);
    } else if (config.tts.provider === 'huggingface') {
      await generateWithHuggingFace(textToConvert, outputPath);
    } else {
      throw new Error(`Unsupported TTS provider: ${config.tts.provider}`);
    }
    
    // Get file stats
    const stats = fs.statSync(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    
    console.log(`Audio generated: ${outputFilename} (${fileSizeKB} KB)`);
    
    return {
      success: true,
      filename: outputFilename,
      path: outputPath,
      sizeKB: parseFloat(fileSizeKB),
      duration: estimateDuration(textToConvert),
      voice: config.tts.voice,
      provider: config.tts.provider,
    };
    
  } catch (error) {
    console.error('Error in textToSpeech:', error.message);
    
    return {
      success: false,
      error: error.message,
      filename: null,
      path: null,
    };
  }
}

/**
 * Generate audio using OpenAI TTS
 */
async function generateWithOpenAI(text, outputPath) {
  const openai = new OpenAI({
    apiKey: config.llm.openaiApiKey,
  });
  
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: config.tts.voice,
    input: text,
    speed: 1.0,
  });
  
  const buffer = Buffer.from(await mp3.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

/**
 * Generate audio using Speechify API
 * Documentation: https://docs.speechify.com/
 */
async function generateWithSpeechify(text, outputPath) {
  try {
    // Speechify API endpoint
    const response = await axios.post(
      'https://api.sws.speechify.com/v1/audio/speech',
      {
        input: text,
        voice_id: config.tts.voice || 'henry', // henry, mia, george, etc.
        audio_format: 'mp3',
      },
      {
        headers: {
          'Authorization': `Bearer ${config.tts.speechifyApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Speechify returns JSON with base64 audio data
    const audioData = response.data;
    if (audioData && audioData.audio_data) {
      // Decode base64 audio data
      const audioBuffer = Buffer.from(audioData.audio_data, 'base64');
      fs.writeFileSync(outputPath, audioBuffer);
    } else {
      throw new Error('Invalid response format from Speechify API');
    }
  } catch (error) {
    console.error('Speechify API error:', error.response?.data || error.message);
    throw new Error(`Speechify TTS failed: ${error.message}`);
  }
}

/**
 * Generate audio using Hugging Face Inference API (FREE!)
 * Model: facebook/mms-tts-eng (or other TTS models)
 */
async function generateWithHuggingFace(text, outputPath) {
  try {
    // Use a working TTS model from Hugging Face
    const response = await axios.post(
      `https://router.huggingface.co/facebook/mms-tts-eng`,
      {
        inputs: text,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.tts.hfApiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer'
      }
    );
    
    // Save the audio file
    fs.writeFileSync(outputPath, response.data);
  } catch (error) {
    console.error('Hugging Face API error:', error.message);
    throw new Error(`Hugging Face TTS failed: ${error.message}`);
  }
}

/**
 * Estimate audio duration based on text length
 * Average speaking rate: ~150 words per minute
 */
function estimateDuration(text) {
  const words = text.split(/\s+/).length;
  const minutes = words / 150;
  const seconds = Math.round(minutes * 60);
  return `~${seconds}s`;
}

/**
 * Get the base64 encoded audio file
 */
export async function getAudioBase64(filepath) {
  try {
    const audioBuffer = fs.readFileSync(filepath);
    const base64Audio = audioBuffer.toString('base64');
    return {
      success: true,
      base64: base64Audio,
      mimeType: 'audio/mpeg',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Tool definition for MCP
export const textToSpeechTool = {
  name: 'textToSpeech',
  description: 'Convert text to speech and generate an MP3 audio file. Supports OpenAI, Speechify, and Hugging Face TTS.',
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'The text to convert to speech (max 4000 characters)',
      },
      filename: {
        type: 'string',
        description: 'Optional: Custom filename for the output (without extension)',
      },
    },
    required: ['text'],
  },
  handler: textToSpeech,
};