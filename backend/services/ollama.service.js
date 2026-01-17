// services/ollama.service.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_URL = `${process.env.OLLAMA_BASE_URL}/api/generate`;
const MODEL = process.env.OLLAMA_MODEL || 'llama3:latest';
const TIMEOUT = 300000; // 5 minutes (for slower models)

export async function callOllama(prompt) {
  const response = await axios.post(
    OLLAMA_URL,
    {
      model: MODEL,
      prompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.1, // Faster, more deterministic
        num_predict: 1000, // Limit output length
        num_ctx: 4096 // Sufficient context window
      }
    },
    { timeout: TIMEOUT } // Increased timeout for complex requests
  );

  return response.data?.response; // 🔥 raw string ONLY
}
