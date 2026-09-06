import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateImageSchema } from '../validators/image.validator.js';
import { generateImage } from '../services/aiProvider.service.js';
import { uploadGeneratedImage, deleteStoredImage } from '../services/storage.service.js';

// POST /api/images/generate
export const generate = asyncHandler(async (req, res) => {
  const parsed = generateImageSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.errors[0].message, parsed.error.flatten());
  }
  const { prompt, negativePrompt, style, aspectRatio, numImages, seed } = parsed.data;
  const userId = req.user.id;

  // Log the attempt up front so we have a record even if generation fails.
  const { data: logRow } = await supabaseAdmin
    .from('generation_logs')
    .insert({ user_id: userId, prompt, provider: process.env.AI_PROVIDER || 'pollinations', status: 'pending' })
    .select('id')
    .single();

  const results = [];
  const errors = [];

  for (let i = 0; i < numImages; i += 1) {
    try {
      const { buffer, seed: usedSeed, model } = await generateImage({
        prompt,
        negativePrompt,
        style,
        aspectRatio,
        seed: seed !== undefined ? seed + i : undefined,
      });

      const { path, publicUrl } = await uploadGeneratedImage({ userId, buffer });

      const { data: imageRow, error: insertError } = await supabaseAdmin
        .from('generated_images')
        .insert({
          user_id: userId,
          prompt,
          negative_prompt: negativePrompt || null,
          image_url: publicUrl,
          storage_path: path,
          style,
          aspect_ratio: aspectRatio,
          model,
          seed: usedSeed,
        })
        .select('*')
        .single();

      if (insertError) throw insertError;
      results.push(imageRow);
    } catch (err) {
      errors.push(err.message || 'Unknown error');
    }
  }

  if (logRow) {
    await supabaseAdmin
      .from('generation_logs')
      .update({ status: results.length > 0 ? 'success' : 'failed' })
      .eq('id', logRow.id);
  }

  if (results.length === 0) {
    throw new ApiError(502, errors[0] || 'Image generation failed. Please try again.');
  }

  res.status(201).json({
    success: true,
    images: results,
    partialFailures: errors.length > 0 ? errors.length : undefined,
  });
});

// GET /api/images?search=&style=&favoritesOnly=&sort=&page=&limit=
export const listImages = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    search = '', style, favoritesOnly, sort = 'newest', page = 1, limit = 20,
  } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 20));
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('generated_images')
    .select('*, favorites!left(id, user_id)', { count: 'exact' })
    .eq('user_id', userId);

  if (search) query = query.ilike('prompt', `%${search}%`);
  if (style) query = query.eq('style', style);

  query = query.order('created_at', { ascending: sort === 'oldest' });
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new ApiError(500, 'Could not load your images.');

  let images = data.map((row) => ({
    ...row,
    is_favorite: row.favorites?.some((f) => f.user_id === userId) ?? false,
    favorites: undefined,
  }));

  if (favoritesOnly === 'true') {
    images = images.filter((img) => img.is_favorite);
  }

  res.json({
    success: true,
    images,
    pagination: { page: pageNum, limit: pageSize, total: count || 0, totalPages: Math.ceil((count || 0) / pageSize) },
  });
});

// GET /api/images/:id
export const getImage = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('generated_images')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error || !data) throw new ApiError(404, 'Image not found.');
  res.json({ success: true, image: data });
});

// DELETE /api/images/:id
export const deleteImage = asyncHandler(async (req, res) => {
  const { data: image, error } = await supabaseAdmin
    .from('generated_images')
    .select('storage_path, user_id')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error || !image) throw new ApiError(404, 'Image not found.');
  if (image.user_id !== req.user.id) throw new ApiError(403, 'You do not have permission to delete this image.');

  await supabaseAdmin.from('generated_images').delete().eq('id', req.params.id);
  await deleteStoredImage(image.storage_path);

  res.json({ success: true, message: 'Image deleted.' });
});

// POST /api/images/:id/favorite
export const addFavorite = asyncHandler(async (req, res) => {
  const imageId = req.params.id;
  const { data: image } = await supabaseAdmin
    .from('generated_images')
    .select('id, user_id')
    .eq('id', imageId)
    .maybeSingle();

  if (!image || image.user_id !== req.user.id) {
    throw new ApiError(404, 'Image not found.');
  }

  const { error } = await supabaseAdmin
    .from('favorites')
    .insert({ user_id: req.user.id, image_id: imageId });

  if (error && error.code !== '23505') { // ignore unique-violation (already favorited)
    throw new ApiError(500, 'Could not add favorite.');
  }

  res.status(201).json({ success: true, message: 'Added to favorites.' });
});

// DELETE /api/images/:id/favorite
export const removeFavorite = asyncHandler(async (req, res) => {
  await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('user_id', req.user.id)
    .eq('image_id', req.params.id);

  res.json({ success: true, message: 'Removed from favorites.' });
});

// GET /api/prompts - distinct prompt history with the most recent image per prompt
export const getPromptHistory = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('generated_images')
    .select('id, prompt, style, aspect_ratio, image_url, created_at')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw new ApiError(500, 'Could not load prompt history.');

  const seen = new Set();
  const history = [];
  for (const row of data) {
    if (!seen.has(row.prompt)) {
      seen.add(row.prompt);
      history.push(row);
    }
  }

  res.json({ success: true, history });
});
