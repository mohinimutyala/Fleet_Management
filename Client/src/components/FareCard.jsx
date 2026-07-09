import { MapPin, Navigation, Calculator } from 'lucide-react';

const FareCard = ({ fareData, pickup, drop, cartype }) => {
  if (!fareData) return null;
  return (
    <div className="card border-yellow-400/20 bg-yellow-400/5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-yellow-400" />
        <h3 className="font-bold text-white">Fare Estimate</h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <MapPin className="w-3.5 h-3.5 text-yellow-400" />
            Route
          </div>
          <span className="text-sm font-medium text-white">{pickup} → {drop}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-sm text-white/60">Distance</span>
          <span className="text-sm font-medium text-white">{fareData.distance} km</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-sm text-white/60">Base Fare</span>
          <span className="text-sm font-medium text-white">₹{fareData.base}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-sm text-white/60">Rate</span>
          <span className="text-sm font-medium text-white">₹{fareData.perKm}/km</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="font-bold text-white">Total Fare</span>
          <span className="text-2xl font-bold text-yellow-400">₹{fareData.totalFare}</span>
        </div>
      </div>
    </div>
  );
};

export default FareCard;
