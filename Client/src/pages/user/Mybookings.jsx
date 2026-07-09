import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BookingCard from '../../components/BookingCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

const Mybookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled');
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="section-title">My Bookings</h1>
        <p className="section-subtitle">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</p>

        {loading ? <Loader /> : bookings.length === 0 ? (
          <EmptyState icon={BookOpen} title="No bookings yet" description="Book your first cab ride!" actionLabel="Book a Cab" actionTo="/cabs" />
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <BookingCard key={b._id} booking={b} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Mybookings;
