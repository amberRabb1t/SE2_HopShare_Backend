import { dbState } from '../config/database.js';
import { Report } from '../models/Report.js';
import { getNextId } from '../utils/helpers.js';

const reports = [
  { ReportID: 1, Description: 'Spam behavior', ReportedUser: 3, State: false, Timestamp: 1731400100, UserID: 2 },
  { ReportID: 2, Description: 'Rude messages', ReportedUser: 2, State: true, Timestamp: 1731400200, UserID: 4 }
];

export async function list(filters = {}) {
  const { useMockData } = dbState();
  if (useMockData) {
    let result = reports;
    if (filters.UserID) result = result.filter(r => r.ReportedUser === Number(filters.UserID));
    if (filters.ReportID) result = result.filter(r => r.ReportID === Number(filters.ReportID));
    if (typeof filters.State === 'boolean') result = result.filter(r => r.State === filters.State);
    if (filters.Timestamp) result = result.filter(r => r.Timestamp === Number(filters.Timestamp));
    return result;
  }
  const q = {};
  if (filters.UserID) q.ReportedUser = Number(filters.UserID);
  if (filters.ReportID) q.ReportID = Number(filters.ReportID);
  if (typeof filters.State === 'boolean') q.State = filters.State;
  if (filters.Timestamp) q.Timestamp = Number(filters.Timestamp);
  return Report.find(q);
}

export async function create(payload) {
  const { useMockData } = dbState();
  const toCreate = { ...payload, State: payload.State ?? false, Timestamp: payload.Timestamp || Math.floor(Date.now() / 1000) };
  if (useMockData) {
    toCreate.ReportID = toCreate.ReportID || getNextId(reports, 'ReportID');
    reports.push(toCreate);
    return toCreate;
  }
  if (!toCreate.ReportID) {
    const last = await Report.findOne().sort('-ReportID').select('ReportID');
    toCreate.ReportID = last ? last.ReportID + 1 : 1;
  }
  return Report.create(toCreate);
}

export async function get(id) {
  const { useMockData } = dbState();
  if (useMockData) {
    return reports.find(r => r.ReportID === Number(id)) || null;
  }
  return Report.findOne({ ReportID: id });
}

