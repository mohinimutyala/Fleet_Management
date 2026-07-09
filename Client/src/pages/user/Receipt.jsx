import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Printer, Download, Car, MapPin, Calendar, User, CreditCard } from 'lucide-react';

const Receipt = () => {
  const { id } = useParams();
  const { userInfo } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

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
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return <div className="page-container"><Navbar /><Loader /></div>;
  if (!booking) return <div className="page-container"><Navbar /><p className="text-center text-white/40 py-20">Booking not found</p></div>;

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title mb-0">Ride Receipt</h1>
          <button id="print-receipt" onClick={handlePrint} className="btn-secondary flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

        <div ref={printRef} className="card space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="font-black text-2xl text-white">Cab<span className="text-yellow-400">Go</span></h2>
              <p className="text-xs text-white/30">Official Ride Receipt</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/30">Booking ID</p>
              <p className="text-xs font-mono text-white/60">{booking._id}</p>
            </div>
          </div>

          {/* Trip */}
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Trip Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-white/40">From</p>
                  <p className="text-sm font-semibold text-white">{booking.selectedPickupCity}</p>
                  {booking.pickupAddress && <p className="text-xs text-white/40">{booking.pickupAddress}</p>}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-white/40">To</p>
                  <p className="text-sm font-semibold text-white">{booking.selectedDropCity}</p>
                  {booking.dropAddress && <p className="text-xs text-white/40">{booking.dropAddress}</p>}
                </div>
              </div>
              <div className="flex items-start gap-2 col-span-2">
                <Calendar className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-white/40">Pickup Date & Time</p>
                  <p className="text-sm text-white">{booking.pickupdate} at {booking.pickuptime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Car & Driver */}
          <div className="bg-white/3 rounded-xl p-4">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Vehicle & Driver</p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-white/40">Car</p>
                <p className="text-white font-medium">{booking.carname}</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Type</p>
                <p className="text-white font-medium">{booking.cartype}</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Car No</p>
                <p className="text-white font-medium">{booking.carno}</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Driver</p>
                <p className="text-white font-medium">{booking.drivername}</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Status</p>
                <p className="text-white font-medium">{booking.status}</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Payment</p>
                <p className="text-white font-medium">{booking.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between py-4 border-t border-white/10">
            <div>
              <p className="text-sm text-white/40">Total Amount</p>
              <p className="text-xs text-white/20">Booked on {booking.bookeddate}</p>
            </div>
            <p className="text-4xl font-black text-yellow-400">₹{booking.fare}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
