import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import SearchBar from '../../components/SearchBar';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Users as UsersIcon, Pencil, Trash2, Eye } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/users/all');
        setUsers(data);
        setFiltered(data);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  }, [search, users]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      setUsers((prev) => prev.filter((u) => u._id !== id));
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
            <h1 className="text-2xl font-black text-white">Users</h1>
            <p className="text-white/40 text-sm">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <SearchBar placeholder="Search users..." value={search} onChange={setSearch} className="w-64" />
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" />
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">User ID</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-center">Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u._id} className="table-row">
                      <td className="px-4 py-3 text-white/40">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-white/40 max-w-[150px] truncate">{u._id}</td>
                      <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-white/60">{u.email}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => navigate(`/admin/users/edit/${u._id}`)} className="p-1.5 text-white/40 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(u._id)} className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Users;
