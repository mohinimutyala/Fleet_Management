const Booking = require('../models/MyBookingSchema');

// Update ride status/location
const updateRideStatus = async (bookingId, status) => {
  return await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });
};

// Get current ride status
const getRideStatus = async (bookingId) => {
  return await Booking.findById(bookingId).select('status carname drivername carno cartype');
};

module.exports = { updateRideStatus, getRideStatus };
