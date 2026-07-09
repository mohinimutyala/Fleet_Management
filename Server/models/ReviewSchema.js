const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mybookings' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' },
}, { timestamps: true });

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
