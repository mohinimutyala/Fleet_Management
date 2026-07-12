import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from 'recharts';
import { RefreshCw, ChevronUp, ChevronDown, ChevronsUpDown, AlertTriangle, WifiOff } from 'lucide-react';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmt = (n) =>
  `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
};

// ── Status badge ──────────────────────────────────────────────────────────────
function BookingBadge({ status }) {
  const map = {
    Pending:   'badge-pending',
    Confirmed: 'badge-confirmed',
    Completed: 'badge-completed',
    Cancelled: 'badge-cancelled',
  };
  return <span className={map[status] || 'badge-pending'}>{status || 'Pending'}</span>;
}

// ── ERP card wrapper ──────────────────────────────────────────────────────────
function ERPCard({ title, extra, link, linkLabel, children, className = '' }) {
  return (
    <div className={`erp-card ${className}`}>
      <div className="erp-card-header">
        <span className="erp-card-title">{title}</span>
        <div className="flex items-center gap-3">
          {extra}
          {link && (
            <a href={link} className="text-xs text-yellow-400/60 hover:text-yellow-400 transition-colors">
              {linkLabel || 'View all →'}
            </a>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Sortable Recent Bookings ──────────────────────────────────────────────────
function RecentBookingsTable({ bookings }) {
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...bookings].sort((a, b) => {
    let av = a[sortKey] ?? '';
    let bv = b[sortKey] ?? '';
    if (sortKey === 'fare') { av = parseFloat(av) || 0; bv = parseFloat(bv) || 0; }
    if (sortKey === 'createdAt') { av = new Date(av).getTime(); bv = new Date(bv).getTime(); }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return <ChevronsUpDown className="inline w-3 h-3 ml-0.5 opacity-25" />;
    return sortDir === 'asc'
      ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-yellow-400" />
      : <ChevronDown className="inline w-3 h-3 ml-0.5 text-yellow-400" />;
  };

  const cols = [
    { key: '_id',                label: 'Booking ID' },
    { key: 'userName',           label: 'Customer' },
    { key: 'selectedPickupCity', label: 'Pickup' },
    { key: 'selectedDropCity',   label: 'Destination' },
    { key: 'drivername',         label: 'Driver' },
    { key: 'carname',            label: 'Vehicle' },
    { key: 'bookingStatus',      label: 'Status' },
    { key: 'fare',               label: 'Fare',    right: true },
    { key: 'createdAt',          label: 'Date',    right: true },
  ];

  return (
    <div className="overflow-x-auto" style={{ maxHeight: 340, overflowY: 'auto' }}>
      <table className="erp-table">
        <thead>
          <tr>
            {cols.map(c => (
              <th
                key={c.key}
                className={`erp-th sortable${c.right ? ' text-right' : ''}`}
                onClick={() => handleSort(c.key)}
              >
                {c.label}<SortIcon k={c.key} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(b => (
            <tr key={b._id} className="erp-tr">
              <td className="erp-td font-mono text-xs text-white/35">#{String(b._id).slice(-8)}</td>
              <td className="erp-td">{b.userName || b.userId?.name || '—'}</td>
              <td className="erp-td">{b.selectedPickupCity || '—'}</td>
              <td className="erp-td">{b.selectedDropCity || '—'}</td>
              <td className="erp-td">{b.drivername || <span className="text-white/25 italic text-xs">Unassigned</span>}</td>
              <td className="erp-td">{b.carname || '—'}</td>
              <td className="erp-td"><BookingBadge status={b.bookingStatus} /></td>
              <td className="erp-td text-right text-yellow-400 font-semibold">
                {b.fare ? fmt(parseFloat(b.fare)) : '—'}
              </td>
              <td className="erp-td text-right text-white/40 text-xs">{fmtDate(b.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Ahome = () => {
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else         setRefreshing(true);
    setError('');
    try {
      const { data } = await api.get('/admin/dashboard');
      // Normalise array fields so tables never show "empty" due to missing key
      data.recentBookings      = Array.isArray(data.recentBookings)      ? data.recentBookings      : [];
      data.monthlyData         = Array.isArray(data.monthlyData)         ? data.monthlyData         : [];
      data.monthlyRevenueTrend = Array.isArray(data.monthlyRevenueTrend) ? data.monthlyRevenueTrend : [];
      // Debug log — remove once data is confirmed live
      console.debug('[Dashboard API]', {
        drivers: { total: data.drivers, available: data.availableDrivers, busy: data.busyDrivers, offline: data.offlineDrivers },
        vehicles: { total: data.cabs, available: data.availableVehicles, booked: data.bookedVehicles, maintenance: data.maintenanceVehicles },
        bookings: { pending: data.pendingBookings, confirmed: data.confirmedBookings, inProgress: data.inProgressBookings, completed: data.completedBookings, cancelled: data.cancelledBookings },
        todayActivity: { new: data.newBookingsToday, started: data.tripsStartedToday, completed: data.tripsCompletedToday, cancelled: data.cancellationsToday },
      });
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[Dashboard] fetch error:', err);
      setError(err.response?.data?.message || 'Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + 15-second auto-refresh
  useEffect(() => {
    fetchStats();
    const id = setInterval(() => fetchStats(true), 15_000);
    return () => clearInterval(id);
  }, [fetchStats]);

  // ── Derived values ──────────────────────────────────────────────────────
  // Booking summary total: use raw bookings count from DB
  const totalBk = Math.max(stats?.bookings ?? 1, 1);
  const pct = n => `${Math.round(((n || 0) / totalBk) * 100)}%`;

  const monthlyBookingsChart = (stats?.monthlyData || []).map(d => ({
    month: MONTH_NAMES[(d._id ?? 1) - 1],
    bookings: d.count,
  }));

  const utilizationChart = [
    { label: 'Available', value: stats?.availableVehicles   ?? 0, color: '#4ade80' },
    { label: 'Booked',    value: stats?.bookedVehicles      ?? 0, color: '#60a5fa' },
    { label: 'Maint.',    value: stats?.maintenanceVehicles ?? 0, color: '#fb923c' },
  ];

  // Alerts — only non-zero items, auto-disappear when resolved
  const alerts = [];
  if ((stats?.pendingBookings    ?? 0) > 0)
    alerts.push({ msg: `${stats.pendingBookings} booking${stats.pendingBookings > 1 ? 's' : ''} waiting for driver assignment`, href: '/admin/pending-bookings' });
  if ((stats?.maintenanceVehicles ?? 0) > 0)
    alerts.push({ msg: `${stats.maintenanceVehicles} vehicle${stats.maintenanceVehicles > 1 ? 's' : ''} in maintenance`, href: '/admin/cabs' });
  if ((stats?.pendingPaymentsCount ?? 0) > 0)
    alerts.push({ msg: `${stats.pendingPaymentsCount} completed trip${stats.pendingPaymentsCount > 1 ? 's' : ''} with pending payment`, href: '/admin/bookings' });

  const tooltipStyle = {
    contentStyle: {
      background: '#111114', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 6, fontSize: 11, color: '#fff',
    },
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-5 space-y-3">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Fleet Dashboard</h1>
              <p className="text-white/30 text-xs mt-0.5">
                {error
                  ? <span className="text-red-400/80">Connection error</span>
                  : lastUpdated
                    ? `Updated ${lastUpdated.toLocaleTimeString('en-IN')} · auto-refreshes every 15 s`
                    : 'Loading…'}
              </p>
            </div>
            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* ── API Error ── */}
          {error && !loading && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <WifiOff className="w-5 h-5 text-red-400 shrink-0" />
              <div className="flex-1">
                <p className="text-red-400 text-sm font-medium">Dashboard data unavailable</p>
                <p className="text-red-400/60 text-xs">{error}</p>
              </div>
              <button onClick={() => fetchStats()} className="text-xs text-red-400/70 hover:text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg">
                Retry
              </button>
            </div>
          )}

          {loading ? <Loader /> : (
            <>
              {/* ── ALERTS — full width, top ── */}
              {alerts.length > 0 && (
                <div className="erp-card overflow-hidden">
                  {alerts.map((a, i) => (
                    <div key={i} className="alert-row">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="flex-1 text-xs">{a.msg}</span>
                      <a href={a.href} className="text-xs text-yellow-400/70 hover:text-yellow-400 transition-colors shrink-0">
                        Fix →
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* ── ROW 1: Fleet Summary | Booking Summary ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                <ERPCard title="Fleet Summary">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th className="erp-th">Resource</th>
                        <th className="erp-th text-right">Total</th>
                        <th className="erp-th text-right">Available</th>
                        <th className="erp-th text-right">Busy</th>
                        <th className="erp-th text-right">Offline</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="erp-tr">
                        <td className="erp-td font-semibold text-white/80">Drivers</td>
                        {/* Total = Available + Busy + Offline */}
                        <td className="erp-td text-right num-gray">{stats?.drivers ?? 0}</td>
                        <td className="erp-td text-right num-green">{stats?.availableDrivers ?? 0}</td>
                        <td className="erp-td text-right num-blue">{stats?.busyDrivers ?? 0}</td>
                        <td className="erp-td text-right num-gray">{stats?.offlineDrivers ?? 0}</td>
                      </tr>
                      <tr className="erp-tr">
                        <td className="erp-td font-semibold text-white/80">Vehicles</td>
                        {/* Total = Available + Booked + Maintenance */}
                        <td className="erp-td text-right num-gray">{stats?.cabs ?? 0}</td>
                        <td className="erp-td text-right num-green">{stats?.availableVehicles ?? 0}</td>
                        <td className="erp-td text-right num-blue">{stats?.bookedVehicles ?? 0}</td>
                        <td className="erp-td text-right num-orange">{stats?.maintenanceVehicles ?? 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </ERPCard>

                <ERPCard title="Booking Summary" link="/admin/bookings">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th className="erp-th">Status</th>
                        <th className="erp-th text-right">Count</th>
                        <th className="erp-th text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Pending',     val: stats?.pendingBookings    ?? 0, cls: 'num-yellow' },
                        { label: 'Confirmed',   val: stats?.confirmedBookings  ?? 0, cls: 'num-blue' },
                        { label: 'In Progress', val: stats?.inProgressBookings ?? 0, cls: 'num-orange' },
                        { label: 'Completed',   val: stats?.completedBookings  ?? 0, cls: 'num-green' },
                        { label: 'Cancelled',   val: stats?.cancelledBookings  ?? 0, cls: 'num-red' },
                      ].map(({ label, val, cls }) => (
                        <tr key={label} className="erp-tr">
                          <td className="erp-td">{label}</td>
                          <td className={`erp-td text-right ${cls}`}>{val}</td>
                          <td className="erp-td text-right text-white/30">{pct(val)}</td>
                        </tr>
                      ))}
                      <tr className="erp-tr">
                        <td className="erp-td total-row">Total</td>
                        <td className="erp-td total-row text-right">{stats?.bookings ?? 0}</td>
                        <td className="erp-td total-row text-right text-white/35">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </ERPCard>
              </div>

              {/* ── ROW 2: Today's Activity (full width) ── */}
              <ERPCard
                title="Today's Activity"
                extra={
                  <span className="text-xs text-white/30">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })}
                  </span>
                }
              >
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th className="erp-th" style={{ width: '50%' }}>Event</th>
                      <th className="erp-th text-right">Count</th>
                      <th className="erp-th text-right" style={{ width: '40%' }}>What it means</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'New Bookings',    val: stats?.newBookingsToday    ?? 0, cls: 'num-yellow', desc: 'Created today' },
                      { label: 'Trips Started',   val: stats?.tripsStartedToday   ?? 0, cls: 'num-blue',   desc: 'Driver picked up customer' },
                      { label: 'Trips Completed', val: stats?.tripsCompletedToday ?? 0, cls: 'num-green',  desc: 'Fare settled' },
                      { label: 'Cancellations',   val: stats?.cancellationsToday  ?? 0, cls: 'num-red',    desc: 'Cancelled today' },
                    ].map(({ label, val, cls, desc }) => (
                      <tr key={label} className="erp-tr">
                        <td className="erp-td font-medium">{label}</td>
                        <td className={`erp-td text-right text-lg font-black ${cls}`}>{val}</td>
                        <td className="erp-td text-right text-white/30 text-xs">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ERPCard>

              {/* ── ROW 3: Earnings Summary (full width) ── */}
              <ERPCard
                title="Earnings Summary"
                extra={<span className="text-xs text-white/30">Completed trips only</span>}
              >
                <div className="overflow-x-auto">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th className="erp-th">Metric</th>
                        <th className="erp-th text-right">Today</th>
                        <th className="erp-th text-right">This Week</th>
                        <th className="erp-th text-right">This Month</th>
                        <th className="erp-th text-right">Overall</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Gross Revenue (GMV)',    today: stats?.todayGross,    week: stats?.weeklyGross,    month: stats?.monthlyGross,    overall: stats?.grossRevenue,    cls: 'text-yellow-400' },
                        { label: 'Platform Revenue (70%)', today: stats?.todayPlatform, week: stats?.weeklyPlatform, month: stats?.monthlyPlatform, overall: stats?.platformRevenue, cls: 'text-green-400' },
                        { label: 'Driver Payout (30%)',    today: stats?.todayPayout,   week: stats?.weeklyPayout,   month: stats?.monthlyPayout,   overall: stats?.driverPayout,    cls: 'text-blue-400' },
                      ].map(({ label, today, week, month, overall, cls }) => (
                        <tr key={label} className="erp-tr">
                          <td className="erp-td text-white/60">{label}</td>
                          <td className={`erp-td text-right ${cls}`}>{fmt(today)}</td>
                          <td className={`erp-td text-right ${cls}`}>{fmt(week)}</td>
                          <td className={`erp-td text-right ${cls}`}>{fmt(month)}</td>
                          <td className={`erp-td text-right ${cls} font-bold`}>{fmt(overall)}</td>
                        </tr>
                      ))}
                      <tr className="erp-tr">
                        <td className="erp-td text-white/40">Pending Payments</td>
                        <td className="erp-td text-right text-white/20">—</td>
                        <td className="erp-td text-right text-white/20">—</td>
                        <td className="erp-td text-right text-white/20">—</td>
                        <td className="erp-td text-right num-orange">{stats?.pendingPaymentsCount ?? 0} trips</td>
                      </tr>
                      <tr className="erp-tr">
                        <td className="erp-td text-white/40">Refunds</td>
                        <td className="erp-td text-right text-white/20">—</td>
                        <td className="erp-td text-right text-white/20">—</td>
                        <td className="erp-td text-right text-white/20">—</td>
                        <td className="erp-td text-right num-red">{stats?.refundsCount ?? 0} trips</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ERPCard>

              {/* ── ROW 4: Recent Bookings (full width, expanded) ── */}
              <ERPCard title="Recent Bookings" link="/admin/bookings">
                {(stats?.recentBookings?.length ?? 0) === 0 ? (
                  <p className="text-white/25 text-xs text-center py-6 italic">No bookings in the database yet</p>
                ) : (
                  <RecentBookingsTable bookings={stats.recentBookings} />
                )}
              </ERPCard>

              {/* ── ROW 5: Charts (Monthly Bookings | Fleet Utilization) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                {/* Monthly Bookings */}
                <ERPCard title="Monthly Bookings">
                  <div className="p-3">
                    {monthlyBookingsChart.length > 0 ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={monthlyBookingsChart} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                          <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} allowDecimals={false} />
                          <Tooltip {...tooltipStyle} />
                          <Bar dataKey="bookings" fill="#f5c518" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-44 flex items-center justify-center text-white/20 text-xs">No booking data yet</div>
                    )}
                  </div>
                </ERPCard>

                {/* Fleet Utilization */}
                <ERPCard
                  title="Fleet Utilization"
                  extra={<span className="text-xs text-white/30">{stats?.cabs ?? 0} total vehicles</span>}
                >
                  <div className="p-3">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart
                        data={utilizationChart}
                        layout="vertical"
                        margin={{ top: 8, right: 40, left: 8, bottom: 4 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                          allowDecimals={false}
                          domain={[0, Math.max((stats?.cabs ?? 1), 1)]}
                        />
                        <YAxis
                          type="category"
                          dataKey="label"
                          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                          width={62}
                        />
                        <Tooltip
                          {...tooltipStyle}
                          formatter={(v, _, p) => [
                            `${v} / ${stats?.cabs ?? 0} (${stats?.cabs ? Math.round((v / stats.cabs) * 100) : 0}%)`,
                            p.payload.label,
                          ]}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                          {utilizationChart.map(entry => (
                            <Cell key={entry.label} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ERPCard>
              </div>

            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Ahome;