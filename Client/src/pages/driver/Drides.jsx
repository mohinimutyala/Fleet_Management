import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Car, CheckCircle, PlayCircle, ChevronDown, MapPin } from 'lucide-react';

const TRIP_STATUS_BADGE = {
  'Waiting': 'badge-pending', 
  'Assigned': 'badge-confirmed',
  'Started': 'badge-on-way', 
  'Completed': 'badge-completed',
};

const Drides = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/bookings/driver');
        setBookings(data);
      } catch (err) {
        toast.error('Failed to load rides');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleStartTrip = async (id) => {
    try {
      await api.put(`/bookings/${id}/start-trip`);
      toast.success('Trip started!');
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, tripStatus: 'Started' } : b));
    } catch (err) {
      toast.error('Failed to start trip');
    }
  };

  const handleCompleteTrip = async (id) => {
    try {
      const { data } = await api.put(`/bookings/${id}/complete-trip`);
      toast.success(`✅ Trip completed! You earned ₹${data.driverCommission?.toFixed(2) || '—'}`);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, tripStatus: 'Completed', bookingStatus: 'Completed' } : b));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete trip');
    }
  };

  const filtered = filter === 'All' ? bookings : bookings.filter((b) => (b.tripStatus || 'Waiting') === filter);

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">My Trips</h1>
            <p className="text-white/40 text-sm">{filtered.length} trip{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="relative">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} 
              className="input appearance-none pr-8 text-sm"
              style={{ backgroundColor: '#111116', colorScheme: 'dark' }}>
              {['All', 'Waiting', 'Assigned', 'Started', 'Completed'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState icon={Car} title="No trips found" />
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => (
              <div key={b._id} className="card hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="w-4 h-4 text-yellow-400" />
                      <p className="font-semibold text-white">{b.selectedPickupCity} → {b.selectedDropCity}</p>
                    </div>
                    <p className="text-xs text-white/40 ml-5.5">{b.userName || '—'} · {b.pickupdate} at {b.pickuptime}</p>
                    
                    <div className="flex gap-3 mt-3 text-xs text-white/40 ml-5.5">
                      <span>Vehicle: <b className="text-white/60">{b.carname}</b></span>
                      <span>Reg: <b className="font-mono text-white/60">{b.carno}</b></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold mb-1">₹{b.fare}</p>
                    <span className={TRIP_STATUS_BADGE[b.tripStatus || 'Waiting']}>{b.tripStatus || 'Waiting'}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-2">
                  {b.tripStatus === 'Assigned' && (
                    <button onClick={() => handleStartTrip(b._id)} className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1.5">
                      <PlayCircle className="w-3.5 h-3.5" /> Start Trip
                    </button>
                  )}
                  {b.tripStatus === 'Started' && (
                    <button onClick={() => handleCompleteTrip(b._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-green-400/15 border border-green-400/30 text-green-400 text-xs font-semibold hover:bg-green-400/25 transition-all">
                      <CheckCircle className="w-3.5 h-3.5" /> Complete Trip
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Drides;