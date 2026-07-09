import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Car, Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/users/login', form);
      loginUser(data);
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-black" />
            </div>
            <span className="font-black text-2xl text-white">Cab<span className="text-yellow-400">Go</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card-glass p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
            <div>
              <label className="input-label">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-yellow-400 hover:text-yellow-300 font-medium">Register</Link>
            </p>
          </div>
        </div>

        {/* Admin & Driver links */}
        <div className="flex justify-center gap-6 mt-6 text-xs text-white/30">
          <Link to="/admin/login" className="hover:text-white/60 transition-colors">Admin Portal</Link>
          <Link to="/driver/login" className="hover:text-white/60 transition-colors">Driver Portal</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
