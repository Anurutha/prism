import { z } from 'zod';

export const STYLES = [
  'realistic', 'cinematic', 'anime', 'digital-art', 'fantasy',
  '3d', 'illustration', 'watercolor', 'minimalist',
];

export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];

// A small denylist for the most obviously unsafe prompt content. This is a
// defense-in-depth layer, not a replacement for the provider's own safety
// filtering (Pollinations applies its own moderation upstream).
const BLOCKED_TERMS = [
  'child sexual', 'csam', 'underage nude', 'loli porn',
];

export const generateImageSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(3, 'Prompt must be at least 3 characters')
    .max(1000, 'Prompt must be under 1000 characters')
    .refine(
      (val) => !BLOCKED_TERMS.some((term) => val.toLowerCase().includes(term)),
      'This prompt violates our content policy.'
    ),
  negativePrompt: z.string().trim().max(500).optional().default(''),
  style: z.enum(STYLES).optional().default('realistic'),
  aspectRatio: z.enum(ASPECT_RATIOS).optional().default('1:1'),
  numImages: z.coerce.number().int().min(1).max(4).optional().default(1),
  seed: z.coerce.number().int().optional(),
});
