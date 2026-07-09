import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import DriverCard from '../../components/DriverCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Truck, Trash2 } from 'lucide-react';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/drivers/all');
        setDrivers(data);
      } catch (err) {
        toast.error('Failed to load drivers');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this driver?')) return;
    try {
      await api.delete(`/drivers/${id}`);
      toast.success('Driver deleted');
      setDrivers((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Drivers</h1>
          <p className="text-white/40 text-sm">{drivers.length} registered drivers</p>
        </div>

        {loading ? <Loader /> : drivers.length === 0 ? (
          <EmptyState icon={Truck} title="No drivers registered" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((d) => (
              <div key={d._id} className="relative group">
                <DriverCard driver={d} />
                <button onClick={() => handleDelete(d._id)}
                  className="absolute top-3 right-3 p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Drivers;
