const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mybookings', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['Cash', 'Card', 'UPI'], default: 'Cash' },
  status: { type: String, enum: ['Pending', 'Paid', 'Refunded', 'Failed'], default: 'Pending' },
  transactionId: { type: String, default: '' },
}, { timestamps: true });

const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;
