import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import { MapPin, Car, CheckCircle2, Clock, Navigation, Circle } from 'lucide-react';

const STATUS_STEPS = ['Pending', 'Confirmed', 'On the Way', 'Arrived', 'In Progress', 'Completed'];

const RideTracking = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/bookings/${id}`);
        setBooking(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="page-container"><Navbar /><Loader /></div>;
  if (!booking) return <div className="page-container"><Navbar /><p className="text-center text-white/40 py-20">Booking not found</p></div>;

  const currentStep = STATUS_STEPS.indexOf(booking.status);

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="section-title">Ride Tracking</h1>
        <p className="section-subtitle">Live status updates every 15 seconds</p>

        {/* Current status banner */}
        <div className={`card mb-6 border ${booking.status === 'Completed' ? 'border-green-400/30 bg-green-400/5' : 'border-yellow-400/20 bg-yellow-400/5'}`}>
          <div className="flex items-center gap-3">
            <Navigation className={`w-6 h-6 ${booking.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`} />
            <div>
              <p className="text-xs text-white/40 mb-0.5">Current Status</p>
              <p className="font-bold text-xl text-white">{booking.status}</p>
            </div>
            {booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
        </div>

        {/* Journey */}
        <div className="card mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full mt-1.5 shrink-0" />
            <div>
              <p className="text-xs text-white/40">Pickup</p>
              <p className="font-semibold text-white">{booking.selectedPickupCity}, {booking.selectedPickupState}</p>
              <p className="text-xs text-white/30">{booking.pickupdate} at {booking.pickuptime}</p>
            </div>
          </div>
          <div className="ml-1 w-0.5 h-8 bg-gradient-to-b from-yellow-400/50 to-blue-400/50 mx-0.5 mb-4" />
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
            <div>
              <p className="text-xs text-white/40">Drop</p>
              <p className="font-semibold text-white">{booking.selectedDropCity}, {booking.selectedDropState}</p>
              {booking.dropdate && <p className="text-xs text-white/30">{booking.dropdate}</p>}
            </div>
          </div>
        </div>

        {/* Progress steps */}
        {booking.status !== 'Cancelled' && (
          <div className="card mb-6">
            <p className="text-sm font-semibold text-white/60 mb-4">Journey Progress</p>
            <div className="space-y-3">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border shrink-0 transition-all ${done ? 'bg-yellow-400 border-yellow-400' : 'bg-transparent border-white/20'}`}>
                      {done ? <CheckCircle2 className="w-4 h-4 text-black" /> : <Circle className="w-3 h-3 text-white/20" />}
                    </div>
                    <span className={`text-sm font-medium ${active ? 'text-yellow-400' : done ? 'text-white' : 'text-white/30'}`}>{step}</span>
                    {active && <span className="ml-auto text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">Current</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Driver & Car */}
        <div className="card">
          <p className="text-sm font-semibold text-white/60 mb-4">Driver & Vehicle</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-white/40">Driver</p><p className="text-white font-medium">{booking.drivername || '—'}</p></div>
            <div><p className="text-xs text-white/40">Car</p><p className="text-white font-medium">{booking.carname}</p></div>
            <div><p className="text-xs text-white/40">Car No</p><p className="text-white font-medium">{booking.carno}</p></div>
            <div><p className="text-xs text-white/40">Fare</p><p className="text-yellow-400 font-bold">₹{booking.fare}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideTracking;
