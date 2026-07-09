import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Car, BookOpen, BarChart3, Truck, Settings, LogOut, X, Menu, Clock,
} from 'lucide-react';
import { useState } from 'react';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/pending-bookings', label: 'Pending Bookings', icon: Clock },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/cabs', label: 'Fleet', icon: Car },
  { to: '/admin/bookings', label: 'All Bookings', icon: BookOpen },
  { to: '/admin/drivers', label: 'Drivers', icon: Truck },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const { adminInfo, logoutAdmin, driverInfo, logoutDriver } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Use URL path to determine which portal we're in (prevents role collision)
  const isDriverPath = location.pathname.startsWith('/driver');
  const isAdmin = !isDriverPath && !!adminInfo;
  const isDriver = isDriverPath && !!driverInfo;

  const driverLinks = [
    { to: '/driver', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/driver/rides', label: 'Rides', icon: Car },
    { to: '/driver/earnings', label: 'Earnings', icon: BarChart3 },
  ];

  const links = isAdmin ? adminLinks : driverLinks;

  const handleLogout = () => {
    if (isAdmin) { logoutAdmin(); navigate('/admin/login'); }
    else { logoutDriver(); navigate('/driver/login'); }
  };

  const info = isAdmin ? adminInfo : driverInfo;

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 h-screen sticky top-0 bg-black/60 backdrop-blur-xl border-r border-white/10 flex flex-col`}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <Link to={isAdmin ? '/admin' : '/driver'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-white">Cab<span className="text-yellow-400">Go</span></span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white/50 hover:text-white p-1">
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{isAdmin ? 'Admin' : 'Driver'}</p>
          <p className="text-sm font-semibold text-white truncate">{info?.name}</p>
          <p className="text-xs text-white/40 truncate">{info?.email}</p>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${active ? 'bg-yellow-400/15 text-yellow-400 border border-yellow-400/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
              title={collapsed ? label : ''}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
              {active && !collapsed && <span className="ml-auto w-1.5 h-1.5 bg-yellow-400 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 w-full transition-all`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
