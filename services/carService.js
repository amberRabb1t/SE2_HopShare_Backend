import { dbState } from '../config/database.js';
import { Car } from '../models/Car.js';
import { getNextId } from '../utils/helpers.js';

const cars = [
  { CarID: 1, Seats: 4, ServiceDate: 1731000000, MakeModel: 'Toyota Corolla', LicensePlate: 'ABC-1234', Timestamp: 1731400500, UserID: 1 },
  { CarID: 2, Seats: 5, ServiceDate: 1731100000, MakeModel: 'Honda Civic', LicensePlate: 'XYZ-9876', Timestamp: 1731400600, UserID: 2 }
];

export async function list(userID) {
  const { useMockData } = dbState();
  if (useMockData) {
    return cars.filter(c => c.UserID === Number(userID));
  }
  return Car.find({ UserID: Number(userID) });
}

export async function create(userID, payload) {
  const { useMockData } = dbState();
  const toCreate = { ...payload, UserID: Number(userID), Timestamp: payload.Timestamp || Math.floor(Date.now() / 1000) };
  if (useMockData) {
    toCreate.CarID = toCreate.CarID || getNextId(cars, 'CarID');
    cars.push(toCreate);
    return toCreate;
  }
  if (!toCreate.CarID) {
    const last = await Car.findOne().sort('-CarID').select('CarID');
    toCreate.CarID = last ? last.CarID + 1 : 1;
  }
  return Car.create(toCreate);
}

export async function get(userID, carID) {
  const { useMockData } = dbState();
  if (useMockData) {
    return cars.find(c => c.UserID === Number(userID) && c.CarID === Number(carID)) || null;
  }
  return Car.findOne({ UserID: Number(userID), CarID: Number(carID) });
}

export async function update(userID, carID, payload) {
  const { useMockData } = dbState();

  const safe = { ...payload };
  delete safe.CarID;
  delete safe.UserID;
  delete safe.Timestamp;

  if (useMockData) {
    const idx = cars.findIndex(c => c.UserID === Number(userID) && c.CarID === Number(carID));
    if (idx === -1) return null;
    cars[idx] = { ...cars[idx], ...safe };
    return cars[idx];
  }
  return Car.findOneAndUpdate({ UserID: Number(userID), CarID: Number(carID) }, safe, { new: true });
}

export async function remove(userID, carID) {
  const { useMockData } = dbState();
  if (useMockData) {
    const idx = cars.findIndex(c => c.UserID === Number(userID) && c.CarID === Number(carID));
    if (idx === -1) return false;
    cars.splice(idx, 1);
    return true;
  }
  const res = await Car.deleteOne({ UserID: Number(userID), CarID: Number(carID) });
  return res.deletedCount > 0;
}

