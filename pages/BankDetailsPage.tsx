
import React, { useState, useEffect } from 'react';
import { Building2, Save, Trash2, ShieldCheck, CreditCard, Info, Loader2 } from 'lucide-react';
import { BankDetails } from '../types';
import { supabase } from '../utils/supabase';
import Modal from '../components/Modal';

const BankDetailsPage: React.FC = () => {
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchBankDetails = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('bank_details')
      .select('*')
      .limit(1)
      .single();
    
    if (data) {
      setBankDetails(data);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    
    // Check if record exists
    const { data: existing } = await supabase.from('bank_details').select('id').limit(1).single();
    
    let result;
    if (existing) {
      result = await supabase.from('bank_details').update(bankDetails).eq('id', existing.id);
    } else {
      result = await supabase.from('bank_details').insert([bankDetails]);
    }

    if (!result.error) {
      setIsEditing(false);
    } else {
      alert("Error saving: " + result.error.message);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const { data: existing } = await supabase.from('bank_details').select('id').limit(1).single();
    if (existing) {
      await supabase.from('bank_details').delete().eq('id', existing.id);
    }
    
    setBankDetails({ bankName: '', accountNumber: '', ifscCode: '', accountHolderName: '' });
    setIsEditing(true);
    setDeleteModalOpen(false);
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400 italic">Connecting to Supabase...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="text-indigo-600" /> Admin Bank Details
          </h1>
          <p className="text-slate-500">These details will appear on all generated GST bills.</p>
        </div>
        {!isEditing && (
          <div className="flex gap-3">
             <button 
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-all"
            >
              Edit Details
            </button>
            <button 
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="mb-10 p-6 bg-blue-50/50 rounded-2xl flex gap-4 border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Info size={24} />
            </div>
            <div>
              <p className="font-bold text-blue-900">Important Note</p>
              <p className="text-sm text-blue-700">Ensure these details are accurate as they appear directly on the tax invoice PDF.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Account Holder Name</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={bankDetails.accountHolderName}
                  onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-semibold disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="e.g., TAMIL ENTERPRISES PVT LTD"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Bank Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-semibold disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="e.g., State Bank of India"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Account Number</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-semibold disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="0000 0000 0000 00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">IFSC Code</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">ID</span>
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-semibold disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="SBIN0001234"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-12 flex gap-4">
               <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} /> Save Bank Details
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Bank Details"
        message="Are you sure you want to clear your business bank information? This data is required for printing professional invoices."
      />
    </div>
  );
};

export default BankDetailsPage;
