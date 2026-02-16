
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
  Menu,
  X,
  Bell,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';

// Pages
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

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsLoggedIn(true);
      setUser({ name: 'Tamil' });
      localStorage.setItem('isLoggedIn', 'true');
    }
  };

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
  }, []);

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
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Inventory', icon: Package, path: '/dashboard/products' },
    { name: 'Clients', icon: Users, path: '/dashboard/clients' },
    { name: 'Bank Details', icon: Building2, path: '/dashboard/bank-details' },
    { name: 'Invoices', icon: FileText, path: '/dashboard/bills' },
    { name: 'Create Bill', icon: PlusCircle, path: '/dashboard/generate-bill' },
    { name: 'Data Manage', icon: Database, path: '/dashboard/data-management' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:relative inset-y-0 left-0 z-50 bg-white border-r border-slate-200 sidebar-transition flex flex-col no-print h-screen
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed && !isMobileOpen ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 h-16 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="min-w-[32px] w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white shadow shadow-indigo-100 flex-shrink-0">
                <Zap size={20} />
              </div>
              <span className={`text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-300 ${isCollapsed && !isMobileOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
                GST Pro
              </span>
            </div>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-1.5 text-slate-400">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/dashboard/bills' && location.pathname.startsWith('/dashboard/bills'));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-100' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed && !isMobileOpen ? 'opacity-0 -translate-x-10' : 'opacity-100'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-100">
            <button onClick={onLogout} className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
              <LogOut size={20} className="flex-shrink-0" />
              <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed && !isMobileOpen ? 'opacity-0 -translate-x-10' : 'opacity-100'}`}>
                Log Out
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between no-print flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
              <Menu size={24} />
            </button>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest hidden sm:block">
              {menuItems.find(i => location.pathname === i.path || (i.path === '/dashboard/bills' && location.pathname.startsWith('/dashboard/bills')))?.name || 'Overview'}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {user?.name[0]}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-black text-slate-900 leading-none mb-1">{user?.name}</p>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tighter">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 w-full max-w-[1600px] mx-auto overflow-y-auto">
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
