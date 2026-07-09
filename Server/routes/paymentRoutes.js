const express = require('express');
const router = express.Router();
const { createPayment, getPayment, getPaymentByBooking } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createPayment);
router.get('/booking/:bookingId', protect, getPaymentByBooking);
router.get('/:id', protect, getPayment);

module.exports = router;
