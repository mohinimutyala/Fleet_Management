const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  selectedPickupCity: { type: String, required: true },
  pickupAddress: { type: String, default: '' },
  selectedDropCity: { type: String, required: true },
  dropAddress: { type: String, default: '' },
  pickupdate: { type: String, required: true },
  pickuptime: { type: String, required: true },
  // Driver — assigned by admin after booking
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  drivername: { type: String, default: '' },
  assignedAt: { type: Date, default: null },
  // Fare & vehicle info
  fare: { type: String },
  driverCommission: { type: Number, default: 0 }, // 30% of fare — stored at completion
  platformRevenue: { type: Number, default: 0 },  // 70% of fare — stored at completion
  carname: { type: String },
  cartype: { type: String },
  carno: { type: String },
  price: { type: String },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  // User info
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  bookeddate: {
    type: String,
    default: () => new Date().toLocaleDateString('en-IN'),
  },
  // Booking lifecycle status
  bookingStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending',
  },
  // Trip lifecycle status
  tripStatus: {
    type: String,
    enum: ['Waiting', 'Assigned', 'Started', 'Completed'],
    default: 'Waiting',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded'],
    default: 'Pending',
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI'],
    default: 'Cash',
  },
  notes: { type: String, default: '' },
  // Trip lifecycle timestamps (must be in schema or Mongoose strict mode drops them)
  startedAt:   { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

const Mybookings = mongoose.model('Mybookings', rideSchema);
module.exports = Mybookings;
