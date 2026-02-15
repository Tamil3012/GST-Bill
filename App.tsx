
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Building2, 
  FileText, 
  PlusCircle, 
  Database, 
  LogOut, 
  User as UserIcon,
  Menu,
  X,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

// Pages & Types
import { Product, Client, BankDetails, Bill } from './types';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardOverview from './pages/DashboardOverview';
import ProductsPage from './pages/ProductsPage';
import ClientsPage from './pages/ClientsPage';
import BankDetailsPage from './pages/BankDetailsPage';
import BillListPage from './pages/BillListPage';
import GenerateBillPage from './pages/GenerateBillPage';
import DataManagementPage from './pages/DataManagementPage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('isLoggedIn') === 'true');
  const [user, setUser] = useState<{name: string} | null>(isLoggedIn ? { name: 'Tamil' } : null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsLoggedIn(true);
      setUser({ name: 'Tamil' });
      localStorage.setItem('isLoggedIn', 'true');
      setLastActivity(Date.now());
    }
  };

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const timeout = 10 * 60 * 1000;
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > timeout) {
        handleLogout();
        alert("Session expired due to inactivity.");
      }
    }, 10000);
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
    };
  }, [isLoggedIn, lastActivity, handleLogout]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} />
        <Route 
          path="/dashboard/*" 
          element={isLoggedIn ? <DashboardLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        >
          <Route index element={<DashboardOverview />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="bank-details" element={<BankDetailsPage />} />
          <Route path="bills" element={<BillListPage />} />
          <Route path="bills/view/:id" element={<GenerateBillPage mode="view" />} />
          <Route path="bills/edit/:id" element={<GenerateBillPage mode="edit" />} />
          <Route path="generate-bill" element={<GenerateBillPage mode="create" />} />
          <Route path="data-management" element={<DataManagementPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

const DashboardLayout: React.FC<{ user: any, onLogout: () => void }> = ({ user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Add Products', icon: Package, path: '/dashboard/products' },
    { name: 'Add Client Details', icon: Users, path: '/dashboard/clients' },
    { name: 'Bank Details', icon: Building2, path: '/dashboard/bank-details' },
    { name: 'All GST Bill List', icon: FileText, path: '/dashboard/bills' },
    { name: 'Generate GST Bill', icon: PlusCircle, path: '/dashboard/generate-bill' },
    { name: 'Data Management', icon: Database, path: '/dashboard/data-management' },
  ];

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div className="min-h-screen flex bg-slate-50 relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Changed to relative for Desktop to push content */}
      <aside 
        className={`fixed lg:relative inset-y-0 left-0 z-50 bg-white border-r border-slate-200 sidebar-transition no-print flex-shrink-0 flex flex-col
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed && !isMobileOpen ? 'lg:w-20' : 'w-64'}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <div className="p-6 h-16 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="min-w-[32px] w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white shadow shadow-indigo-200 flex-shrink-0">
                <FileSpreadsheet size={20} />
              </div>
              <span className={`text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 ${isCollapsed && !isMobileOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
                GST Pro
              </span>
            </div>
            {/* Desktop Toggle Button inside sidebar */}
            <button 
              onClick={toggleSidebar}
              className="hidden lg:flex p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/dashboard/bills' && location.pathname.startsWith('/dashboard/bills'));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.name : ''}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-100' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <item.icon size={20} className="min-w-[20px] flex-shrink-0" />
                  <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed && !isMobileOpen ? 'opacity-0 -translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-100">
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group relative"
            >
              <LogOut size={20} className="min-w-[20px] flex-shrink-0" />
              <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed && !isMobileOpen ? 'opacity-0 -translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - min-w-0 for flex children responsive resize */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Navbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 sm:px-6 h-16 flex items-center justify-between no-print">
          <div className="flex items-center gap-4">
            <button onClick={toggleMobileSidebar} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <h2 className="hidden sm:block text-sm font-black text-slate-400 uppercase tracking-widest">
              {menuItems.find(i => location.pathname === i.path || (i.path === '/dashboard/bills' && location.pathname.startsWith('/dashboard/bills')))?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-2 sm:pr-3 bg-slate-50 hover:bg-indigo-50 rounded-full transition-all border border-slate-100"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  {user?.name[0]}
                </div>
                <span className="text-sm font-bold text-slate-700 hidden md:block">{user?.name}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                  </div>
                  <button onClick={onLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                    <LogOut size={16} /> Logout Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Body - Responsive padding */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-[1440px] mx-auto overflow-y-auto">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="bank-details" element={<BankDetailsPage />} />
            <Route path="bills" element={<BillListPage />} />
            <Route path="bills/view/:id" element={<GenerateBillPage mode="view" />} />
            <Route path="bills/edit/:id" element={<GenerateBillPage mode="edit" />} />
            <Route path="generate-bill" element={<GenerateBillPage mode="create" />} />
            <Route path="data-management" element={<DataManagementPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
