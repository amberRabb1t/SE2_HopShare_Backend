import { dbState } from '../config/database.js';
import { Route } from '../models/Route.js';
import { getNextId } from '../utils/helpers.js';

// Mock data
const routes = [
  { RouteID: 1, Start: 'City A', End: 'City B', Stops: 'Stop1, Stop2', Comment: 'No smoking', DateAndTime: 1731400000, OccupiedSeats: 1, Rules: [true, false, false, false], Timestamp: 1731400000, userID: 1 },
  { RouteID: 2, Start: 'City B', End: 'City C', Stops: 'Stop3', Comment: 'No pets', DateAndTime: 1731500000, OccupiedSeats: 2, Rules: [false, true, false, true], Timestamp: 1731500000, userID: 2 }
];

/**
 * List routes with filters
 */
export async function list(filters = {}) {
  const { useMockData } = dbState();
  if (useMockData) {
    let result = routes;
    if (filters.Start) result = result.filter(r => r.Start.toLowerCase().includes(filters.Start.toLowerCase()));
    if (filters.End) result = result.filter(r => r.End.toLowerCase().includes(filters.End.toLowerCase()));
    if (filters.DateAndTime) result = result.filter(r => r.DateAndTime === Number(filters.DateAndTime));
    if (filters.userID) result = result.filter(r => r.userID === Number(filters.userID));
    // Boolean flags like NoSmoking/NoPets/NoCats/NoDogs are present in Rules[] for demo only
    return result;
  }
  const mongoQuery = {};
  if (filters.Start) mongoQuery.Start = new RegExp(filters.Start, 'i');
  if (filters.End) mongoQuery.End = new RegExp(filters.End, 'i');
  if (filters.DateAndTime) mongoQuery.DateAndTime = Number(filters.DateAndTime);
  if (filters.userID) mongoQuery.userID = Number(filters.userID);
  return Route.find(mongoQuery);
}

/**
 * Create route
 */
export async function create(payload) {
  const { useMockData } = dbState();
  const toCreate = {
    ...payload,
    Timestamp: payload.Timestamp || Math.floor(Date.now() / 1000)
  };
  if (useMockData) {
    toCreate.RouteID = toCreate.RouteID || getNextId(routes, 'RouteID');
    routes.push(toCreate);
    return toCreate;
  }
  if (!toCreate.RouteID) {
    const last = await Route.findOne().sort('-RouteID').select('RouteID');
    toCreate.RouteID = last ? last.RouteID + 1 : 1;
  }
  return Route.create(toCreate);
}

/**
 * Get route
 */
export async function get(id) {
  const { useMockData } = dbState();
  if (useMockData) {
    return routes.find(r => r.RouteID === Number(id)) || null;
  }
  return Route.findOne({ RouteID: id });
}

/**
 * Update route
 */
export async function update(id, payload) {
  const { useMockData } = dbState();
  if (useMockData) {
    const idx = routes.findIndex(r => r.RouteID === Number(id));
    if (idx === -1) return null;
    routes[idx] = { ...routes[idx], ...payload };
    return routes[idx];
  }
  return Route.findOneAndUpdate({ RouteID: id }, payload, { new: true });
}

/**
 * Remove route
 */
export async function remove(id) {
  const { useMockData } = dbState();
  if (useMockData) {
    const idx = routes.findIndex(r => r.RouteID === Number(id));
    if (idx === -1) return false;
    routes.splice(idx, 1);
    return true;
  }
  const res = await Route.deleteOne({ RouteID: id });
  return res.deletedCount > 0;
}