import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Car, Eye, EyeOff, Shield } from 'lucide-react';

const Alogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', form);
      loginAdmin(data);
      toast.success('Welcome, Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#0d0d14] to-[#0a0a0b] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl mb-4">
            <Shield className="w-7 h-7 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to manage your platform</p>
        </div>
        <div className="card-glass p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" id="admin-login-form">
            <div>
              <label className="input-label">Email</label>
              <input id="admin-email" type="email" placeholder="admin@cabgo.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input id="admin-password" type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} className="input pr-10" required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                  {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button id="admin-login-submit" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-xs text-white/30">Don't have an admin account? <Link to="/admin/register" className="text-yellow-400">Register</Link></p>
          </div>
        </div>
        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-white/20 hover:text-white/40 transition-colors">← Back to main site</Link>
        </div>
      </div>
    </div>
  );
};

export default Alogin;
