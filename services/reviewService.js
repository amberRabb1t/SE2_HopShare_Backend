import { dbState } from '../config/database.js';
import { Review } from '../models/Review.js';
import { getNextId } from '../utils/helpers.js';

// Mock data used for testing without a database
const reviews = [
  { ReviewID: 1, Rating: 5, UserType: true, Description: 'Great driver', ReviewedUser: 2, Timestamp: 1731401000, UserID: 1 },
  { ReviewID: 2, Rating: 4, UserType: false, Description: 'Polite passenger', ReviewedUser: 1, Timestamp: 1731401100, UserID: 2 }
];

/**
 * List reviews for a user; if myReviews=true returns reviews written by the user,
 * otherwise it returns reviews about the user; undefined returns both.
 * @param {number} userID
 * @param {boolean|undefined} myReviews
 * @returns {array}
 */
export async function list(userID, myReviews) {
  const { useMockData } = dbState();
  if (useMockData) {
    if (myReviews === true) return reviews.filter(r => r.UserID === Number(userID));
    if (myReviews === false) return reviews.filter(r => r.ReviewedUser === Number(userID));
    return reviews.filter(r => r.UserID === Number(userID) || r.ReviewedUser === Number(userID));
  }
  if (myReviews === true) return Review.find({ UserID: Number(userID) });
  if (myReviews === false) return Review.find({ ReviewedUser: Number(userID) });
  return Review.find({ $or: [{ UserID: Number(userID) }, { ReviewedUser: Number(userID) }] });
}

/**
 * Create review in user's account
 * @param {number} userID 
 * @param {object} payload 
 * @returns {object}
 */
export async function create(userID, payload) {
  const { useMockData } = dbState();
  const toCreate = { ...payload, UserID: Number(userID), Timestamp: payload.Timestamp || Math.floor(Date.now() / 1000) };
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

/**
 * Get user's review
 * @param {number} userID 
 * @param {number} reviewID 
 * @returns {object|null}
 */
export async function get(userID, reviewID) {
  const { useMockData } = dbState();
  if (useMockData) {
    return reviews.find(r => r.ReviewID === Number(reviewID) && (r.UserID === Number(userID) || r.ReviewedUser === Number(userID))) || null;
  }
  return Review.findOne({ ReviewID: Number(reviewID) });
}

/**
 * Update user's review
 * @param {number} userID 
 * @param {number} reviewID 
 * @param {object} payload 
 * @returns {object|null}
 */
export async function update(userID, reviewID, payload) {
  const { useMockData } = dbState();

  // Prevent updating immutable fields
  const safe = { ...payload };
  delete safe.ReviewID;
  delete safe.UserID;
  delete safe.Timestamp;

  if (useMockData) {
    const idx = reviews.findIndex(r => r.ReviewID === Number(reviewID) && r.UserID === Number(userID));
    if (idx === -1) return null;
    reviews[idx] = { ...reviews[idx], ...safe };
    return reviews[idx];
  }
  return Review.findOneAndUpdate({ ReviewID: Number(reviewID), UserID: Number(userID) }, safe, { new: true });
}

/**
 * Delete user's review
 * @param {number} userID 
 * @param {number} reviewID 
 * @returns {boolean}
 */
export async function remove(userID, reviewID) {
  const { useMockData } = dbState();
  if (useMockData) {
    const idx = reviews.findIndex(r => r.ReviewID === Number(reviewID) && r.UserID === Number(userID));
    if (idx === -1) return false;
    reviews.splice(idx, 1);
    return true;
  }
  const res = await Review.deleteOne({ ReviewID: Number(reviewID), UserID: Number(userID) });
  return res.deletedCount > 0;
}

// expose mock (read-only)
export function __mock() {
  return reviews;
}

