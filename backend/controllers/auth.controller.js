import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function sanitizeProfile(profile) {
  const { password_hash, ...safe } = profile;
  return safe;
}

export const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.errors[0].message, parsed.error.flatten());
  }
  const { name, email, password } = parsed.data;

  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .insert({ name, email, password_hash: passwordHash, role: 'user' })
    .select('id, name, email, role, created_at')
    .single();

  if (error) {
    throw new ApiError(500, 'Could not create your account. Please try again.');
  }

  const token = signToken(profile.id);
  res.status(201).json({ success: true, token, user: profile });
});

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.errors[0].message);
  }
  const { email, password } = parsed.data;

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error || !profile) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const valid = await bcrypt.compare(password, profile.password_hash);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken(profile.id);
  res.json({ success: true, token, user: sanitizeProfile(profile) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
