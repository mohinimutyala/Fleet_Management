import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { BookOpen, XCircle, UserCheck, ChevronDown } from 'lucide-react';

const BOOKING_STATUS_BADGE = {
  'Pending': 'badge-pending',
  'Confirmed': 'badge-confirmed',
  'Cancelled': 'badge-cancelled',
  'Completed': 'badge-completed',
};

const TRIP_STATUS_BADGE = {
  'Waiting': 'badge-pending',
  'Assigned': 'badge-confirmed',
  'Started': 'badge-on-way',
  'Completed': 'badge-completed',
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/all');
      setBookings(data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking deleted');
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      toast.error('Delete failed');
    }
  };


  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      setBookings(prev => prev.map(b => b._id === id ? { ...b, bookingStatus: 'Cancelled' } : b));
    } catch (err) {
      toast.error('Cancel failed');
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.bookingStatus === filter);

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Bookings</h1>
            <p className="text-white/40 text-sm">{bookings.length} total bookings</p>
          </div>
          <div className="relative">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="input text-sm py-2 pr-8 appearance-none"
              style={{ backgroundColor: '#111116', colorScheme: 'dark' }}
            >
              <option value="all">All Bookings</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState icon={BookOpen} title="No bookings found" description="No bookings match the selected filter" />
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => (
              <div key={b._id} className="card hover:border-white/20 transition-all">
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-white">{b.selectedPickupCity} → {b.selectedDropCity}</p>
                    <p className="text-xs text-white/40">{b.userName || '—'} · {b.bookeddate}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-yellow-400 font-bold">₹{b.fare}</span>
                    <span className={BOOKING_STATUS_BADGE[b.bookingStatus] || 'badge-pending'}>{b.bookingStatus || 'Pending'}</span>
                    <span className={TRIP_STATUS_BADGE[b.tripStatus] || 'badge-pending'} style={{ fontSize: '10px' }}>Trip: {b.tripStatus || 'Waiting'}</span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs text-white/50">
                  <span>Car: <b className="text-white/70">{b.carname || '—'}</b></span>
                  <span>Type: <b className="text-white/70">{b.cartype || '—'}</b></span>
                  <span>Reg: <b className="text-white/70">{b.carno || '—'}</b></span>
                  <span>Driver: <b className="text-white/70">{b.drivername || 'Not Assigned'}</b></span>
                </div>

                {/* Financial breakdown for completed bookings */}
                {b.bookingStatus === 'Completed' && (
                  <div className="mb-3 px-3 py-2 rounded-lg bg-green-400/5 border border-green-400/15 text-xs space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-white/40">Total Fare</span>
                      <span className="text-white/70 font-medium">₹{b.fare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Driver Commission (30%)</span>
                      <span className="text-blue-400 font-medium">₹{b.driverCommission?.toFixed(2) || (parseFloat(b.fare) * 0.3).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Platform Revenue (70%)</span>
                      <span className="text-green-400 font-medium">₹{b.platformRevenue?.toFixed(2) || (parseFloat(b.fare) * 0.7).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {b.bookingStatus === 'Pending' && (
                    <a href="/admin/pending-bookings" className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Assign Driver
                    </a>
                  )}
                  {(b.bookingStatus === 'Pending' || b.bookingStatus === 'Confirmed') && (
                    <button onClick={() => handleCancel(b._id)} className="btn-danger text-xs py-1.5 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                  <button onClick={() => handleDelete(b._id)} className="ml-auto text-xs text-red-400/50 hover:text-red-400 transition-colors py-1.5 px-2">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Bookings;