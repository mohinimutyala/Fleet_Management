import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import { DollarSign, TrendingUp, Zap, Calendar, CheckCircle } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Dearnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/drivers/earnings');
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">My Earnings</h1>
          <p className="text-white/40 text-sm mt-1">Revenue calculated from completed trips</p>
        </div>

        {loading ? <Loader /> : (
          <>
            {/* Revenue summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="card border-yellow-400/20 bg-yellow-400/3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center border border-yellow-400/20">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-xs text-white/40">Total Earnings</p>
                </div>
                <p className="text-3xl font-black text-yellow-400">₹{data?.totalEarnings?.toFixed(0) || 0}</p>
                <p className="text-xs text-white/30 mt-1">{data?.totalRides || 0} completed trips</p>
              </div>
              <div className="card border-green-400/20 bg-green-400/3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center border border-green-400/20">
                    <Zap className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-xs text-white/40">Today's Revenue</p>
                </div>
                <p className="text-3xl font-black text-green-400">₹{data?.todayRevenue?.toFixed(0) || 0}</p>
                <p className="text-xs text-white/30 mt-1">{data?.todayRides || 0} trips today</p>
              </div>
              <div className="card border-blue-400/20 bg-blue-400/3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center border border-blue-400/20">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-xs text-white/40">This Month</p>
                </div>
                <p className="text-3xl font-black text-blue-400">₹{data?.monthlyRevenue?.toFixed(0) || 0}</p>
                <p className="text-xs text-white/30 mt-1">{data?.monthlyRides || 0} trips this month</p>
              </div>
            </div>

            {/* Recent completed rides */}
            <div className="card">
              <h2 className="text-sm font-semibold text-white/60 mb-4">Recent Completed Trips</h2>
              {!data?.recentRides?.length ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">No completed trips yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="table-header">
                        <th className="px-3 py-2 text-left">Route</th>
                        <th className="px-3 py-2 text-left">Customer</th>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-right">Fare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentRides.map((ride) => (
                        <tr key={ride._id} className="table-row">
                          <td className="px-3 py-2 text-white/70">{ride.selectedPickupCity} → {ride.selectedDropCity}</td>
                          <td className="px-3 py-2 text-white/50">{ride.userName || '—'}</td>
                          <td className="px-3 py-2 text-white/40">{ride.bookeddate}</td>
                          <td className="px-3 py-2 text-yellow-400 font-medium text-right">₹{ride.fare}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dearnings;
