import { dbState } from '../config/database.js';
import { Request } from '../models/Request.js';
import { getNextId } from '../utils/helpers.js';

// Mock data used for testing without a database
const requests = [
  { RequestID: 1, Description: 'Morning commute', Status: false, Start: 'City A', End: 'City D', DateAndTime: 1731600000, Timestamp: 1731400300, UserID: 2 },
  { RequestID: 2, Description: 'Airport drop', Status: false, Start: 'City C', End: 'Airport', DateAndTime: 1731650000, Timestamp: 1731400400, UserID: 3 }
];

/** 
 * List requests with filters
 * @param {object} filters
 * @returns {array}
 */
export async function list(filters = {}) {
  const { useMockData } = dbState();
  if (useMockData) {
    let result = requests;
    if (filters.Start) result = result.filter(r => r.Start.toLowerCase().includes(filters.Start.toLowerCase()));
    if (filters.End) result = result.filter(r => r.End.toLowerCase().includes(filters.End.toLowerCase()));
    if (filters.DateAndTime) result = result.filter(r => r.DateAndTime === Number(filters.DateAndTime));
    if (filters.userID) result = result.filter(r => r.UserID === Number(filters.userID));
    return result;
  }
  const q = {};
  if (filters.Start) q.Start = new RegExp(filters.Start, 'i');
  if (filters.End) q.End = new RegExp(filters.End, 'i');
  if (filters.DateAndTime) q.DateAndTime = Number(filters.DateAndTime);
  if (filters.userID) q.UserID = Number(filters.userID);
  return Request.find(q);
}

/**
 * Create request
 * @param {object} payload
 * @returns {object}
 */
export async function create(payload) {
  const { useMockData } = dbState();
  const toCreate = { ...payload, Timestamp: payload.Timestamp || Math.floor(Date.now() / 1000) };
  if (useMockData) {
    toCreate.RequestID = toCreate.RequestID || getNextId(requests, 'RequestID');
    requests.push(toCreate);
    return toCreate;
  }
  if (!toCreate.RequestID) {
    const last = await Request.findOne().sort('-RequestID').select('RequestID');
    toCreate.RequestID = last ? last.RequestID + 1 : 1;
  }
  return Request.create(toCreate);
}

/**
 * Get request
 * @param {number} id
 * @returns {object|null}
 */
export async function get(id) {
  const { useMockData } = dbState();
  if (useMockData) {
    return requests.find(r => r.RequestID === Number(id)) || null;
  }
  return Request.findOne({ RequestID: id });
}

/**
 * Update request
 * @param {number} id
 * @param {object} payload
 * @returns {object|null}
 */
export async function update(id, payload) {
  const { useMockData } = dbState();

  // Prevent updating immutable fields
  const safe = { ...payload };
  delete safe.RequestID;
  delete safe.UserID;
  delete safe.Timestamp;

  if (useMockData) {
    const idx = requests.findIndex(r => r.RequestID === Number(id));
    if (idx === -1) return null;
    requests[idx] = { ...requests[idx], ...safe };
    return requests[idx];
  }
  return Request.findOneAndUpdate({ RequestID: id }, safe, { new: true });
}

/**
 * Delete request
 * @param {number} id 
 * @returns {boolean}
 */
export async function remove(id) {
  const { useMockData } = dbState();
  if (useMockData) {
    const idx = requests.findIndex(r => r.RequestID === Number(id));
    if (idx === -1) return false;
    requests.splice(idx, 1);
    return true;
  }
  const res = await Request.deleteOne({ RequestID: id });
  return res.deletedCount > 0;
}

// expose mock (read-only)
export function __mock() {
  return requests;
}

