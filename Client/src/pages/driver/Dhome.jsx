import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Car, MapPin, CheckCircle, PlayCircle, Star, ToggleLeft, ToggleRight, Clock, TrendingUp, Zap } from 'lucide-react';

const TRIP_STATUS_BADGE = {
  'Waiting': 'badge-pending',
  'Assigned': 'badge-confirmed',
  'Started': 'badge-on-way',
  'Completed': 'badge-completed',
};

const Dhome = () => {
  const { driverInfo, loginDriver } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, bookingsRes, earningsRes] = await Promise.all([
          api.get('/drivers/profile'),
          api.get('/bookings/driver'),
          api.get('/drivers/earnings'),
        ]);
        setProfile(profileRes.data);
        setEarnings(earningsRes.data);
        // Active bookings: confirmed or started (not waiting/completed/cancelled)
        setBookings(bookingsRes.data.filter(b =>
          b.bookingStatus !== 'Completed' && b.bookingStatus !== 'Cancelled'
        ).slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleOnline = async () => {
    setTogglingStatus(true);
    try {
      const { data } = await api.put('/drivers/status');
      setProfile(prev => ({ ...prev, isOnline: data.isOnline, status: data.status }));
      loginDriver({ ...driverInfo, isOnline: data.isOnline });
      toast.success(data.isOnline ? 'You are now online!' : 'You are now offline');
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleStartTrip = async (id) => {
    try {
      await api.put(`/bookings/${id}/start-trip`);
      toast.success('Trip started!');
      setBookings(prev => prev.map(b => b._id === id ? { ...b, tripStatus: 'Started' } : b));
    } catch (err) {
      toast.error('Failed to start trip');
    }
  };

  const statusColor = { Available: 'text-green-400', Busy: 'text-orange-400', Offline: 'text-white/40' };
  const statusBg = { Available: 'bg-green-400/10 border-green-400/20', Busy: 'bg-orange-400/10 border-orange-400/20', Offline: 'bg-white/5 border-white/10' };
  const driverStatus = profile?.status || 'Offline';

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {loading ? <Loader /> : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black text-white">Driver Dashboard</h1>
                <p className="text-white/40 text-sm">{profile?.name}</p>
              </div>
              <button id="toggle-online-btn" onClick={handleToggleOnline} disabled={togglingStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${profile?.isOnline ? 'bg-green-400/15 border-green-400/30 text-green-400 hover:bg-green-400/25' : 'bg-white/5 border-white/20 text-white/50 hover:bg-white/10'}`}>
                {profile?.isOnline ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                {profile?.isOnline ? 'Online' : 'Offline'}
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className={`card border ${statusBg[driverStatus]}`}>
                <p className="text-xs text-white/40 mb-1">Current Status</p>
                <p className={`text-2xl font-black ${statusColor[driverStatus]}`}>{driverStatus}</p>
              </div>
              <div className="card">
                <p className="text-xs text-white/40 mb-1">Today's Trips</p>
                <p className="text-2xl font-black text-blue-400">{earnings?.todayRides || 0}</p>
              </div>
              <div className="card">
                <p className="text-xs text-white/40 mb-1">Completed Trips</p>
                <p className="text-2xl font-black text-green-400">{earnings?.totalRides || 0}</p>
              </div>
              <div className="card">
                <p className="text-xs text-white/40 mb-1">Rating</p>
                <p className="text-2xl font-black text-yellow-400">⭐ {profile?.rating?.toFixed(1) || '5.0'}</p>
              </div>
            </div>

            {/* Revenue Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              <div className="card border-yellow-400/20 bg-yellow-400/3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center border border-yellow-400/20">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Total Earnings</p>
                    <p className="text-2xl font-black text-yellow-400">₹{earnings?.totalEarnings?.toFixed(0) || 0}</p>
                  </div>
                </div>
              </div>
              <div className="card border-green-400/20 bg-green-400/3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center border border-green-400/20">
                    <Zap className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Today's Revenue</p>
                    <p className="text-2xl font-black text-green-400">₹{earnings?.todayRevenue?.toFixed(0) || 0}</p>
                  </div>
                </div>
              </div>
              <div className="card border-blue-400/20 bg-blue-400/3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center border border-blue-400/20">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Monthly Revenue</p>
                    <p className="text-2xl font-black text-blue-400">₹{earnings?.monthlyRevenue?.toFixed(0) || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active / Assigned Rides */}
            <h2 className="text-lg font-bold text-white mb-4">
              {driverStatus === 'Busy' ? '🚗 Current Assignment' : 'Active Rides'}
            </h2>
            {bookings.length === 0 ? (
              <div className="card text-center py-12">
                <Car className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/30">No active rides right now.</p>
                {!profile?.isOnline && <p className="text-yellow-400/60 text-sm mt-2">Go online to receive rides</p>}
                {profile?.isOnline && driverStatus === 'Available' && <p className="text-white/20 text-sm mt-2">Waiting for admin to assign a booking...</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b._id} className="card hover:border-white/20 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-white">{b.selectedPickupCity} → {b.selectedDropCity}</p>
                        <p className="text-xs text-white/40">{b.userName} · {b.pickupdate} at {b.pickuptime}</p>
                        {b.pickupAddress && <p className="text-xs text-white/30 mt-0.5">📍 {b.pickupAddress}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold">₹{b.fare}</p>
                        <span className={`text-xs ${TRIP_STATUS_BADGE[b.tripStatus]}`}>{b.tripStatus || 'Waiting'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-white/50">
                      <span>Vehicle: <b className="text-white/70">{b.carname}</b></span>
                      <span>Reg: <b className="text-white/70">{b.carno}</b></span>
                      <span>Payment: <b className="text-white/70">{b.paymentMethod}</b></span>
                    </div>

                    {/* Driver action buttons */}
                    <div className="flex gap-2 mt-2">
                      {b.tripStatus === 'Assigned' && (
                        <button onClick={() => handleStartTrip(b._id)} className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-sm py-2">
                          <PlayCircle className="w-4 h-4" /> Start Trip
                        </button>
                      )}
                      {b.tripStatus === 'Started' && (
                        <div className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-green-400/10 border border-green-400/20 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Trip in Progress — Admin will complete this trip
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dhome;
