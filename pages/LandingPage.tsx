
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight,
  User as UserIcon
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <Zap size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">GST PRO</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#about" className="hover:text-indigo-600 transition-colors">About Us</a>
            <a href="#gallery" className="hover:text-indigo-600 transition-colors">Gallery</a>
            <a href="#contact" className="hover:text-indigo-600 transition-colors">Contact Us</a>
          </div>

          <Link to="/login" className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all duration-300">
            <UserIcon size={20} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Zap size={14} /> Built for speed & reliability
            </div>
            <h1 className="text-6xl font-black text-slate-900 leading-[1.1] mb-6">
              The Smarter Way to <span className="text-indigo-600">Generate GST Bills.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
              Professional billing made simple. Manage products, clients, and inventory with a platform designed for growing businesses in India.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
                Get Started Now <ArrowRight size={20} />
              </Link>
              <button className="px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold hover:border-indigo-600 transition-all">
                View Live Demo
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-indigo-100 rounded-[2rem] blur-2xl opacity-50"></div>
            <img 
              src="https://picsum.photos/seed/gst/1200/800" 
              alt="Dashboard Preview" 
              className="relative rounded-2xl shadow-2xl border border-slate-200"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="about" className="py-20 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Why choose GST PRO?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to handle your business taxes and billing without the headache.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Secure & Compliant', icon: ShieldCheck, desc: '100% compliant with the latest Indian GST regulations.' },
              { title: 'Mobile Ready', icon: Smartphone, desc: 'Access your bills and data from any device, anywhere in the world.' },
              { title: 'Insightful Analytics', icon: BarChart3, desc: 'Track your growth with real-time dashboard visualizations.' }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
                <span className="text-xl font-black text-slate-900">GST PRO</span>
              </div>
              <p className="text-slate-500 max-w-xs mb-8">
                The ultimate solution for professional GST billing and client management.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press Kit</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li>Contact Us</li>
                <li>API Documentation</li>
                <li>Help Center</li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>© 2024 GST PRO. All rights reserved.</p>
            <div className="flex gap-8">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
