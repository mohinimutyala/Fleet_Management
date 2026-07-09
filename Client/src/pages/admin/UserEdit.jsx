import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        setForm({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
      } catch (err) {
        toast.error('User not found');
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/users/${id}`, form);
      toast.success('User updated');
      navigate('/admin/users');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-white/40 hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>
        <h1 className="text-2xl font-black text-white mb-6">Edit User</h1>
        {loading ? <Loader /> : (
          <div className="max-w-md">
            <div className="card">
              <form onSubmit={handleSave} className="space-y-5" id="user-edit-form">
                <div>
                  <label className="input-label">Full Name</label>
                  <input id="edit-user-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="input-label">Email</label>
                  <input id="edit-user-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="input-label">Phone</label>
                  <input id="edit-user-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
                </div>
                <button id="user-edit-save" type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserEdit;
