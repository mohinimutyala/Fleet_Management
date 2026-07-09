import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BookingCard from '../../components/BookingCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Clock } from 'lucide-react';

const ScheduledBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/my');
        // Filter scheduled bookings
        setBookings(data.filter((b) => b.isScheduled || new Date(b.pickupdate) > new Date()));
      } catch (err) {
        toast.error('Failed to load scheduled bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled');
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="section-title">Scheduled Bookings</h1>
        <p className="section-subtitle">Your upcoming and scheduled rides</p>
        {loading ? <Loader /> : bookings.length === 0 ? (
          <EmptyState icon={Clock} title="No scheduled bookings" description="Book a ride with a future date to schedule it" actionLabel="Book Now" actionTo="/cabs" />
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => <BookingCard key={b._id} booking={b} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ScheduledBookings;
