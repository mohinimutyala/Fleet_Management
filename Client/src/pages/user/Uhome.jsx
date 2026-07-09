import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { Car, BookOpen, MapPin, Clock, ChevronRight, TrendingUp } from 'lucide-react';

const Unav = () => null; // Navbar handles navigation

const Uhome = () => {
  const { userInfo } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/my');
        setBookings(data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const STATUS_COLOR = {
    'Pending': 'text-yellow-400', 'Confirmed': 'text-blue-400',
    'On the Way': 'text-orange-400', 'Completed': 'text-green-400', 'Cancelled': 'text-red-400',
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome */}
        <div className="mb-10 animate-fade-in">
          <p className="text-white/40 text-sm mb-1">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋</p>
          <h1 className="text-3xl font-black text-white">{userInfo?.name}</h1>
          <p className="text-white/40 mt-1">Where would you like to go today?</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Book a Cab', to: '/cabs', icon: Car, color: 'yellow' },
            { label: 'My Bookings', to: '/mybookings', icon: BookOpen, color: 'blue' },
            { label: 'Track Ride', to: '/mybookings', icon: MapPin, color: 'green' },
            { label: 'Scheduled', to: '/scheduled', icon: Clock, color: 'purple' },
          ].map(({ label, to, icon: Icon, color }) => (
            <Link
              key={label}
              to={to}
              className={`card hover:scale-105 transition-all duration-300 flex flex-col items-center gap-3 py-6 text-center
                ${color === 'yellow' ? 'hover:border-yellow-400/30' : color === 'blue' ? 'hover:border-blue-400/30' : color === 'green' ? 'hover:border-green-400/30' : 'hover:border-purple-400/30'}`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center
                ${color === 'yellow' ? 'bg-yellow-400/10 border border-yellow-400/20' : color === 'blue' ? 'bg-blue-400/10 border border-blue-400/20' : color === 'green' ? 'bg-green-400/10 border border-green-400/20' : 'bg-purple-400/10 border border-purple-400/20'}`}
              >
                <Icon className={`w-5 h-5 ${color === 'yellow' ? 'text-yellow-400' : color === 'blue' ? 'text-blue-400' : color === 'green' ? 'text-green-400' : 'text-purple-400'}`} />
              </div>
              <span className="text-sm font-medium text-white/70">{label}</span>
            </Link>
          ))}
        </div>

        {/* Recent bookings */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
          <Link to="/mybookings" className="flex items-center gap-1 text-yellow-400 text-sm hover:text-yellow-300 transition-colors">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : bookings.length === 0 ? (
          <div className="card text-center py-12">
            <Car className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No bookings yet. Book your first ride!</p>
            <Link to="/cabs" className="btn-primary inline-block mt-4 text-sm">Book Now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b._id} className="card hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center border border-yellow-400/20">
                      <Car className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{b.selectedPickupCity} → {b.selectedDropCity}</p>
                      <p className="text-xs text-white/40">{b.carname} · {b.bookeddate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold text-sm">₹{b.fare}</p>
                    <p className={`text-xs font-medium ${STATUS_COLOR[b.status] || 'text-white/40'}`}>{b.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Uhome;
