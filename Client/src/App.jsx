import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Public pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// User pages
import Uhome from './pages/user/Uhome';
import Cabs from './pages/user/Cabs';
import BookCab from './pages/user/BookCab';
import Mybookings from './pages/user/Mybookings';
import Profile from './pages/user/Profile';
import Receipt from './pages/user/Receipt';
import RideTracking from './pages/user/RideTracking';
import ScheduledBookings from './pages/user/ScheduledBookings';

// Admin pages
import Alogin from './pages/admin/Alogin';
import Aregister from './pages/admin/Aregister';
import Ahome from './pages/admin/Ahome';
import Users from './pages/admin/Users';
import UserEdit from './pages/admin/UserEdit';
import Bookings from './pages/admin/Bookings';
import Acabs from './pages/admin/Acabs';
import Addcar from './pages/admin/Addcar';
import Acabedit from './pages/admin/Acabedit';
import Drivers from './pages/admin/Drivers';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import PendingBookings from './pages/admin/PendingBookings';

// Driver pages
import Dlogin from './pages/driver/Dlogin';
import Dregister from './pages/driver/Dregister';
import Dhome from './pages/driver/Dhome';
import Drides from './pages/driver/Drides';
import Dearnings from './pages/driver/Dearnings';
import Dvehicle from './pages/driver/Dvehicle';

// Protected route wrappers
const UserRoute = ({ children }) => {
  const { userInfo } = useAuth();
  return userInfo ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { adminInfo } = useAuth();
  return adminInfo ? children : <Navigate to="/admin/login" replace />;
};

const DriverRoute = ({ children }) => {
  const { driverInfo } = useAuth();
  return driverInfo ? children : <Navigate to="/driver/login" replace />;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* User Routes */}
    <Route path="/home" element={<UserRoute><Uhome /></UserRoute>} />
    <Route path="/cabs" element={<UserRoute><Cabs /></UserRoute>} />
    <Route path="/book/:id" element={<UserRoute><BookCab /></UserRoute>} />
    <Route path="/mybookings" element={<UserRoute><Mybookings /></UserRoute>} />
    <Route path="/scheduled" element={<UserRoute><ScheduledBookings /></UserRoute>} />
    <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />
    <Route path="/receipt/:id" element={<UserRoute><Receipt /></UserRoute>} />
    <Route path="/tracking/:id" element={<UserRoute><RideTracking /></UserRoute>} />

    {/* Admin Routes */}
    <Route path="/admin/login" element={<Alogin />} />
    <Route path="/admin/register" element={<Aregister />} />
    <Route path="/admin" element={<AdminRoute><Ahome /></AdminRoute>} />
    <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
    <Route path="/admin/users/edit/:id" element={<AdminRoute><UserEdit /></AdminRoute>} />
    <Route path="/admin/bookings" element={<AdminRoute><Bookings /></AdminRoute>} />
    <Route path="/admin/cabs" element={<AdminRoute><Acabs /></AdminRoute>} />
    <Route path="/admin/cars/add" element={<AdminRoute><Addcar /></AdminRoute>} />
    <Route path="/admin/cars/edit/:id" element={<AdminRoute><Acabedit /></AdminRoute>} />
    <Route path="/admin/drivers" element={<AdminRoute><Drivers /></AdminRoute>} />
    <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
    <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
    <Route path="/admin/pending-bookings" element={<AdminRoute><PendingBookings /></AdminRoute>} />

    {/* Driver Routes */}
    <Route path="/driver/login" element={<Dlogin />} />
    <Route path="/driver/register" element={<Dregister />} />
    <Route path="/driver" element={<DriverRoute><Dhome /></DriverRoute>} />
    <Route path="/driver/rides" element={<DriverRoute><Drides /></DriverRoute>} />
    <Route path="/driver/earnings" element={<DriverRoute><Dearnings /></DriverRoute>} />
    <Route path="/driver/vehicle" element={<DriverRoute><Dvehicle /></DriverRoute>} />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#111114', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
              success: { iconTheme: { primary: '#f5c518', secondary: '#000' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
