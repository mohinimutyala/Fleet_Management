import { Car } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-black/60 border-t border-white/10 py-8 mt-auto">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center">
          <Car className="w-4 h-4 text-black" />
        </div>
        <span className="font-bold text-white text-sm">Cab<span className="text-yellow-400">Go</span></span>
      </Link>
      <p className="text-white/30 text-xs">© {new Date().getFullYear()} CabGo. All rights reserved.</p>
      <div className="flex gap-4 text-xs text-white/30">
        <span>Privacy Policy</span>
        <span>Terms of Service</span>
        <span>Support</span>
      </div>
    </div>
  </footer>
);

export default Footer;
