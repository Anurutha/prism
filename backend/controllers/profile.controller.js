import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [{ count: totalImages }, { count: totalFavorites }, { data: promptRows }] = await Promise.all([
    supabaseAdmin.from('generated_images').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabaseAdmin.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabaseAdmin.from('generated_images').select('prompt').eq('user_id', userId),
  ]);

  const totalPrompts = new Set((promptRows || []).map((r) => r.prompt)).size;

  res.json({
    success: true,
    profile: req.user,
    stats: {
      totalImages: totalImages || 0,
      totalFavorites: totalFavorites || 0,
      totalPrompts,
    },
  });
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
});

export const updateProfile = asyncHandler(async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0].message);

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(parsed.data)
    .eq('id', req.user.id)
    .select('id, name, email, role, created_at')
    .single();

  if (error) throw new ApiError(500, 'Could not update your profile.');
  res.json({ success: true, profile: data });
});
