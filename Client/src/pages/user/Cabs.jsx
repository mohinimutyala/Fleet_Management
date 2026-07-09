import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CabCard from '../../components/CabCard';
import SearchBar from '../../components/SearchBar';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import api from '../../api/axios';
import { Car, SlidersHorizontal, ChevronDown } from 'lucide-react';

const CAB_TYPES = ['All', 'Mini', 'Sedan', 'SUV', 'Premium', 'Luxury', 'Bike', 'Auto', 'Hatchback'];

const Cabs = () => {
  const [cabs, setCabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sort, setSort] = useState('');

  const fetchCabs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter !== 'All') params.type = typeFilter;
      if (sort) params.sort = sort;
      const { data } = await api.get('/cars', { params });
      setCabs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCabs(); }, [search, typeFilter, sort]);

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="section-title">Available Cabs</h1>
          <p className="section-subtitle">Find and book the perfect ride for your journey</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <SearchBar
            placeholder="Search by car name..."
            value={search}
            onChange={setSearch}
            className="flex-1 min-w-48"
          />

          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input appearance-none pr-8 min-w-40"
              id="type-filter"
              style={{ backgroundColor: '#111116', colorScheme: 'dark' }}
            >
              {CAB_TYPES.map((t) => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSort(sort === 'asc' ? '' : 'asc')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${sort === 'asc' ? 'bg-yellow-400/15 border-yellow-400/30 text-yellow-400' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}
            >
              Price: Low to High
            </button>
            <button
              onClick={() => setSort(sort === 'desc' ? '' : 'desc')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${sort === 'desc' ? 'bg-yellow-400/15 border-yellow-400/30 text-yellow-400' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}
            >
              Price: High to Low
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <Loader />
        ) : cabs.length === 0 ? (
          <EmptyState icon={Car} title="No cabs found" description="Try adjusting your search or filters" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {cabs.map((cab) => <CabCard key={cab._id} cab={cab} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cabs;
