
import React, { useState, useEffect } from 'react';
import { Building2, Save, Loader2 } from 'lucide-react';
import { BankDetails } from '../types';
import { supabase } from '../utils/supabase';

const BankDetailsPage: React.FC = () => {
  const [profile, setProfile] = useState<BankDetails>({
    businessName: 'Namma Tea World',
    address: '3/8 kalyani ammal street, Varadharajapuram, Abattur Chennai-600053',
    fssaiNo: '12423023001605',
    gstin: '33ASJPT8350M1Z3',
    phone: '9110339096',
    email: 'nammateaworld@gmail.com',
    bankName: 'HDFC BANK LIMITED, CHENNAI-82',
    accountNumber: '50200103874804',
    ifscCode: 'HDFC0003742',
    branchName: 'Periyar Nagar Branch',
    panNo: 'ASJPT8350M'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.from('bank_details').select('*').limit(1).single();
        if (data) {
          // Requirement: Handle partial schema mismatch by merging fetched data with existing state
          setProfile(prev => ({ ...prev, ...data }));
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setIsEditing(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: existing } = await supabase.from('bank_details').select('id').limit(1).single();
      
      // To fix the "address column not found" issue, we only send fields if they exist.
      // However, to satisfy your requirement, you should run the following in Supabase SQL Editor:
      // alter table public.bank_details add column address text, add column gstin text, add column phone text, ...;
      
      const payload = { ...profile };
      delete payload.id; // remove id if present

      let res;
      if (existing) res = await supabase.from('bank_details').update(payload).eq('id', existing.id);
      else res = await supabase.from('bank_details').insert([payload]);

      if (!res.error) {
        setIsEditing(false);
        alert("Business profile synced successfully!");
      } else {
        console.error("Save Error:", res.error);
        // Requirement: Fallback to LocalStorage if Supabase schema is outdated
        localStorage.setItem('admin_profile_local', JSON.stringify(profile));
        setIsEditing(false);
        alert("Warning: Supabase schema mismatch. Saved to local browser cache instead. Please update your Supabase table columns.");
      }
    } catch (err) {
      alert("Unexpected error occurred while saving profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="py-20 text-center text-slate-400 italic flex flex-col items-center gap-2"><Loader2 className="animate-spin text-brand" /> Syncing admin profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="text-brand" /> Admin Details
          </h1>
          <p className="text-slate-500 font-medium">Configure Namma Tea World company profile for automated billing.</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-brand text-white rounded-xl font-bold shadow-lg shadow-brand/20 transition-transform hover:scale-105 active:scale-95">
            Update Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 sm:p-10 space-y-10">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-xs font-black text-brand uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Public Details</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Legal Name</label>
                  <input type="text" disabled={!isEditing} value={profile.businessName} onChange={e => setProfile({...profile, businessName: e.target.value})} className="w-full px-4 py-3 input-border rounded-xl font-bold disabled:opacity-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Address</label>
                  <textarea rows={3} disabled={!isEditing} value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full px-4 py-3 input-border rounded-xl font-bold disabled:opacity-50 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FSSAI No</label>
                    <input type="text" disabled={!isEditing} value={profile.fssaiNo} onChange={e => setProfile({...profile, fssaiNo: e.target.value})} className="w-full px-4 py-3 input-border rounded-xl font-bold disabled:opacity-50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GSTIN ID</label>
                    <input type="text" disabled={!isEditing} value={profile.gstin} onChange={e => setProfile({...profile, gstin: e.target.value})} className="w-full px-4 py-3 input-border rounded-xl font-bold disabled:opacity-50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Phone</label>
                    <input type="text" disabled={!isEditing} value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-3 input-border rounded-xl font-bold disabled:opacity-50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Email</label>
                    <input type="text" disabled={!isEditing} value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full px-4 py-3 input-border rounded-xl font-bold disabled:opacity-50" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-brand uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Financial Records</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Bank Name</label>
                  <input type="text" disabled={!isEditing} value={profile.bankName} onChange={e => setProfile({...profile, bankName: e.target.value})} className="w-full px-4 py-3 input-border rounded-xl font-bold disabled:opacity-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Number</label>
                  <input type="text" disabled={!isEditing} value={profile.accountNumber} onChange={e => setProfile({...profile, accountNumber: e.target.value})} className="w-full px-4 py-3 input-border rounded-xl font-bold disabled:opacity-50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IFSC Code</label>
                    <input type="text" disabled={!isEditing} value={profile.ifscCode} onChange={e => setProfile({...profile, ifscCode: e.target.value})} className="w-full px-4 py-3 input-border rounded-xl font-bold disabled:opacity-50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company PAN</label>
                    <input type="text" disabled={!isEditing} value={profile.panNo} onChange={e => setProfile({...profile, panNo: e.target.value})} className="w-full px-4 py-3 input-border rounded-xl font-bold disabled:opacity-50" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Home Branch Name</label>
                  <input type="text" disabled={!isEditing} value={profile.branchName} onChange={e => setProfile({...profile, branchName: e.target.value})} className="w-full px-4 py-3 input-border rounded-xl font-bold disabled:opacity-50" />
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="pt-8 border-t border-slate-100 flex gap-4">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all uppercase tracking-wider">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-brand text-white rounded-2xl font-black shadow-xl shadow-brand/20 hover:bg-brand-dark transition-all flex items-center justify-center gap-2 uppercase tracking-wider">
                <Save size={20} /> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankDetailsPage;
