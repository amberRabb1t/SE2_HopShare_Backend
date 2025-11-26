import { dbState } from '../config/database.js';
import { Review } from '../models/Review.js';
import { getNextId } from '../utils/helpers.js';

const reviews = [
  { ReviewID: 1, Rating: 5, UserType: true, Description: 'Great driver', ReviewedUser: 2, Timestamp: 1731401000, userID: 1 },
  { ReviewID: 2, Rating: 4, UserType: false, Description: 'Polite passenger', ReviewedUser: 1, Timestamp: 1731401100, userID: 2 }
];

/**
 * List reviews for a user; if myReviews=true returns reviews written by the user, else reviews about the user; undefined returns both.
 * @param {number} userID
 * @param {boolean|undefined} myReviews
 */
export async function list(userID, myReviews) {
  const { useMockData } = dbState();
  if (useMockData) {
    if (myReviews === true) return reviews.filter(r => r.userID === Number(userID));
    if (myReviews === false) return reviews.filter(r => r.ReviewedUser === Number(userID));
    return reviews.filter(r => r.userID === Number(userID) || r.ReviewedUser === Number(userID));
  }
  if (myReviews === true) return Review.find({ userID: Number(userID) });
  if (myReviews === false) return Review.find({ ReviewedUser: Number(userID) });
  return Review.find({ $or: [{ userID: Number(userID) }, { ReviewedUser: Number(userID) }] });
}

export async function create(userID, payload) {
  const { useMockData } = dbState();
  const toCreate = { ...payload, userID: Number(userID), Timestamp: payload.Timestamp || Math.floor(Date.now() / 1000) };
  if (useMockData) {
    toCreate.ReviewID = toCreate.ReviewID || getNextId(reviews, 'ReviewID');
    reviews.push(toCreate);
    return toCreate;
  }
  if (!toCreate.ReviewID) {
    const last = await Review.findOne().sort('-ReviewID').select('ReviewID');
    toCreate.ReviewID = last ? last.ReviewID + 1 : 1;
  }
  return Review.create(toCreate);
}

export async function get(userID, reviewID) {
  const { useMockData } = dbState();
  if (useMockData) {
    return reviews.find(r => r.ReviewID === Number(reviewID)) || null;
  }
  return Review.findOne({ ReviewID: Number(reviewID) });
}

export async function update(userID, reviewID, payload) {
  const { useMockData } = dbState();
  if (useMockData) {
    const idx = reviews.findIndex(r => r.ReviewID === Number(reviewID) && r.userID === Number(userID));
    if (idx === -1) return null;
    reviews[idx] = { ...reviews[idx], ...payload };
    return reviews[idx];
  }
  return Review.findOneAndUpdate({ ReviewID: Number(reviewID), userID: Number(userID) }, payload, { new: true });
}

export async function remove(userID, reviewID) {
  const { useMockData } = dbState();
  if (useMockData) {
    const idx = reviews.findIndex(r => r.ReviewID === Number(reviewID) && r.userID === Number(userID));
    if (idx === -1) return false;
    reviews.splice(idx, 1);
    return true;
  }
  const res = await Review.deleteOne({ ReviewID: Number(reviewID), userID: Number(userID) });
  return res.deletedCount > 0;
}

// expose mock (read-only)
export function __mock() {
  return reviews;
}