import axios from 'axios';
import { ApiError } from '../utils/ApiError.js';

/**
 * AI Provider Service
 * -------------------
 * This is the ONLY file that knows how to talk to a specific text-to-image
 * API. Every provider implements the same shape:
 *
 *   generate({ prompt, negativePrompt, style, aspectRatio, seed }) -> Buffer
 *
 * To switch providers, set AI_PROVIDER in .env and (if needed) implement a
 * new branch below. Nothing outside this file needs to change.
 */

const STYLE_PROMPT_SUFFIX = {
  realistic: 'photorealistic, ultra detailed, natural lighting',
  cinematic: 'cinematic lighting, dramatic composition, film still',
  anime: 'anime style, vibrant, studio quality illustration',
  'digital-art': 'digital art, trending on artstation, sharp detail',
  fantasy: 'epic fantasy art, intricate detail, magical atmosphere',
  '3d': '3d render, octane render, studio lighting',
  illustration: 'digital illustration, clean line art, vibrant colors',
  watercolor: 'watercolor painting, soft edges, paper texture',
  minimalist: 'minimalist, clean composition, negative space',
};

const ASPECT_TO_SIZE = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1344, height: 768 },
  '9:16': { width: 768, height: 1344 },
  '4:3': { width: 1152, height: 896 },
  '3:4': { width: 896, height: 1152 },
};

function buildFinalPrompt(prompt, style) {
  const suffix = STYLE_PROMPT_SUFFIX[style] || '';
  return suffix ? `${prompt}, ${suffix}` : prompt;
}

async function generateWithPollinations({ prompt, negativePrompt, style, aspectRatio, seed }) {
  const { width, height } = ASPECT_TO_SIZE[aspectRatio] || ASPECT_TO_SIZE['1:1'];
  const finalPrompt = buildFinalPrompt(prompt, style);
  const encodedPrompt = encodeURIComponent(finalPrompt);
  const resolvedSeed = Number.isInteger(seed) ? seed : Math.floor(Math.random() * 1_000_000);

  // Pollinations.ai — free, keyless, currently live text-to-image endpoint.
  // https://image.pollinations.ai/prompt/{prompt}
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

  try {
    const response = await axios.get(url, {
      params: {
        width,
        height,
        seed: resolvedSeed,
        nologo: true,
        ...(negativePrompt ? { negative: negativePrompt } : {}),
        model: 'flux',
      },
      responseType: 'arraybuffer',
      timeout: 60_000,
      validateStatus: (status) => status === 200,
    });

    return { buffer: Buffer.from(response.data), seed: resolvedSeed, model: 'pollinations-flux' };
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      throw new ApiError(504, 'Image generation timed out. Please try again.');
    }
    if (err.response?.status === 429) {
      throw new ApiError(429, 'The AI provider is rate-limiting requests. Please wait and try again.');
    }
    throw new ApiError(502, 'The AI image provider failed to generate an image. Please try again.');
  }
}

async function generateWithHuggingFace({ prompt, style }) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, 'Hugging Face provider selected but HUGGINGFACE_API_KEY is not set.');
  }
  const finalPrompt = buildFinalPrompt(prompt, style);

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
      { inputs: finalPrompt },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        responseType: 'arraybuffer',
        timeout: 60_000,
      }
    );
    return { buffer: Buffer.from(response.data), seed: null, model: 'huggingface-flux-schnell' };
  } catch (err) {
    if (err.response?.status === 503) {
      throw new ApiError(503, 'The model is warming up on Hugging Face. Please try again in ~20 seconds.');
    }
    throw new ApiError(502, 'The AI image provider failed to generate an image. Please try again.');
  }
}

async function generateWithStability({ prompt, negativePrompt, aspectRatio }) {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, 'Stability provider selected but STABILITY_API_KEY is not set.');
  }

  try {
    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      (() => {
        const form = new FormData();
        form.append('prompt', prompt);
        if (negativePrompt) form.append('negative_prompt', negativePrompt);
        form.append('aspect_ratio', aspectRatio);
        form.append('output_format', 'png');
        return form;
      })(),
      {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: 'image/*' },
        responseType: 'arraybuffer',
        timeout: 60_000,
      }
    );
    return { buffer: Buffer.from(response.data), seed: null, model: 'stability-core' };
  } catch (err) {
    throw new ApiError(502, 'The AI image provider failed to generate an image. Please try again.');
  }
}

export async function generateImage(params) {
  const provider = process.env.AI_PROVIDER || 'pollinations';

  switch (provider) {
    case 'pollinations':
      return generateWithPollinations(params);
    case 'huggingface':
      return generateWithHuggingFace(params);
    case 'stability':
      return generateWithStability(params);
    default:
      throw new ApiError(500, `Unknown AI_PROVIDER "${provider}" configured on the server.`);
  }
}
