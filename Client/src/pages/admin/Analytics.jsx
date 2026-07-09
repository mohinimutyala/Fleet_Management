import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, DollarSign, Car, BookOpen } from 'lucide-react';

const COLORS = ['#f5c518', '#3b82f6', '#22c55e', '#a855f7', '#f97316'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Analytics = () => {
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

  const pieData = [
    { name: 'Users', value: stats?.users || 0 },
    { name: 'Drivers', value: stats?.drivers || 0 },
    { name: 'Cabs', value: stats?.cabs || 0 },
  ];

  const monthlyChart = stats?.monthlyData?.map((d) => ({
    month: MONTH_NAMES[d._id - 1] || d._id,
    bookings: d.count,
  })) || [];

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-white/40 text-sm">Platform performance overview</p>
        </div>

        {loading ? <Loader /> : (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toFixed(0) || 0}`, icon: DollarSign, color: 'text-yellow-400' },
                { label: 'Total Bookings', value: stats?.bookings, icon: BookOpen, color: 'text-blue-400' },
                { label: 'Total Cabs', value: stats?.cabs, icon: Car, color: 'text-green-400' },
                { label: 'Active Drivers', value: stats?.drivers, icon: TrendingUp, color: 'text-purple-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="card">
                  <Icon className={`w-5 h-5 ${color} mb-2`} />
                  <p className="text-xs text-white/40">{label}</p>
                  <p className={`text-3xl font-black ${color}`}>{value ?? '—'}</p>
                </div>
              ))}
            </div>

            {/* Monthly line chart */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white/60 mb-4">Monthly Bookings Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                  <Line type="monotone" dataKey="bookings" stroke="#f5c518" strokeWidth={2} dot={{ fill: '#f5c518' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-sm font-semibold text-white/60 mb-4">Platform Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                    <Legend formatter={(v) => <span style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h3 className="text-sm font-semibold text-white/60 mb-4">Platform Bar Summary</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[{ name: 'Users', v: stats?.users }, { name: 'Drivers', v: stats?.drivers }, { name: 'Cabs', v: stats?.cabs }, { name: 'Bookings', v: stats?.bookings }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                    <Bar dataKey="v" fill="#a855f7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analytics;
