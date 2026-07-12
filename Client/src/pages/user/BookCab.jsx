import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FareCard from '../../components/FareCard';
import Loader from '../../components/Loader';
import LocationSearch from '../../components/LocationSearch';
import { MapPin, Calendar, Clock, Car, Calculator, AlertCircle } from 'lucide-react';

// ── Date / time validation helpers ────────────────────────────────────────────
function getNowIST() {
  return new Date();
}

/** Returns today's date string in YYYY-MM-DD (local) */
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns current time in HH:MM (local) */
function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Validate the selected pickup date + time.
 * Returns null (valid) or an error string.
 */
function validatePickupDateTime(pickupdate, pickuptime) {
  if (!pickupdate || !pickuptime) return null; // blank is caught separately
  const combined = new Date(`${pickupdate}T${pickuptime}:00`);
  if (isNaN(combined.getTime())) return 'Invalid date or time format.';
  const now = getNowIST();
  const oneMinuteAgo = new Date(now.getTime() - 60_000); // 1-min grace
  if (combined < oneMinuteAgo) {
    return `Pickup time cannot be in the past. Current time is ${nowTimeStr()}.`;
  }
  return null;
}

// ── Component ──────────────────────────────────────────────────────────────────
const BookCab = () => {
  const { id: carId } = useParams();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fareLoading, setFareLoading] = useState(false);
  const [fareData, setFareData] = useState(null);
  const [fareError, setFareError] = useState('');
  const [dateTimeError, setDateTimeError] = useState('');

  const [form, setForm] = useState({
    selectedPickupCity: '',
    pickupAddress:      '',
    selectedDropCity:   '',
    dropAddress:        '',
    pickupdate:         '',
    pickuptime:         '',
    paymentMethod:      'Cash',
    isScheduled:        false,
  });

  // Track minimum time allowed when date == today
  const [minTime, setMinTime] = useState('');

  // Clear fare data if user changes cities, forcing manual recalculation
  useEffect(() => {
    setFareData(null);
    setFareError('');
  }, [form.selectedPickupCity, form.selectedDropCity]);

  // ── Fetch car ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const { data } = await api.get(`/cars/${carId}`);
        setCar(data);
      } catch {
        toast.error('Car not found');
        navigate('/cabs');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [carId, navigate]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  // ── Date change ────────────────────────────────────────────────────────────
  const handleDateChange = (e) => {
    const date = e.target.value;
    set('pickupdate')(date);
    // Update min time restriction
    if (date === todayStr()) {
      setMinTime(nowTimeStr());
    } else {
      setMinTime('');
    }
    // Re-validate with existing time
    const err = validatePickupDateTime(date, form.pickuptime);
    setDateTimeError(err || '');
  };

  // ── Time change ────────────────────────────────────────────────────────────
  const handleTimeChange = (e) => {
    const time = e.target.value;
    set('pickuptime')(time);
    const err = validatePickupDateTime(form.pickupdate, time);
    setDateTimeError(err || '');
  };

  // ── Manual fare recalculate button ────────────────────────────────────────
  const handleCalculateFare = async () => {
    if (!form.selectedPickupCity || !form.selectedDropCity)
      return toast.error('Please select pickup and drop locations');
    if (form.selectedPickupCity.trim().toLowerCase() === form.selectedDropCity.trim().toLowerCase())
      return toast.error('Pickup and drop locations must be different');

    setFareLoading(true);
    setFareError('');
    try {
      const { data } = await api.post('/bookings/calculate-fare', {
        pickupCity: form.selectedPickupCity,
        dropCity:   form.selectedDropCity,
        cartype:    car?.cartype,
      });
      setFareData(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not calculate fare. Please try again.';
      setFareError(msg);
      setFareData(null);
    } finally {
      setFareLoading(false);
    }
  };

  // ── Book ride ──────────────────────────────────────────────────────────────
  const handleBookRide = async () => {
    if (!form.selectedPickupCity || !form.selectedDropCity)
      return toast.error('Please select pickup and drop locations');
    if (form.selectedPickupCity.trim().toLowerCase() === form.selectedDropCity.trim().toLowerCase())
      return toast.error('Pickup and drop locations must be different');
    if (!form.pickupdate || !form.pickuptime)
      return toast.error('Please select a pickup date and time');
    if (!fareData)
      return toast.error('Please calculate the fare before booking');

    // Frontend date/time validation
    const dtErr = validatePickupDateTime(form.pickupdate, form.pickuptime);
    if (dtErr) {
      setDateTimeError(dtErr);
      return toast.error(dtErr);
    }

    setSubmitting(true);
    try {
      await api.post('/bookings', {
        selectedPickupCity:  form.selectedPickupCity,
        selectedDropCity:    form.selectedDropCity,
        pickupAddress:       form.pickupAddress,
        dropAddress:         form.dropAddress,
        pickupdate:          form.pickupdate,
        pickuptime:          form.pickuptime,
        carId,
        paymentMethod:       form.paymentMethod,
        isScheduled:         form.isScheduled,
        userName:            userInfo?.name,
      });
      toast.success('✅ Booking submitted! A driver will be assigned by admin shortly.');
      navigate('/mybookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-container"><Navbar /><Loader /></div>;

  const isDateTimeInvalid = !!dateTimeError;
  const canBook = !isDateTimeInvalid && form.selectedPickupCity && form.selectedDropCity
    && form.pickupdate && form.pickuptime && fareData;

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="section-title">Book Your Ride</h1>
        <p className="section-subtitle">Intercity cab booking</p>

        {/* Selected Car */}
        {car && (
          <div className="card mb-6 flex items-center gap-4 border-yellow-400/20">
            <div className="w-14 h-14 bg-yellow-400/10 rounded-xl flex items-center justify-center border border-yellow-400/20">
              <Car className="w-7 h-7 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{car.carname}</p>
              <p className="text-sm text-white/40">{car.cartype} · ₹{car.price}/km</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/30">Reg No</p>
              <p className="text-sm font-mono text-white/70">{car.carno}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Form */}
          <div className="space-y-5">

            {/* PICKUP */}
            <div className="card border-yellow-400/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full ring-4 ring-yellow-400/20" />
                <h2 className="font-semibold text-white">Pickup Location</h2>
              </div>
              <div className="space-y-3">
                <LocationSearch
                  label="Pickup City"
                  value={form.selectedPickupCity}
                  onChange={set('selectedPickupCity')}
                />
                <div>
                  <label className="input-label">Pickup Address / Area</label>
                  <input
                    id="pickup-address"
                    type="text"
                    placeholder="e.g. Indiranagar, MG Road, Airport…"
                    value={form.pickupAddress}
                    onChange={(e) => set('pickupAddress')(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* DROP */}
            <div className="card border-blue-400/10 relative z-50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full ring-4 ring-blue-400/20" />
                <h2 className="font-semibold text-white">Drop Location</h2>
              </div>
              <div className="space-y-3">
                <LocationSearch
                  label="Destination City"
                  value={form.selectedDropCity}
                  onChange={set('selectedDropCity')}
                />
                <div>
                  <label className="input-label">Drop Address / Area</label>
                  <input
                    id="drop-address"
                    type="text"
                    placeholder="e.g. Whitefield, Railway Station, Hotel…"
                    value={form.dropAddress}
                    onChange={(e) => set('dropAddress')(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* DATE & TIME */}
            <div className={`card relative z-0 ${isDateTimeInvalid ? 'border-red-400/30' : ''}`}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-yellow-400" />
                <h2 className="font-semibold text-white">Pickup Date &amp; Time</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Date</label>
                  <input
                    id="pickup-date"
                    type="date"
                    value={form.pickupdate}
                    min={todayStr()}
                    onChange={handleDateChange}
                    className={`input${isDateTimeInvalid ? ' input-error' : ''}`}
                  />
                </div>
                <div>
                  <label className="input-label">Time</label>
                  <input
                    id="pickup-time"
                    type="time"
                    value={form.pickuptime}
                    min={form.pickupdate === todayStr() ? minTime : undefined}
                    onChange={handleTimeChange}
                    className={`input${isDateTimeInvalid ? ' input-error' : ''}`}
                  />
                </div>
              </div>

              {/* Inline datetime error */}
              {isDateTimeInvalid && (
                <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-red-400/10 border border-red-400/20">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                  <p className="field-error !mt-0">{dateTimeError}</p>
                </div>
              )}

              {/* Helpful hint */}
              {!isDateTimeInvalid && !form.pickupdate && (
                <p className="text-white/25 text-xs mt-2">
                  ✅ You can book immediately (now) or any future date/time.
                </p>
              )}
            </div>

            {/* PAYMENT */}
            <div>
              <label className="input-label">Payment Method</label>
              <div className="flex gap-3">
                {['Cash', 'Card', 'UPI'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set('paymentMethod')(m)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      form.paymentMethod === m
                        ? 'bg-yellow-400 border-yellow-400 text-black'
                        : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/80'
                    }`}
                    style={{ backgroundColor: form.paymentMethod === m ? '' : '#111116' }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* SCHEDULED */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  form.isScheduled ? 'bg-yellow-400 border-yellow-400' : 'border-white/20 group-hover:border-white/40'
                }`}
                onClick={() => set('isScheduled')(!form.isScheduled)}
              >
                {form.isScheduled && <span className="text-black text-xs font-black">✓</span>}
              </div>
              <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                This is a scheduled / advance booking
              </span>
            </label>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3">
              <button
                id="calculate-fare-btn"
                onClick={handleCalculateFare}
                disabled={fareLoading}
                className="btn-outline flex-1 flex items-center justify-center gap-2"
              >
                {fareLoading
                  ? <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                  : <Calculator className="w-4 h-4" />}
                {fareLoading ? 'Calculating…' : 'Calculate'}
              </button>
              <button
                id="book-ride-btn"
                onClick={handleBookRide}
                disabled={submitting || isDateTimeInvalid || !fareData}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                title={!fareData ? 'Calculate fare first' : (isDateTimeInvalid ? dateTimeError : '')}
              >
                {submitting && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                Book Ride
              </button>
            </div>
          </div>

          {/* RIGHT: Fare Card */}
          <div>
            {fareLoading ? (
              <div className="card border-dashed border-white/10 flex flex-col items-center justify-center min-h-[280px] text-center">
                <div className="w-10 h-10 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mb-4" />
                <p className="text-white/50 text-sm">Calculating fare…</p>
                <p className="text-white/25 text-xs mt-1">Fetching route distance</p>
              </div>
            ) : fareError ? (
              <div className="card border-red-400/20 bg-red-400/5 flex flex-col items-center justify-center min-h-[280px] text-center">
                <AlertCircle className="w-10 h-10 text-red-400/50 mb-3" />
                <p className="text-red-400 font-medium mb-1 text-sm">Fare Calculation Failed</p>
                <p className="text-white/35 text-xs max-w-[200px]">{fareError}</p>
                <button
                  onClick={handleCalculateFare}
                  className="mt-4 text-xs text-yellow-400/70 hover:text-yellow-400 border border-yellow-400/20 hover:border-yellow-400/40 px-3 py-1.5 rounded-lg transition-all"
                >
                  Retry
                </button>
              </div>
            ) : fareData ? (
              <FareCard
                fareData={fareData}
                pickup={form.pickupAddress ? `${form.pickupAddress}, ${form.selectedPickupCity}` : form.selectedPickupCity}
                drop={form.dropAddress ? `${form.dropAddress}, ${form.selectedDropCity}` : form.selectedDropCity}
                cartype={car?.cartype}
              />
            ) : (
              <div className="card border-dashed border-white/10 flex flex-col items-center justify-center min-h-[280px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-yellow-400/5 border border-yellow-400/10 flex items-center justify-center mb-4">
                  <Calculator className="w-8 h-8 text-yellow-400/30" />
                </div>
                <p className="text-white/50 font-medium mb-1">Calculate fare to proceed</p>
                <p className="text-white/30 text-sm">Select pickup and drop locations</p>
              </div>
            )}

            {/* Route summary */}
            {form.selectedPickupCity && form.selectedDropCity && (
              <div className="mt-4 card border-white/5 text-sm space-y-2">
                <p className="text-white/40 text-xs uppercase tracking-wider font-semibold mb-2">Route Summary</p>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">{form.selectedPickupCity}</p>
                    {form.pickupAddress && <p className="text-white/40 text-xs">{form.pickupAddress}</p>}
                  </div>
                </div>
                <div className="ml-1 w-px h-4 bg-white/10" />
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">{form.selectedDropCity}</p>
                    {form.dropAddress && <p className="text-white/40 text-xs">{form.dropAddress}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookCab;
