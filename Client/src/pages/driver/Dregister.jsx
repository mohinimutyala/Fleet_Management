import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Truck } from 'lucide-react';

const Dregister = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', licenseNo: '' });
  const [loading, setLoading] = useState(false);
  const { loginDriver } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/drivers/register', form);
      loginDriver(data);
      toast.success('Driver account created!');
      navigate('/driver');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <h1 className="text-2xl font-bold text-white">Register as Driver</h1>
        </div>
        <div className="card-glass p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4" id="driver-register-form">
            {[
              { id: 'dreg-name', label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
              { id: 'dreg-email', label: 'Email', key: 'email', type: 'email', placeholder: 'driver@example.com' },
              { id: 'dreg-password', label: 'Password', key: 'password', type: 'password', placeholder: 'Min. 6 characters' },
              { id: 'dreg-phone', label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
              { id: 'dreg-license', label: 'License Number', key: 'licenseNo', type: 'text', placeholder: 'e.g. MH01234' },
            ].map(({ id, label, key, type, placeholder }) => (
              <div key={key}>
                <label className="input-label">{label}</label>
                <input id={id} type={type} placeholder={placeholder} value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input" required={key !== 'licenseNo'} />
              </div>
            ))}
            <button id="driver-reg-submit" type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : null}
              Create Account
            </button>
          </form>
          <p className="text-center text-xs text-white/30 mt-4">
            Already have an account? <Link to="/driver/login" className="text-yellow-400">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dregister;
