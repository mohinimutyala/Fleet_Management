import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import SearchBar from '../../components/SearchBar';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Car, Pencil, Trash2, Plus } from 'lucide-react';

const Acabs = () => {
  const [cars, setCars] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const navigate = useNavigate();

  const fetchCars = async () => {
    try {
      const { data } = await api.get('/cars');
      setCars(data);
      setFiltered(data);
    } catch (err) {
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCars(); }, []);

  useEffect(() => {
    let result = [...cars].filter((c) =>
      c.carname.toLowerCase().includes(search.toLowerCase()) ||
      c.cartype.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'desc') result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (sort === 'asc') result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    setFiltered(result);
  }, [search, sort, cars]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this car?')) return;
    try {
      await api.delete(`/cars/${id}`);
      toast.success('Car deleted');
      setCars((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Car List</h1>
            <p className="text-white/40 text-sm">{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <SearchBar placeholder="Search cabs..." value={search} onChange={setSearch} className="w-48" />
            <button onClick={() => setSort(sort === 'asc' ? '' : 'asc')} className={`px-3 py-2 text-xs rounded-lg border transition-all ${sort === 'asc' ? 'bg-yellow-400/15 border-yellow-400/30 text-yellow-400' : 'bg-white/5 border-white/10 text-white/50'}`}>Price ↑</button>
            <button onClick={() => setSort(sort === 'desc' ? '' : 'desc')} className={`px-3 py-2 text-xs rounded-lg border transition-all ${sort === 'desc' ? 'bg-yellow-400/15 border-yellow-400/30 text-yellow-400' : 'bg-white/5 border-white/10 text-white/50'}`}>Price ↓</button>
            <button onClick={() => navigate('/admin/cars/add')} className="btn-primary flex items-center gap-2 text-sm py-2">
              <Plus className="w-4 h-4" /> Add Car
            </button>
          </div>
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState icon={Car} title="No cars found" actionLabel="Add Car" actionTo="/admin/cars/add" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((car) => (
              <div key={car._id} className="card hover:border-white/20 hover:scale-[1.02] transition-all duration-300 flex flex-col">
                {/* Car Image */}
                <div className="w-full h-36 bg-white/5 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                  {car.carImage ? (
                    <img src={car.carImage} alt={car.carname} className="w-full h-full object-cover" />
                  ) : (
                    <Car className="w-12 h-12 text-white/20" />
                  )}
                </div>
                <div className="flex-1 space-y-1 mb-4 text-sm">
                  <p className="font-bold text-white">{car.carname}</p>
                  <p className="text-white/40">Status: <span className="text-white/60">{car.vehicleStatus || 'Available'}</span></p>
                  <p className="text-white/40">Type: <span className="text-white/60">{car.cartype}</span></p>
                  <p className="text-white/40">No: <span className="font-mono text-white/60">{car.carno}</span></p>
                  <p className="text-yellow-400 font-bold">₹{car.price}/km</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/admin/cars/edit/${car._id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(car._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Acabs;
