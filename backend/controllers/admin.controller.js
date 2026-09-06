import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  const [
    { count: totalUsers },
    { count: totalImages },
    { data: recentUsers },
    { data: recentImages },
    { data: allImagesForStyle },
    { data: imagesLast30Days },
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('generated_images').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(10),
    supabaseAdmin.from('generated_images').select('id, prompt, user_id, style, created_at').order('created_at', { ascending: false }).limit(10),
    supabaseAdmin.from('generated_images').select('style'),
    supabaseAdmin.from('generated_images').select('created_at').gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
  ]);

  const styleCounts = {};
  for (const row of allImagesForStyle || []) {
    styleCounts[row.style] = (styleCounts[row.style] || 0) + 1;
  }
  const popularStyles = Object.entries(styleCounts)
    .map(([style, count]) => ({ style, count }))
    .sort((a, b) => b.count - a.count);

  const dailyCounts = {};
  for (const row of imagesLast30Days || []) {
    const day = row.created_at.slice(0, 10);
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  }
  const dailyGenerations = Object.entries(dailyCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const today = new Date().toISOString().slice(0, 10);

  res.json({
    success: true,
    stats: {
      totalUsers: totalUsers || 0,
      totalImages: totalImages || 0,
      todayGenerations: dailyCounts[today] || 0,
      popularStyles,
      dailyGenerations,
      recentUsers,
      recentImages,
    },
  });
});
