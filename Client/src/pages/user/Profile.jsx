import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Save } from 'lucide-react';

const Profile = () => {
  const { userInfo, loginUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setForm({ name: data.name || '', phone: data.phone || '', password: '' });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.password) payload.password = form.password;
      const { data } = await api.put('/users/profile', payload);
      loginUser({ ...userInfo, ...data });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-container"><Navbar /><Loader /></div>;

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="section-title">My Profile</h1>

        <div className="card">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="w-16 h-16 bg-yellow-400/20 rounded-2xl flex items-center justify-center border border-yellow-400/30">
              <User className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <p className="font-bold text-white text-lg">{form.name}</p>
              <p className="text-sm text-white/40">{userInfo?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5" id="profile-form">
            <div>
              <label className="input-label">Full Name</label>
              <input id="profile-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="input-label">Phone</label>
              <input id="profile-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="input-label">New Password (leave blank to keep current)</label>
              <input id="profile-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" placeholder="••••••••" />
            </div>
            <button id="profile-save" type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
