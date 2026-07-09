import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Car, Eye, EyeOff, UserPlus } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/users/register', form);
      loginUser(data);
      toast.success(`Welcome to CabGo, ${data.name}!`);
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-black" />
            </div>
            <span className="font-black text-2xl text-white">Cab<span className="text-yellow-400">Go</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-white/40 text-sm mt-1">Join thousands of happy riders</p>
        </div>

        <div className="card-glass p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
            <div>
              <label className="input-label">Full Name</label>
              <input
                id="register-name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="input-label">Email address</label>
              <input
                id="register-email"
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
                  id="register-password"
                  type={show ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pr-10"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
