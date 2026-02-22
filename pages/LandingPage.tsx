
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
// import logo from '../assets/image/logo.webp';
import logo from '@/assets/images/logo.webp';
import { 
  Menu as MenuIcon, 
  X, 
  Coffee, 
  Star, 
  Clock, 
  ShieldCheck, 
  Award,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  User as UserIcon
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Sandwiches');
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Disable scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Menu', path: '#menu' },
    { name: 'About Us', path: '#about' },
    { name: 'Contact Us', path: '#contact' },
    { name: 'Gallery', path: '#gallery' },
    { name: 'Franchise', path: '#franchise' },
  ];

  const breakfastTabs = ['Soups', 'Wraps', 'Sandwiches', 'Smoothie & Frappes', 'Doughnuts & Pastries', 'Cookies', 'Coffee Tea & Chai'];

  const specialCoffee = [
    { name: 'Americano Pure Grades', price: 25, img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Guatemala Coffee', price: 30, img: 'https://images.unsplash.com/photo-1544787210-2211d44b865a?auto=format&fit=crop&w=400&q=80' },
    { name: 'Kenya Coffee', price: 30, img: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=400&q=80' },
  ];

  const breakfastItems = [
    { name: 'Veggie Italian', price: 25, img: 'https://images.unsplash.com/photo-1509722747041-619f382b73b0?auto=format&fit=crop&w=400&q=80' },
    { name: 'Chipotle Chicken Avocado', price: 30, img: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=400&q=80' },
    { name: 'BLT Sandwich Detail', price: 23, img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80' }
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-brand selection:bg-brand selection:text-white font-['Inter']">
      
      {/* Black/50 Overlay for Sidebar */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      

      {/* Sidebar Menu Drawer */}
      <div className={`fixed top-0 right-0 bottom-0 w-80 bg-white z-[70] transform transition-transform duration-500 ease-in-out shadow-2xl flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex justify-between items-center border-b border-slate-100">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-brand rounded flex items-center justify-center text-white">
               <Coffee size={18} />
             </div>
             <span className="font-black uppercase tracking-tighter text-brand">Namma Tea</span>
           </div>
           <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-brand transition-colors">
             <X size={28} />
           </button>
        </div>
        
        <div className="flex-1 py-10 px-8 flex flex-col gap-8">
          {menuItems.map((item) => (
            <a 
              key={item.name} 
              href={item.path} 
              onClick={() => setIsMenuOpen(false)}
              className={`text-xl font-black uppercase tracking-widest transition-all hover:translate-x-2 ${location.hash === item.path ? 'text-brand border-l-4 border-brand pl-4' : 'text-slate-400 hover:text-brand pl-4'}`}
            >
              {item.name}
            </a>
          ))}
          <div className="mt-auto pt-8 border-t border-slate-100">
             <Link 
               to="/login" 
               className="flex items-center justify-center gap-3 w-full py-4 bg-brand text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
             >
               <UserIcon size={20} /> Dashboard Login
             </Link>
             <p className="mt-6 text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest italic">Professional Tea Solutions</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img className='w-[200px]' src={logo} alt="logo" />
          </div>

          {/* Desktop Navigation Menu List */}
          <div className="hidden lg:flex items-center bg-white/40 backdrop-blur-sm rounded-full px-10 py-3.5 gap-12 shadow-sm border border-white/40">
            {menuItems.map((item) => (
              <a 
                key={item.name} 
                href={item.path} 
                className={`text-sm font-black uppercase tracking-widest transition-all relative group ${location.hash === item.path ? 'text-brand' : 'text-slate-500 hover:text-brand'}`}
              >
                {item.name}
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-brand scale-x-0 group-hover:scale-x-100 transition-transform ${location.hash === item.path ? 'scale-x-100' : ''}`} />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4">
              <Link 
                to="/login" 
                target='blank'
                className="w-11 h-11 bg-brand text-white rounded-full flex items-center justify-center shadow-lg shadow-brand/20 hover:scale-110 active:scale-95 transition-all"
                title="Dashboard Login"
              >
                <UserIcon size={20} />
              </Link>
            </div>
            
            {/* Hamburger visible only on medium/small screens */}
            <button 
              onClick={() => setIsMenuOpen(true)} 
              className="lg:hidden p-2 text-brand hover:scale-110 transition-transform"
            >
              <MenuIcon size={32} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="home" className=" pt-48 pb-32 overflow-hidden px-6">
        <div className="flex flex-wrap max-w-7xl mx-auto items-center">
          <div className="w-full lg:w-6/12 z-10 text-center lg:text-left">
            <h1 className="text-[46px] md:text-5xl lg:text-6xl font-black leading-[120%] tracking-wide mb-10 text-brand">
              Where India's Love <br className='hidden md:block'/> for Tea Meetsa <br className='hidden md:block'/> Profitable Franchise
            </h1>
            <p className="text-lg font-semibold text-slate-400 mb-6  mx-auto lg:mx-0">
              We provide a variety of unique and Best Coffees
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
               <button className="px-12 py-5 bg-brand text-white rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-brand/40 hover:translate-y-[-4px] active:translate-y-0 transition-all">
                Order Now
              </button>
            </div>
          </div>
          <div className="w-full lg:w-6/12   mt-[30px] md:mt-0">
             <div className="relative flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80" 
                  alt="Coffee Splash" 
                  className="w-[85%] h-auto rounded-[4rem] shadow-2xl transform rotate-6 z-10"
                />
                <img 
                  src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80" 
                  alt="Coffee Cup" 
                  className="absolute -bottom-10 -right-5 w-52 h-auto rounded-[2.5rem] shadow-xl transform -rotate-12 z-20 border-8 border-white"
                />
             </div>
             {/* <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -z-10 animate-pulse"></div> */}
          </div>
        </div>
      </header>

      {/* Feature Section */}
      <section className="py-24 bg-brand text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-16">
            {[
              { title: 'Awesome Aroma', icon: Coffee, desc: 'The coffee is brewed by first roasting the green coffee beans' },
              { title: 'High Quality', icon: Award, desc: 'The coffee is brewed by first roasting the green coffee beans' },
              { title: 'Pure Grades', icon: ShieldCheck, desc: 'The coffee is brewed by first roasting the green coffee beans' },
              { title: 'Proper Roasting', icon: Clock, desc: 'The coffee is brewed by first roasting the green coffee beans' }
            ].map((f, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 mx-auto mb-8 bg-white/10 rounded-[1.5rem] flex items-center justify-center hover:bg-white hover:text-brand transition-all duration-300">
                  <f.icon size={36} />
                </div>
                <h3 className="font-black text-sm uppercase tracking-[0.2em] mb-4">{f.title}</h3>
                <p className="text-[10px] opacity-40 font-bold uppercase leading-relaxed max-w-[180px] mx-auto">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="relative">
             <div className="bg-white p-6 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80" 
                  alt="Coffee Beans Heart" 
                  className="rounded-[3rem] w-full group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-12 left-12 text-white font-black z-10 pointer-events-none drop-shadow-lg">
                   <p className="text-5xl uppercase leading-none">Coffee <br/> Shop</p>
                   <p className="text-sm uppercase tracking-[0.3em] mt-3 opacity-80">Always Fresh</p>
                </div>
                <div className="absolute inset-0 bg-brand/20 group-hover:bg-transparent transition-colors duration-500"></div>
             </div>
          </div>
          <div className="space-y-10">
            <h2 className="text-5xl font-black leading-none text-brand">Best Coffee House In <br/> Your Home Town</h2>
            <p className="text-slate-500 font-medium leading-loose">
              Our incredibly rate come from humble beginnings in yemen, where decades of political turmoil once forced local farmers to start growing khat, a narcotic native to the Arabian Peninsula.
            </p>
            <p className="text-slate-500 font-medium leading-loose">
              The Dawoodi Bohra Community changed this, removing all the khat plants and replacing them with coffee, bringing this humble brew black to its roots.
            </p>
            <button className="px-12 py-5 bg-brand text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-105 transition-transform">
              Read More
            </button>
          </div>
        </div>
      </section>

      {/* Menu / Special Coffee Section */}
      <section id="menu" className="py-32 bg-white px-6">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-5xl font-black text-brand mb-4">Our Special Coffee</h2>
          <div className="w-16 h-1 bg-brand mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative group">
           <div className="grid md:grid-cols-3 gap-10">
              {specialCoffee.map((p, i) => (
                <div key={i} className="bg-[#FAF9F6] rounded-[3.5rem] p-10 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-500 border border-slate-50 group">
                  <div className="w-full aspect-square rounded-[2.5rem] overflow-hidden mb-10 shadow-lg relative">
                     <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <h3 className="text-lg font-black text-brand mb-3">{p.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-10">The coffee is brewed by first roasting the green coffee beans...</p>
                  <div className="mt-auto w-full flex items-center justify-between border-t border-slate-200 pt-8">
                     <span className="text-2xl font-black text-brand">₹{p.price}</span>
                     <button className="px-7 py-3.5 bg-brand text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-light transition-colors">Order Now</button>
                  </div>
                </div>
              ))}
           </div>
           
           <button className="absolute -left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-brand hover:bg-brand hover:text-white transition-all z-10">
              <ChevronLeft size={24} />
           </button>
           <button className="absolute -right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-brand hover:bg-brand hover:text-white transition-all z-10">
              <ChevronRight size={24} />
           </button>
        </div>
      </section>

      {/* Other Breakfast Items */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-black text-brand mb-10">Our Other Breakfast Item</h2>
          <div className="flex flex-wrap justify-center gap-3 mb-20 overflow-x-auto pb-6 custom-scrollbar scroll-smooth">
            {breakfastTabs.map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${activeTab === tab ? 'bg-brand text-white shadow-brand/20 shadow-xl' : 'bg-white text-slate-400 hover:text-brand'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
           {breakfastItems.map((item, i) => (
              <div key={i} className="bg-white rounded-[3.5rem] p-10 group hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col">
                <div className="mb-10 rounded-[2.5rem] overflow-hidden h-56 relative shadow-inner">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-5 right-5 w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg">
                     <Star size={18} fill="currentColor" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-brand mb-3">{item.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-10 leading-relaxed">Delicious fresh ingredients roasted to perfection for your daily breakfast.</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-3xl font-black text-brand">₹{item.price}</span>
                  <button className="px-8 py-4 bg-brand text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand/10">Order Now</button>
                </div>
              </div>
           ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-white rounded-[5rem] p-12 lg:p-24 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-24">
           <div className="lg:w-1/2 relative">
              <div className="grid grid-cols-2 gap-4">
                 <img src="https://images.unsplash.com/photo-1506370825048-cf8e1d936555?auto=format&fit=crop&w=300&q=80" className="rounded-3xl shadow-lg rotate-[-5deg]" alt="G1" />
                 <img src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=300&q=80" className="rounded-3xl shadow-lg translate-y-10" alt="G2" />
              </div>
              <div className="absolute -z-10 inset-0 bg-brand/5 rounded-full blur-[120px]" />
           </div>
           <div className="lg:w-1/2 text-center lg:text-left">
              <h2 className="text-5xl lg:text-7xl font-black text-brand leading-none mb-14">Subscribe <br/> To Get News</h2>
              <div className="flex flex-col sm:flex-row bg-[#FAF9F6] rounded-2xl p-2.5 border border-slate-200 shadow-inner">
                <input 
                  type="email" 
                  placeholder="Enter Your Email" 
                  className="bg-transparent border-none outline-none flex-1 px-8 py-5 text-brand font-black placeholder:text-slate-300" 
                />
                <button className="px-12 py-5 bg-brand text-white rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-brand/30 hover:scale-[1.02] transition-transform">
                  Subscribe
                </button>
              </div>
           </div>
        </div>
      </section>

      {/* Footer / Contact Us / Franchise */}
      <footer id="contact" className="bg-[#1A0B07] pt-32 pb-16 text-white/50 relative overflow-hidden">
        <div id="franchise" className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-4 gap-24 mb-32 relative z-10">
          <div className="space-y-12 lg:col-span-1">
             <div className="flex items-center gap-4 text-white">
               <div className="w-12 h-12 bg-white text-brand rounded-2xl flex items-center justify-center shadow-lg">
                 <Coffee size={28} />
               </div>
               <span className="text-3xl font-black tracking-tighter uppercase">Coffee</span>
             </div>
             <p className="text-xs font-bold uppercase leading-relaxed tracking-[0.1em]">
               Our managing director & cluster head in United States at New York, Gallup way. Delivering excellence in every sip.
             </p>
             <div className="flex gap-5">
               {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                 <a key={i} href="#" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-brand transition-all duration-500 shadow-sm border border-white/5">
                   <Icon size={20} />
                 </a>
               ))}
             </div>
          </div>

          <div id="contact-details">
            <h4 className="text-white font-black uppercase tracking-[0.3em] mb-14 flex items-center gap-4">
              <span className="w-2.5 h-2.5 bg-brand rounded-full ring-4 ring-brand/20"></span> Contact Us
            </h4>
            <div className="space-y-8 text-[11px] font-bold uppercase tracking-widest leading-loose">
              <p className="flex items-start gap-5"><MapPin size={20} className="text-brand shrink-0" /> 87301 at Gallup, New York, United States</p>
              <p className="flex items-center gap-5"><Phone size={20} className="text-brand shrink-0" /> (505) 726-9338</p>
              <p className="flex items-center gap-5"><Mail size={20} className="text-brand shrink-0" /> coffee@gamil.com</p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-[0.3em] mb-14 flex items-center gap-4">
              <span className="w-2.5 h-2.5 bg-brand rounded-full ring-4 ring-brand/20"></span> Viewer Guides
            </h4>
            <ul className="space-y-6 text-[11px] font-bold uppercase tracking-widest">
              <li><a href="#home" className="hover:text-brand transition-colors block border-b border-white/5 pb-2">Home</a></li>
              <li><a href="#about" className="hover:text-brand transition-colors block border-b border-white/5 pb-2">About</a></li>
              <li><a href="#menu" className="hover:text-brand transition-colors block border-b border-white/5 pb-2">Coffee</a></li>
              <li><a href="#contact" className="hover:text-brand transition-colors block">Help & Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-[0.3em] mb-14 flex items-center gap-4">
              <span className="w-2.5 h-2.5 bg-brand rounded-full ring-4 ring-brand/20"></span> Recent News
            </h4>
            <div className="space-y-10">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-6 items-center group cursor-pointer">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex-shrink-0 overflow-hidden relative border border-white/5 shadow-inner">
                    <img src="https://images.unsplash.com/photo-1544787210-2211d44b865a?auto=format&fit=crop&w=120&q=80" className="w-full h-full object-cover opacity-20 group-hover:opacity-100 transition-opacity duration-700" alt="News" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-brand font-black uppercase tracking-tighter">Coffee Benefits</p>
                    <p className="text-[11px] font-black group-hover:text-white transition-colors leading-relaxed text-white/90">Best smell of Americano coffee and its daily perks</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-16 border-t border-white/5 text-center relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">© Parves Ahamad. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
