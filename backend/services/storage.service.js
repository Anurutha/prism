import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, STORAGE_BUCKET } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

// Uploads a generated image buffer to Supabase Storage under the user's own
// folder (userId/filename) so storage-level RLS policies can key off the
// path, and returns the public URL to store in the database.
export async function uploadGeneratedImage({ userId, buffer, contentType = 'image/png' }) {
  const filename = `${userId}/${uuidv4()}.png`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(filename, buffer, { contentType, upsert: false });

  if (uploadError) {
    throw new ApiError(502, 'Failed to store the generated image. Please try again.');
  }

  const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(filename);

  return { path: filename, publicUrl: data.publicUrl };
}

export async function deleteStoredImage(path) {
  const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) {
    // Non-fatal: the DB row is the source of truth for the user; log and continue.
    console.error('[storage.service] Failed to delete stored image:', path, error.message);
  }
}
