import { User, Car, Phone, Star } from 'lucide-react';

const DriverCard = ({ driver }) => (
  <div className="card hover:border-yellow-400/20 transition-all duration-300">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center border border-yellow-400/30">
        <User className="w-6 h-6 text-yellow-400" />
      </div>
      <div>
        <h3 className="font-bold text-white">{driver.name}</h3>
        <p className="text-xs text-white/40">{driver.email}</p>
      </div>
      <div className={`ml-auto flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${driver.isOnline ? 'bg-green-400/15 text-green-400' : 'bg-white/10 text-white/40'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${driver.isOnline ? 'bg-green-400' : 'bg-white/30'}`} />
        {driver.isOnline ? 'Online' : 'Offline'}
      </div>
    </div>
    <div className="space-y-2 text-sm">
      {driver.phone && (
        <div className="flex items-center gap-2 text-white/50">
          <Phone className="w-3.5 h-3.5 text-yellow-400/60" />
          <span>{driver.phone}</span>
        </div>
      )}
      {driver.licenseNo && (
        <div className="flex items-center gap-2 text-white/50">
          <Car className="w-3.5 h-3.5 text-yellow-400/60" />
          <span>License: {driver.licenseNo}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-white/50">
        <Star className="w-3.5 h-3.5 text-yellow-400" />
        <span>Rating: {driver.rating?.toFixed(1) || '5.0'}</span>
      </div>
      <div className="flex items-center gap-2 text-white/50">
        <span className="text-white/30">Total Rides:</span>
        <span>{driver.totalRides || 0}</span>
      </div>
      <div className="flex items-center gap-2 text-white/50">
        <span className="text-white/30">Earnings:</span>
        <span className="text-yellow-400">₹{driver.totalEarnings?.toFixed(0) || 0}</span>
      </div>
    </div>
  </div>
);

export default DriverCard;
