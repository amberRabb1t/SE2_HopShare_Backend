import { dbState } from '../config/database.js';
import { Request } from '../models/Request.js';
import { getNextId } from '../utils/helpers.js';

const requests = [
  { RequestID: 1, Description: 'Morning commute', Status: false, Start: 'City A', End: 'City D', DateAndTime: 1731600000, Timestamp: 1731400300, userID: 2 },
  { RequestID: 2, Description: 'Airport drop', Status: false, Start: 'City C', End: 'Airport', DateAndTime: 1731650000, Timestamp: 1731400400, userID: 3 }
];

export async function list(filters = {}) {
  const { useMockData } = dbState();
  if (useMockData) {
    let result = requests;
    if (filters.Start) result = result.filter(r => r.Start.toLowerCase().includes(filters.Start.toLowerCase()));
    if (filters.End) result = result.filter(r => r.End.toLowerCase().includes(filters.End.toLowerCase()));
    if (filters.DateAndTime) result = result.filter(r => r.DateAndTime === Number(filters.DateAndTime));
    if (filters.userID) result = result.filter(r => r.userID === Number(filters.userID));
    return result;
  }
  const q = {};
  if (filters.Start) q.Start = new RegExp(filters.Start, 'i');
  if (filters.End) q.End = new RegExp(filters.End, 'i');
  if (filters.DateAndTime) q.DateAndTime = Number(filters.DateAndTime);
  if (filters.userID) q.userID = Number(filters.userID);
  return Request.find(q);
}

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

export async function get(id) {
  const { useMockData } = dbState();
  if (useMockData) {
    return requests.find(r => r.RequestID === Number(id)) || null;
  }
  return Request.findOne({ RequestID: id });
}

export async function update(id, payload) {
  const { useMockData } = dbState();
  const safe = { ...payload };
  delete safe.userID;
  if (useMockData) {
    const idx = requests.findIndex(r => r.RequestID === Number(id));
    if (idx === -1) return null;
    requests[idx] = { ...requests[idx], ...safe };
    return requests[idx];
  }
  return Request.findOneAndUpdate({ RequestID: id }, safe, { new: true });
}

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