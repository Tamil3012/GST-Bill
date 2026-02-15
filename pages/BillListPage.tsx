
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Printer, 
  Eye, 
  Calendar, 
  PlusCircle,
  MoreVertical,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { Bill } from '../types';
import { formatDate } from '../utils/helpers';
import { supabase } from '../utils/supabase';
import Modal from '../components/Modal';

const BillListPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const fetchBills = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('date', { ascending: false });
    
    if (data) setBills(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const filteredBills = bills.filter(b => {
    const matchesName = (b.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (b.billNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? b.date.includes(dateFilter) : true;
    return matchesName && matchesDate;
  });

  const handleDelete = async () => {
    if (currentBill) {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', currentBill.id);
      
      if (!error) {
        setBills(bills.filter(b => b.id !== currentBill.id));
      }
    }
    setDeleteModalOpen(false);
    setCurrentBill(null);
  };

  const handlePrint = (bill: Bill) => {
    navigate(`/dashboard/bills/view/${bill.id}?print=true`);
  };

  const handleView = (bill: Bill) => {
    navigate(`/dashboard/bills/view/${bill.id}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="text-indigo-600" /> GST Bill Records
          </h1>
          <p className="text-slate-500">Search, view, and print your historical tax invoices.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/generate-bill')}
          className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} /> Create New Bill
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by client or invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4 hidden sm:table-cell">Date</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">Loading records...</td>
                </tr>
              ) : filteredBills.length > 0 ? filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-indigo-600 block sm:inline">{bill.billNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900 truncate max-w-[120px] sm:max-w-none block">{bill.clientName}</span>
                    <span className="sm:hidden text-[10px] text-slate-400 uppercase tracking-tighter">{formatDate(bill.date)}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm hidden sm:table-cell">
                    {formatDate(bill.date)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-900 font-bold whitespace-nowrap">₹{bill.totalAmount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right overflow-visible">
                    <div className="flex items-center justify-end gap-1 relative overflow-visible">
                      <button 
                        onClick={() => handlePrint(bill)}
                        className="hidden sm:flex p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Print"
                      >
                        <Printer size={18} />
                      </button>
                      <button 
                        onClick={() => handleView(bill)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      
                      <div className="relative inline-block">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === bill.id ? null : bill.id);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {activeMenuId === bill.id && (
                          <>
                            <div className="fixed inset-0 z-[60]" onClick={() => setActiveMenuId(null)}></div>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-[70] overflow-hidden py-1 transform origin-top-right animate-in fade-in zoom-in-95 duration-150">
                              <button 
                                onClick={() => handlePrint(bill)}
                                className="sm:hidden flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left"
                              >
                                <Printer size={16} /> Print Bill
                              </button>
                              <button 
                                onClick={() => { navigate(`/dashboard/bills/edit/${bill.id}`); setActiveMenuId(null); }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left"
                              >
                                <Edit2 size={16} /> Edit Invoice
                              </button>
                              <button 
                                onClick={() => { setCurrentBill(bill); setDeleteModalOpen(true); setActiveMenuId(null); }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left border-t border-slate-100"
                              >
                                <Trash2 size={16} /> Delete Invoice
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <FileText size={48} className="mb-4" />
                      <p className="font-bold text-lg">No records found</p>
                      <p className="text-sm">Search with different terms or create your first bill.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Archive Invoice"
        message={`Are you sure you want to permanently delete invoice ${currentBill?.billNumber}? This action cannot be undone.`}
      />
    </div>
  );
};

export default BillListPage;
