const Payment = require('../models/PaymentSchema');

// @desc  Create payment
// @route POST /api/payments
const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, method } = req.body;
    const payment = await Payment.create({
      bookingId, userId: req.user.id, amount, method: method || 'Cash',
      transactionId: 'TXN' + Date.now(),
      status: 'Paid',
    });
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get payment by ID
// @route GET /api/payments/:id
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('bookingId');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get payment by booking ID
// @route GET /api/payments/booking/:bookingId
const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment.findOne({ bookingId: req.params.bookingId });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPayment, getPayment, getPaymentByBooking };
