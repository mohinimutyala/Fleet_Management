import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Menu, X, Bell, User, LogOut } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { userInfo, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center group-hover:bg-yellow-300 transition-colors">
              <Car className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-lg text-white">Cab<span className="text-yellow-400">Go</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {userInfo ? (
              <>
                <Link to="/home" className="nav-link hover:text-yellow-400">Home</Link>
                <Link to="/cabs" className="nav-link hover:text-yellow-400">Book Cab</Link>
                <Link to="/mybookings" className="nav-link hover:text-yellow-400">My Bookings</Link>
                <Link to="/scheduled" className="nav-link hover:text-yellow-400">Scheduled</Link>
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <User className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-white/80">{userInfo.name?.split(' ')[0]}</span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-1 text-red-400/70 hover:text-red-400 transition-colors text-sm">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/" className="nav-link hover:text-yellow-400">Home</Link>
                <Link to="/login" className="btn-outline !py-2 !px-4 text-sm">Login</Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-white/70 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/10 px-4 py-4 space-y-3 animate-fade-in">
          {userInfo ? (
            <>
              <Link to="/home" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/cabs" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>Book Cab</Link>
              <Link to="/mybookings" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>My Bookings</Link>
              <Link to="/profile" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="block text-red-400 text-sm py-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
