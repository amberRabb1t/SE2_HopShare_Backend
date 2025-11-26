import bcrypt from 'bcryptjs';
import { dbState } from '../config/database.js';
import { User } from '../models/User.js';
import { getNextId } from '../utils/helpers.js';

import dotenv from 'dotenv';
dotenv.config();

// Mock data
const users = [
  // Default demo users (passwords in plaintext here; will be hashed once at startup)
  { UserID: 1, Name: 'Alice', PhoneNumber: 1234567890, PassengerRating: 4.5, DriverRating: 4.8, Banned: false, Email: 'alice@example.com', Password: process.env.DUMMY_PASSWORD, IsAdmin: true, Timestamp: Math.floor(Date.now() / 1000) },
  { UserID: 2, Name: 'Bob', PhoneNumber: 1231231234, PassengerRating: 3.9, DriverRating: 4.2, Banned: false, Email: 'bob@example.com', Password: process.env.DUMMY_PASSWORD, IsAdmin: false, Timestamp: Math.floor(Date.now() / 1000) },
  { UserID: 3, Name: 'Charlie', PhoneNumber: 3213214321, PassengerRating: 4.0, DriverRating: 3.8, Banned: false, Email: 'charlie@example.com', Password: process.env.DUMMY_PASSWORD, IsAdmin: false, Timestamp: Math.floor(Date.now() / 1000) }
];

let initialized = false;
async function ensureMockHashed() {
  if (initialized) return;
  for (const u of users) {
    if (!u.Password.startsWith('$2')) {
      u.Password = await bcrypt.hash(u.Password, 10);
    }
  }
  initialized = true;
}

/**
 * Find user by email (DB or mock)
 * @param {string} email
 */
export async function findByEmail(email) {
  const { useMockData } = dbState();
  if (useMockData) {
    await ensureMockHashed();
    return users.find(u => u.Email.toLowerCase() === String(email).toLowerCase()) || null;
  }
  return User.findOne({ Email: email });
}

/**
 * List users (by Name contains if provided)
 * @param {string} [name]
 */
export async function list(name) {
  const { useMockData } = dbState();
  if (useMockData) {
    if (!name) return users;
    const q = name.toLowerCase();
    return users.filter(u => u.Name.toLowerCase().includes(q));
  }
  const filter = name ? { Name: new RegExp(name, 'i') } : {};
  return User.find(filter);
}

/**
 * Create a new user
 * @param {object} payload
 */
export async function create(payload) {
  const { useMockData } = dbState();
  const toCreate = { ...payload, Timestamp: payload.Timestamp || Math.floor(Date.now() / 1000) };
  if (!toCreate.Password.startsWith('$2')) {
    toCreate.Password = await bcrypt.hash(toCreate.Password, 10);
  }

  if (useMockData) {
    toCreate.UserID = toCreate.UserID || getNextId(users, 'UserID');
    users.push(toCreate);
    return toCreate;
  }
  // ensure unique UserID also in DB for parity (optional)
  if (!toCreate.UserID) {
    const last = await User.findOne().sort('-UserID').select('UserID');
    toCreate.UserID = last ? last.UserID + 1 : 1;
  }
  return User.create(toCreate);
}

/**
 * Get user by ID
 * @param {number} id
 */
export async function get(id) {
  const { useMockData } = dbState();
  if (useMockData) {
    return users.find(u => u.UserID === Number(id)) || null;
  }
  return User.findOne({ UserID: id });
}

/**
 * Update user
 * @param {number} id
 * @param {object} payload
 */
export async function update(id, payload) {
  const { useMockData } = dbState();
  if (payload.Password && !payload.Password.startsWith('$2')) {
    payload.Password = await bcrypt.hash(payload.Password, 10);
  }
  if (useMockData) {
    const idx = users.findIndex(u => u.UserID === Number(id));
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...payload };
    return users[idx];
  }
  return User.findOneAndUpdate({ UserID: id }, payload, { new: true });
}

/**
 * Delete user
 * @param {number} id
 */
export async function remove(id) {
  const { useMockData } = dbState();
  if (useMockData) {
    const idx = users.findIndex(u => u.UserID === Number(id));
    if (idx === -1) return false;
    users.splice(idx, 1);
    return true;
  }
  const res = await User.deleteOne({ UserID: id });
  return res.deletedCount > 0;
}

// Expose mock for cross-services linking (read-only)
export function __mock() {
  return users;
}