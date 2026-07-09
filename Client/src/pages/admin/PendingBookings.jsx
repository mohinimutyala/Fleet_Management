import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Clock, UserCheck, CheckCircle, XCircle, Truck } from 'lucide-react';

const PendingBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null); // booking object
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [driversLoading, setDriversLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/pending');
      setBookings(data);
    } catch (err) {
      toast.error('Failed to load pending bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const openAssignModal = async (booking) => {
    setAssignModal(booking);
    setDriversLoading(true);
    try {
      const { data } = await api.get('/drivers/available');
      setAvailableDrivers(data);
    } catch (err) {
      toast.error('Failed to load available drivers');
    } finally {
      setDriversLoading(false);
    }
  };

  const handleAssign = async (driverId) => {
    if (!assignModal) return;
    setAssigning(true);
    try {
      await api.put(`/bookings/${assignModal._id}/assign-driver`, { driverId });
      toast.success('🎉 Driver assigned! Booking confirmed.');
      setAssignModal(null);
      setBookings(prev => prev.filter(b => b._id !== assignModal._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      toast.error('Cancel failed');
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Pending Bookings</h1>
          <p className="text-white/40 text-sm mt-1">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} awaiting driver assignment</p>
        </div>

        {loading ? <Loader /> : bookings.length === 0 ? (
          <EmptyState icon={Clock} title="No pending bookings" description="All bookings have been assigned. Great work!" />
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="card hover:border-yellow-400/20 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-bold text-white text-lg">{b.selectedPickupCity} → {b.selectedDropCity}</p>
                    <p className="text-xs text-white/40 mt-0.5">{b.userName || '—'} · Booked on {b.bookeddate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold text-xl">₹{b.fare}</p>
                    <span className="text-xs badge-pending">Pending Assignment</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3 rounded-xl bg-white/3 border border-white/5">
                  <div>
                    <p className="text-xs text-white/40">Vehicle</p>
                    <p className="text-sm text-white font-medium">{b.carname || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Type</p>
                    <p className="text-sm text-white font-medium">{b.cartype || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Pickup Date</p>
                    <p className="text-sm text-white font-medium">{b.pickupdate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Pickup Time</p>
                    <p className="text-sm text-white font-medium">{b.pickuptime}</p>
                  </div>
                </div>

                {b.pickupAddress && (
                  <p className="text-xs text-white/40 mb-3">📍 {b.pickupAddress} → {b.dropAddress}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openAssignModal(b)}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    Assign Driver
                  </button>
                  <button
                    onClick={() => handleCancel(b._id)}
                    className="btn-danger flex items-center gap-1.5 px-4 py-2.5 text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Assign Driver Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111114] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Assign Driver</h2>
              <p className="text-white/40 text-sm mt-1">
                {assignModal.selectedPickupCity} → {assignModal.selectedDropCity} · ₹{assignModal.fare}
              </p>
            </div>

            <div className="p-5">
              {driversLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                </div>
              ) : availableDrivers.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No available drivers right now.</p>
                  <p className="text-white/20 text-xs mt-1">All drivers are either busy or offline.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  <p className="text-xs text-white/40 mb-3">{availableDrivers.length} driver{availableDrivers.length !== 1 ? 's' : ''} available</p>
                  {availableDrivers.map((driver) => (
                    <button
                      key={driver._id}
                      onClick={() => handleAssign(driver._id)}
                      disabled={assigning}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-yellow-400/30 hover:bg-yellow-400/5 transition-all text-left"
                    >
                      <div className="w-9 h-9 bg-yellow-400/15 rounded-full flex items-center justify-center border border-yellow-400/20">
                        <span className="text-yellow-400 text-sm font-bold">{driver.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{driver.name}</p>
                        <p className="text-white/40 text-xs">{driver.phone || driver.email} · ⭐ {driver.rating?.toFixed(1) || '5.0'}</p>
                      </div>
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">Available</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => setAssignModal(null)}
                className="w-full py-2.5 rounded-xl border border-white/15 text-white/50 hover:text-white hover:border-white/30 text-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingBookings;
