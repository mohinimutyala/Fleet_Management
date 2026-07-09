import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Car, MapPin, DollarSign, Hash } from 'lucide-react';

const Dvehicle = () => {
  const { driverInfo } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        // First try from profile (if vehicle is linked)
        const { data: profile } = await api.get('/drivers/profile');

        if (profile.vehicle) {
          setVehicle(profile.vehicle);
        } else {
          // Fallback: find car by driver name
          const { data: cars } = await api.get('/cars');
          const myCar = cars.find(
            (c) => c.drivername?.toLowerCase() === profile.name?.toLowerCase()
          );
          setVehicle(myCar || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const InfoRow = ({ label, value, accent }) => (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/40">{label}</span>
      <span className={`text-sm font-medium ${accent || 'text-white'}`}>{value || '—'}</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <h1 className="text-2xl font-black text-white mb-2">My Vehicle</h1>
        <p className="text-white/40 text-sm mb-6">Your assigned vehicle details</p>

        {loading ? <Loader /> : vehicle ? (
          <div className="max-w-md">
            <div className="card border-yellow-400/20">
              {/* Car Image */}
              <div className="w-full h-48 bg-white/5 rounded-xl overflow-hidden mb-5 flex items-center justify-center border border-white/10">
                {vehicle.carImage ? (
                  <img src={vehicle.carImage} alt={vehicle.carname} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Car className="w-16 h-16 text-white/10" />
                    <span className="text-xs text-white/20">No image uploaded</span>
                  </div>
                )}
              </div>

              {/* Car Name Badge */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center border border-yellow-400/20">
                  <Car className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{vehicle.carname}</h2>
                  <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
                    {vehicle.cartype}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-0">
                <InfoRow label="Registration Number" value={vehicle.carno} />
                <InfoRow label="Price per km" value={`₹${vehicle.price}`} accent="text-yellow-400" />
                <InfoRow
                  label="Availability"
                  value={vehicle.isAvailable ? 'Available' : 'Unavailable'}
                  accent={vehicle.isAvailable ? 'text-green-400' : 'text-red-400'}
                />
                <InfoRow label="Driver Name" value={vehicle.drivername} />
              </div>
            </div>
          </div>
        ) : (
          <div className="card max-w-md text-center py-14 border-dashed">
            <Car className="w-14 h-14 text-white/10 mx-auto mb-3" />
            <p className="text-white/40 font-medium">No vehicle assigned</p>
            <p className="text-white/20 text-sm mt-1">Contact admin to assign a vehicle to your account.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dvehicle;
