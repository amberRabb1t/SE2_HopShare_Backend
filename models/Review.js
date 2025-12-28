import mongoose from 'mongoose';

/* 
  Reviews are evaluations given by users to other users based on their interactions (driver-passenger or vice versa).
  This schema contains all the necessary information to store a Review.
*/

const reviewSchema = new mongoose.Schema(
  {
    ReviewID: { type: Number, index: true, unique: true, required: true },
    Rating: { type: Number, required: true },
    UserType: { type: Boolean, required: true }, // driver=true | passenger=false
    Description: { type: String },
    ReviewedUser: { type: Number, required: true },
    Timestamp: { type: Number, required: true },
    UserID: { type: Number, required: true } // author
  },
  { timestamps: true, collection: 'reviews' }
);

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

