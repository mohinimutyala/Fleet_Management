const Booking = require('../models/MyBookingSchema');
const { updateRideStatus, getRideStatus } = require('../services/trackingService');

// @desc  Update ride tracking status
// @route PUT /api/tracking/:bookingId
const updateTracking = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await updateRideStatus(req.params.bookingId, status);
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get ride tracking status
// @route GET /api/tracking/:bookingId
const getTracking = async (req, res) => {
  try {
    const ride = await getRideStatus(req.params.bookingId);
    if (!ride) return res.status(404).json({ message: 'Booking not found' });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { updateTracking, getTracking };
