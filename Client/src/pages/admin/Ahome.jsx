import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import StatsCard from '../../components/StatsCard';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Car, BookOpen, Truck, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Ahome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const monthlyChart = stats?.monthlyData?.map((d) => ({
    month: MONTH_NAMES[d._id - 1] || d._id,
    bookings: d.count,
  })) || [];

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-white">Fleet Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Welcome back, Admin. Here's your fleet overview.</p>
          </div>

          {loading ? <Loader /> : (
            <>
              {/* Alert: Pending Bookings */}
              {(stats?.pendingBookings || 0) > 0 && (
                <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/25">
                  <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
                  <p className="text-yellow-400 text-sm font-medium">
                    {stats.pendingBookings} booking{stats.pendingBookings > 1 ? 's' : ''} awaiting driver assignment
                    <a href="/admin/pending-bookings" className="ml-2 underline hover:text-yellow-300">Assign now →</a>
                  </p>
                </div>
              )}

              {/* Row 1: Core Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatsCard title="Total Users" value={stats?.users} to="/admin/users" icon={Users} color="blue" />
                <StatsCard title="Total Vehicles" value={stats?.cabs} to="/admin/cabs" icon={Car} color="yellow" />
                <StatsCard title="Total Bookings" value={stats?.bookings} to="/admin/bookings" icon={BookOpen} color="green" />
                <StatsCard title="Total Drivers" value={stats?.drivers} to="/admin/drivers" icon={Truck} color="purple" />
              </div>

              {/* Row 2: Fleet Status */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="card border-green-400/20">
                  <p className="text-xs text-white/40 mb-1">Available Vehicles</p>
                  <p className="text-3xl font-black text-green-400">{stats?.availableVehicles ?? 0}</p>
                </div>
                <div className="card border-yellow-400/20">
                  <p className="text-xs text-white/40 mb-1">Booked Vehicles</p>
                  <p className="text-3xl font-black text-yellow-400">{stats?.bookedVehicles ?? 0}</p>
                </div>
                <div className="card border-red-400/20">
                  <p className="text-xs text-white/40 mb-1">Maintenance</p>
                  <p className="text-3xl font-black text-red-400">{stats?.maintenanceVehicles ?? 0}</p>
                </div>
              </div>

              {/* Row 3: Driver & Booking Status */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="card border-green-400/20">
                  <p className="text-xs text-white/40 mb-1">Drivers Available</p>
                  <p className="text-3xl font-black text-green-400">{stats?.availableDrivers ?? 0}</p>
                </div>
                <div className="card border-orange-400/20">
                  <p className="text-xs text-white/40 mb-1">Drivers Busy</p>
                  <p className="text-3xl font-black text-orange-400">{stats?.busyDrivers ?? 0}</p>
                </div>
                <div className="card border-yellow-400/20 cursor-pointer hover:border-yellow-400/40 transition-colors" onClick={() => window.location.href='/admin/pending-bookings'}>
                  <p className="text-xs text-white/40 mb-1">Pending Bookings</p>
                  <p className="text-3xl font-black text-yellow-400">{stats?.pendingBookings ?? 0}</p>
                </div>
                <div className="card border-blue-400/20">
                  <p className="text-xs text-white/40 mb-1">Completed Trips</p>
                  <p className="text-3xl font-black text-blue-400">{stats?.completedTrips ?? 0}</p>
                </div>
              </div>

              {/* Revenue Cards — 3-way financial split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {/* Gross Revenue */}
                <div className="card border-yellow-400/20 bg-yellow-400/3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center border border-yellow-400/20">
                      <DollarSign className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Gross Revenue (GMV)</p>
                      <p className="text-2xl font-black text-yellow-400">₹{stats?.grossRevenue?.toFixed(0) || 0}</p>
                    </div>
                  </div>
                  <div className="border-t border-white/5 pt-2 grid grid-cols-2 gap-1 text-xs">
                    <div><p className="text-white/30">Today</p><p className="text-yellow-400/80 font-semibold">₹{stats?.todayGross?.toFixed(0) || 0}</p></div>
                    <div><p className="text-white/30">This Month</p><p className="text-yellow-400/80 font-semibold">₹{stats?.monthlyGross?.toFixed(0) || 0}</p></div>
                  </div>
                </div>

                {/* Platform Revenue */}
                <div className="card border-green-400/20 bg-green-400/3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center border border-green-400/20">
                      <Zap className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Platform Revenue (70%)</p>
                      <p className="text-2xl font-black text-green-400">₹{stats?.platformRevenue?.toFixed(0) || 0}</p>
                    </div>
                  </div>
                  <div className="border-t border-white/5 pt-2 grid grid-cols-2 gap-1 text-xs">
                    <div><p className="text-white/30">Today</p><p className="text-green-400/80 font-semibold">₹{stats?.todayPlatform?.toFixed(0) || 0}</p></div>
                    <div><p className="text-white/30">This Month</p><p className="text-green-400/80 font-semibold">₹{stats?.monthlyPlatform?.toFixed(0) || 0}</p></div>
                  </div>
                </div>

                {/* Driver Payout */}
                <div className="card border-blue-400/20 bg-blue-400/3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center border border-blue-400/20">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Driver Payout (30%)</p>
                      <p className="text-2xl font-black text-blue-400">₹{stats?.driverPayout?.toFixed(0) || 0}</p>
                    </div>
                  </div>
                  <div className="border-t border-white/5 pt-2 grid grid-cols-2 gap-1 text-xs">
                    <div><p className="text-white/30">Today</p><p className="text-blue-400/80 font-semibold">₹{stats?.todayPayout?.toFixed(0) || 0}</p></div>
                    <div><p className="text-white/30">This Month</p><p className="text-blue-400/80 font-semibold">₹{stats?.monthlyPayout?.toFixed(0) || 0}</p></div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="card">
                  <h3 className="text-sm font-semibold text-white/60 mb-4">Monthly Bookings</h3>
                  {monthlyChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={monthlyChart} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                        <Bar dataKey="bookings" fill="#f5c518" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-52 flex items-center justify-center text-white/20 text-sm">No booking data yet</div>
                  )}
                </div>

                <div className="card">
                  <h3 className="text-sm font-semibold text-white/60 mb-4">Fleet Status</h3>
                  <div className="space-y-4 py-4">
                    {[
                      { label: 'Available Vehicles', value: stats?.availableVehicles ?? 0, total: stats?.cabs ?? 1, color: 'bg-green-400' },
                      { label: 'Booked Vehicles', value: stats?.bookedVehicles ?? 0, total: stats?.cabs ?? 1, color: 'bg-yellow-400' },
                      { label: 'Drivers Available', value: stats?.availableDrivers ?? 0, total: stats?.drivers ?? 1, color: 'bg-blue-400' },
                      { label: 'Drivers Busy', value: stats?.busyDrivers ?? 0, total: stats?.drivers ?? 1, color: 'bg-orange-400' },
                    ].map(({ label, value, total, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-white/50 mb-1">
                          <span>{label}</span><span>{value}/{total}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent bookings */}
              {stats?.recentBookings?.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-white/60 mb-4">Recent Bookings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="table-header">
                          <th className="px-3 py-2 text-left">Route</th>
                          <th className="px-3 py-2 text-left">Customer</th>
                          <th className="px-3 py-2 text-left">Vehicle</th>
                          <th className="px-3 py-2 text-left">Fare</th>
                          <th className="px-3 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentBookings.map((b) => (
                          <tr key={b._id} className="table-row">
                            <td className="px-3 py-2 text-white/70">{b.selectedPickupCity} → {b.selectedDropCity}</td>
                            <td className="px-3 py-2 text-white/50">{b.userName || '—'}</td>
                            <td className="px-3 py-2 text-white/50">{b.carname || '—'}</td>
                            <td className="px-3 py-2 text-yellow-400 font-medium">₹{b.fare}</td>
                            <td className="px-3 py-2">
                              <span className={b.bookingStatus === 'Completed' ? 'badge-completed' : b.bookingStatus === 'Cancelled' ? 'badge-cancelled' : b.bookingStatus === 'Confirmed' ? 'badge-confirmed' : 'badge-pending'}>
                                {b.bookingStatus || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Ahome;