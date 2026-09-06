import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { supabaseAdmin } from '../config/supabase.js';

// Verifies the JWT issued at login/register, then loads the profile so
// downstream handlers can trust req.user (id, role) without re-querying.
export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please log in.');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Your session has expired. Please log in again.');
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email, role')
    .eq('id', payload.sub)
    .single();

  if (error || !profile) {
    throw new ApiError(401, 'Account not found. Please log in again.');
  }

  req.user = profile;
  next();
});

// Restricts a route to admins. Must run after requireAuth.
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    throw new ApiError(403, 'You do not have permission to access this resource.');
  }
  next();
};
