import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Shield } from 'lucide-react';

const Aregister = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/admin/register', form);
      loginAdmin(data);
      toast.success('Admin account created!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <h1 className="text-2xl font-bold text-white">Create Admin Account</h1>
        </div>
        <div className="card-glass p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" id="admin-register-form">
            <div>
              <label className="input-label">Full Name</label>
              <input id="admin-reg-name" type="text" placeholder="Admin Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input id="admin-reg-email" type="email" placeholder="admin@cabgo.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input id="admin-reg-password" type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" required minLength={6} />
            </div>
            <button id="admin-reg-submit" type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-xs text-white/30 mt-4">
            Already have an account? <Link to="/admin/login" className="text-yellow-400">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Aregister;
