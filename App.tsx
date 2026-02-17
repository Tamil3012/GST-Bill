
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Coffee,
  ChevronDown
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Inventory', icon: Package, path: '/dashboard/products' },
    { name: 'Clients', icon: Users, path: '/dashboard/clients' },
    { name: 'Admin Details', icon: Building2, path: '/dashboard/bank-details' },
    { name: 'Invoices', icon: FileText, path: '/dashboard/bills' },
    { name: 'Create Bill', icon: PlusCircle, path: '/dashboard/generate-bill' },
    { name: 'Data Manage', icon: Database, path: '/dashboard/data-management' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sticky Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 bg-white border-r border-slate-200 sidebar-transition flex flex-col no-print
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed && !isMobileOpen ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="p-4 h-16 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-[32px] w-8 h-8 bg-brand rounded flex items-center justify-center text-white shrink-0">
              <Coffee size={20} />
            </div>
            <span className={`text-lg font-black text-brand transition-opacity duration-300 ${isCollapsed && !isMobileOpen ? 'opacity-0' : 'opacity-100'}`}>
              Namma Tea
            </span>
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex text-slate-400 hover:text-brand">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-brand text-white font-semibold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <item.icon size={20} className="shrink-0" />
                <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed && !isMobileOpen ? 'opacity-0' : 'opacity-100'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content with Sticky Topbar */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between no-print shrink-0">
          <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 text-slate-500">
            <Menu size={24} />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              {menuItems.find(i => location.pathname === i.path || location.pathname.startsWith(i.path))?.name || 'Overview'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
              <Bell size={20} />
            </button>
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xs">
                  {user?.name[0]}
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                    <p className="text-[10px] text-brand font-black uppercase">Admin</p>
                  </div>
                  <button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
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
