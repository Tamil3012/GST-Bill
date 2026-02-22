
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, FileText, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { Product, Client, Bill } from '../types';
import { supabase } from '../utils/supabase';

const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState({
    products: 0,
    clients: 0,
    bills: 0,
    revenue: 0
  });
  const [recentBills, setRecentBills] = useState<Bill[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [products, clients, bills] = await Promise.all([
        supabase.from('products').select('count', { count: 'exact', head: true }),
        supabase.from('clients').select('count', { count: 'exact', head: true }),
        supabase.from('bills').select('*').order('date', { ascending: false }).limit(5)
      ]);

      const totalRev = bills.data?.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) || 0;
      
      setStats({
        products: products.count || 0,
        clients: clients.count || 0,
        bills: bills.data?.length || 0,
        revenue: totalRev
      });

      if (bills.data) setRecentBills(bills.data);
    };

    fetchData();
  }, []);

  const chartData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm">Real-time performance metrics and recent business activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Total Products', value: stats.products, icon: ShoppingBag, color: 'indigo', trend: '+12%' },
          { label: 'Active Clients', value: stats.clients, icon: Users, color: 'purple', trend: '+5%' },
          { label: 'Bills Generated', value: stats.bills, icon: FileText, color: 'blue', trend: '+18%' },
          { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: CreditCard, color: 'emerald', trend: '+24%' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 bg-slate-50 text-${item.color === 'emerald' ? 'emerald' : 'indigo'}-600 rounded-xl flex items-center justify-center`}>
                <item.icon size={20} />
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} flex items-center gap-1`}>
                {item.trend}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-2xl font-black text-slate-900 truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-brand rounded-full"></span>
            Revenue Analytics
          </h3>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {recentBills.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                <FileText size={48} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">No Recent Bills</p>
              </div>
            ) : (
              recentBills.map((bill) => (
                <div key={bill.id} className="flex items-center gap-4 p-3 hover:bg-indigo-50/50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-indigo-100">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">{bill.billNumber}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{bill.clientName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-slate-900">₹{bill.totalAmount.toLocaleString()}</p>
                    <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">Saved</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default DashboardOverview;
