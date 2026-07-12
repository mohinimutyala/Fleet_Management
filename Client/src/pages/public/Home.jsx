import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Car, Shield, Clock, Star, MapPin, ChevronRight, Zap } from 'lucide-react';

const CAB_TYPES = [
  { name: 'Mini', emoji: '🛺', desc: 'Affordable & compact', price: '₹8/km' },
  { name: 'Sedan', emoji: '🚗', desc: 'Comfortable everyday rides', price: '₹12/km' },
  { name: 'SUV', emoji: '🚙', desc: 'Spacious for families', price: '₹15/km' },
  { name: 'Luxury', emoji: '🏎️', desc: 'Premium experience', price: '₹25/km' },
  { name: 'Bike', emoji: '🏍️', desc: 'Fast through traffic', price: '₹5/km' },
  { name: 'Auto', emoji: '🛺', desc: 'Budget-friendly', price: '₹6/km' },
];

const FEATURES = [
  { icon: Shield, title: 'Safe & Verified', desc: 'All drivers verified with background checks and license validation' },
  { icon: Clock, title: '24/7 Available', desc: 'Book a ride any time of day or night, we\'re always ready' },
  { icon: Star, title: 'Top Rated', desc: 'Over 50,000 five-star rides completed across India' },
  { icon: Zap, title: 'Instant Booking', desc: 'Book in under 60 seconds with fare estimates upfront' },
];

const Home = () => (
  <div className="page-container">
    <Navbar />

    {/* HERO */}
    <section className="hero-gradient relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
            Available Across World
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            Your Ride,<br />
            <span className="gradient-text">Your Way</span>
          </h1>
          <p className="text-xl text-white/50 mb-10 leading-relaxed max-w-xl">
            Reliable. Fast. Affordable. Book cabs anytime, anywhere across India with upfront pricing and verified drivers.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-4 flex items-center gap-2 group">
              Book a Ride
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/cabs" className="btn-secondary text-base px-8 py-4">
              Explore Cabs
            </Link>
          </div>
        </div>
      </div>

      {/* Gradient decoration */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
    </section>


    
    {/* FEATURES */}
    <section className="py-16 px-4 bg-white/2 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Why Choose CabGo?</h2>
          <p className="text-white/40">Built for the modern traveller</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:border-yellow-400/20 hover:scale-[1.02] transition-all duration-300">
              <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-4 border border-yellow-400/20">
                <Icon className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-black text-white mb-4">Ready to Ride?</h2>
        <p className="text-white/40 mb-8 text-lg">Join thousands of happy riders across India</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register" className="btn-primary text-base px-8 py-4">Get Started Free</Link>
          <Link to="/driver/login" className="btn-secondary text-base px-8 py-4">Become a Driver</Link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Home;