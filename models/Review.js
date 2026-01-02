import mongoose from 'mongoose';

/* 
  Reviews are evaluations given by users to other users based on their interactions (driver-passenger or vice versa).
  This schema contains all the necessary information to store a Review.
*/

const reviewSchema = new mongoose.Schema(
  {
    ReviewID: { type: Number, index: true, unique: true, required: true },  // Unique identifier for the review
    Rating: { type: Number, required: true }, // Has to be between 1 and 5
    UserType: { type: Boolean, required: true }, // driver=true | passenger=false
    Description: { type: String },  // optional textual feedback
    ReviewedUser: { type: Number, required: true }, // the user being reviewed
    Timestamp: { type: Number, required: true },  // time of review creation
    UserID: { type: Number, required: true } // author
  },
  { timestamps: true, collection: 'reviews' }
);

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

