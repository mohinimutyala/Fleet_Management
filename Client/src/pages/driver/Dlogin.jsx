import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Truck, Eye, EyeOff } from 'lucide-react';

const Dlogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginDriver } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/drivers/login', form);
      loginDriver(data);
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/driver');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#0d1014] to-[#0a0a0b] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-400/10 border border-blue-400/20 rounded-2xl mb-4">
            <Truck className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Driver Portal</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to start accepting rides</p>
        </div>
        <div className="card-glass p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" id="driver-login-form">
            <div>
              <label className="input-label">Email</label>
              <input id="driver-email" type="email" placeholder="driver@cabgo.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input id="driver-password" type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} className="input pr-10" required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                  {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button id="driver-login-submit" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-xs text-white/30 mt-4">
            New driver? <Link to="/driver/register" className="text-yellow-400">Register here</Link>
          </p>
        </div>
        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-white/20 hover:text-white/40">← Back to main site</Link>
        </div>
      </div>
    </div>
  );
};

export default Dlogin;
