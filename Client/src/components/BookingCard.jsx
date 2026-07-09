import { MapPin, Eye, Trash2, UserCheck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BOOKING_STATUS_STYLES = {
  'Pending': 'badge-pending',
  'Confirmed': 'badge-confirmed',
  'Cancelled': 'badge-cancelled',
  'Completed': 'badge-completed',
};

const TRIP_STATUS_STYLES = {
  'Waiting': 'badge-pending',
  'Assigned': 'badge-confirmed',
  'Started': 'badge-on-way',
  'Completed': 'badge-completed',
};

const BookingCard = ({ booking, onDelete, showDelete = true }) => {
  const navigate = useNavigate();
  const bookingStatus = booking.bookingStatus || 'Pending';
  const tripStatus = booking.tripStatus || 'Waiting';

  return (
    <div className="card hover:border-white/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-white">
              {booking.selectedPickupCity} → {booking.selectedDropCity}
            </span>
          </div>
          {(booking.pickupAddress || booking.dropAddress) && (
            <p className="text-xs text-white/40 ml-6">
              {booking.pickupAddress && `From: ${booking.pickupAddress}`}
              {booking.pickupAddress && booking.dropAddress && ' · '}
              {booking.dropAddress && `To: ${booking.dropAddress}`}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={BOOKING_STATUS_STYLES[bookingStatus] || 'badge-pending'}>{bookingStatus}</span>
          <span className={`${TRIP_STATUS_STYLES[tripStatus] || 'badge-pending'} text-xs`} style={{ fontSize: '10px' }}>Trip: {tripStatus}</span>
        </div>
      </div>

      {/* Pending notice */}
      {bookingStatus === 'Pending' && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-yellow-400/5 border border-yellow-400/15">
          <Clock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <p className="text-xs text-yellow-400/80">Waiting for admin to assign a driver</p>
        </div>
      )}
      {bookingStatus === 'Confirmed' && booking.drivername && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-green-400/5 border border-green-400/15">
          <UserCheck className="w-3.5 h-3.5 text-green-400 shrink-0" />
          <p className="text-xs text-green-400/80">Driver assigned: <span className="font-medium">{booking.drivername}</span></p>
        </div>
      )}

      {/* Grid details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-2.5">
          <p className="text-xs text-white/40 mb-0.5">Booked</p>
          <p className="text-sm text-white font-medium">{booking.bookeddate}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5">
          <p className="text-xs text-white/40 mb-0.5">Pickup Date</p>
          <p className="text-sm text-white font-medium">{booking.pickupdate}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5">
          <p className="text-xs text-white/40 mb-0.5">Fare</p>
          <p className="text-sm text-yellow-400 font-bold">₹{booking.fare}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5">
          <p className="text-xs text-white/40 mb-0.5">Vehicle</p>
          <p className="text-sm text-white font-medium">{booking.carname || '—'}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5">
          <p className="text-xs text-white/40 mb-0.5">Type</p>
          <p className="text-sm text-white font-medium">{booking.cartype || '—'}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5">
          <p className="text-xs text-white/40 mb-0.5">Driver</p>
          <p className="text-sm text-white font-medium">{booking.drivername || 'Pending'}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5">
          <p className="text-xs text-white/40 mb-0.5">Payment</p>
          <p className="text-sm text-white font-medium">{booking.paymentMethod}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5">
          <p className="text-xs text-white/40 mb-0.5">Pay Status</p>
          <p className="text-sm text-white font-medium">{booking.paymentStatus}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/receipt/${booking._id}`)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <Eye className="w-3.5 h-3.5" /> Receipt
        </button>
        {showDelete && bookingStatus === 'Pending' && (
          <button
            onClick={() => onDelete && onDelete(booking._id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-sm ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
