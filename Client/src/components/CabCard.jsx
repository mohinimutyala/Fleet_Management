import { useNavigate } from 'react-router-dom';
import { Car, User, CreditCard, Navigation } from 'lucide-react';

const CabCard = ({ cab }) => {
  const navigate = useNavigate();
  const imageUrl = cab.carImage ? (cab.carImage.startsWith('/uploads') ? cab.carImage : cab.carImage) : null;

  return (
    <div className="card group hover:scale-[1.02] transition-all duration-300 hover:border-yellow-400/30 flex flex-col">
      {/* Image */}
      <div className="relative w-full h-44 bg-white/5 rounded-xl overflow-hidden mb-4">
        {imageUrl ? (
          <img src={imageUrl} alt={cab.carname} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-16 h-16 text-white/20" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg border border-yellow-400/20">
          ₹{cab.price}/km
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white/80 text-xs px-2 py-1 rounded-lg">
          {cab.cartype}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 space-y-2 mb-4">
        <h3 className="font-bold text-white text-lg">{cab.carname}</h3>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Navigation className="w-3.5 h-3.5 text-yellow-400/60" />
            <span>{cab.carno}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <User className="w-3.5 h-3.5 text-yellow-400/60" />
            <span>Status: {cab.vehicleStatus || 'Available'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <CreditCard className="w-3.5 h-3.5 text-yellow-400/60" />
            <span>₹{cab.price} per kilometer</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/book/${cab._id}`)}
        className="btn-primary w-full text-center text-sm"
      >
        Book Cab
      </button>
    </div>
  );
};

export default CabCard;
