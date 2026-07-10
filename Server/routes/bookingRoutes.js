const express = require('express');
const router = express.Router();
const {
  createBooking, calculateFarePreview, getMyBookings, getAllBookings,
  getPendingBookings, getBookingById, deleteBooking,
  assignDriver, completeTrip, cancelBooking,
  getDriverBookings, startTrip,
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

router.post('/calculate-fare', calculateFarePreview);
router.post('/', protect, checkRole('user'), createBooking);
router.get('/my', protect, checkRole('user'), getMyBookings);
router.get('/driver', protect, checkRole('driver'), getDriverBookings);
router.get('/pending', protect, checkRole('admin'), getPendingBookings);
router.get('/all', protect, checkRole('admin'), getAllBookings);
router.get('/:id', protect, getBookingById);
router.delete('/:id', protect, deleteBooking);
router.put('/:id/assign-driver', protect, checkRole('admin'), assignDriver);
router.put('/:id/complete-trip', protect, checkRole('driver'), completeTrip);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/start-trip', protect, checkRole('driver'), startTrip);

module.exports = router;
