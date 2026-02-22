import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  X,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Loader2,
  Hash,
  FileText
} from 'lucide-react';
import { Client } from '../types';
import { generateId } from '../utils/helpers';
import { supabase } from '../utils/supabase';
import Modal from '../components/Modal';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  console.log(clients,'clients')
  
  // Updated form data with gstin and fssaino
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    fssaino: ''
  });

  const fetchClients = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (data) setClients(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // ===== GENERATE NEXT CLIENT ID - Fixed Function =====
  const generateNextClientId = async (): Promise<string> => {
    try {
      // Fetch all client IDs from database to find the maximum
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .like('id', 'CL-%')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching client IDs:', error);
        // Fallback: generate UUID-based ID if error
        return `CL-${Date.now()}`;
      }

      if (!data || data.length === 0) {
        // No clients exist, start with CL-001
        return 'CL-001';
      }

      // Find the highest number from existing IDs
      let maxNumber = 0;
      
      for (const client of data) {
        if (client.id && client.id.startsWith('CL-')) {
          const numPart = client.id.split('-')[1];
          const num = parseInt(numPart, 10);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      }

      // Generate next ID
      const nextNumber = maxNumber + 1;
      const nextId = `CL-${nextNumber.toString().padStart(3, '0')}`;
      
      console.log('Generated next client ID:', nextId);
      return nextId;
      
    } catch (err) {
      console.error('Error generating client ID:', err);
      // Fallback: generate timestamp-based ID
      return `CL-${Date.now()}`;
    }
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const clientData = { 
      ...formData,
      dateAdded: new Date().toISOString()
    };

    try {
      if (currentClient) {
        // UPDATE existing client
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', currentClient.id);
        
        if (error) {
          console.error('Update error:', error);
          alert('Error updating client. Please try again.');
        } else {
          setClients(clients.map(c => c.id === currentClient.id ? { ...c, ...clientData } : c));
          closeModals();
        }
      } else {
        // CREATE new client - Generate ID from database
        const nextId = await generateNextClientId();
        
        const { error } = await supabase
          .from('clients')
          .insert([{ ...clientData, id: nextId }]);
        
        if (error) {
          console.error('Insert error:', error);
          
          // If duplicate key error, try again with a new ID
          if (error.code === '23505') {
            console.log('Duplicate ID detected, retrying...');
            const retryId = await generateNextClientId();
            
            const { error: retryError } = await supabase
              .from('clients')
              .insert([{ ...clientData, id: retryId }]);
            
            if (retryError) {
              alert('Error creating client. Please try again.');
            } else {
              setClients([...clients, { ...clientData, id: retryId }]);
              closeModals();
            }
          } else {
            alert('Error creating client. Please try again.');
          }
        } else {
          setClients([...clients, { ...clientData, id: nextId }]);
          closeModals();
        }
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (currentClient) {
      const { error } = await supabase.from('clients').delete().eq('id', currentClient.id);
      if (!error) setClients(clients.filter(c => c.id !== currentClient.id));
    }
    closeModals();
  };

  const closeModals = () => {
    setAddModalOpen(false);
    setDeleteModalOpen(false);
    setCurrentClient(null);
    setFormData({ name: '', email: '', phone: '', address: '', gstin: '', fssaino: '' });
  };

  const openEdit = (c: Client) => {
    setCurrentClient(c);
    setFormData({ 
      name: c.name, 
      email: c.email || '', 
      phone: c.phone, 
      address: c.address,
      gstin: c.gstin || '',
      fssaino: c.fssaino || ''
    });
    setAddModalOpen(true);
  };

  const filteredClients = clients.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="text-brand" /> Delivery Partners
          </h1>
          <p className="text-slate-500">Maintain records of tea distributors and retail network.</p>
        </div>
        <button 
          onClick={() => setAddModalOpen(true)}
          className="px-5 py-2.5 bg-brand text-white rounded-xl font-bold shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Add New Partner
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search partners by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 input-border rounded-xl transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-slate-400 italic flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-brand" /> Syncing network directory...
          </div>
        ) : filteredClients.length > 0 ? filteredClients.map((client) => (
          <div key={client.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button onClick={() => openEdit(client)} className="p-2 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"><Edit2 size={16}/></button>
              <button onClick={() => { setCurrentClient(client); setDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand/5 flex items-center justify-center text-brand font-black text-xl">
                {client.name[0]}
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-slate-900 text-lg truncate pr-10">{client.name}</h3>
                <p className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-1">
                  <Hash size={10} /> {client.id}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Phone size={16} className="text-brand shrink-0" />
                <span className="font-medium">{client.phone}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-500">
                <MapPin size={16} className="text-brand shrink-0 mt-1" />
                <span className="line-clamp-2 leading-relaxed">{client.address}</span>
              </div>
              
              {/* Display GSTIN if available */}
              {client.gstin && (
                <div className="flex items-center gap-3 text-sm text-slate-500 pt-3 border-t border-slate-100">
                  <FileText size={16} className="text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-400 uppercase">GSTIN: {client.gstin}</span>
                </div>
              )}
              
              {/* Display FSSAI No if available */}
              {client.fssaino && (
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <CreditCard size={16} className="text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-400 uppercase">FSSAI: {client.fssaino}</span>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 opacity-50">
            <Users size={48} className="mx-auto mb-4" />
            <p className="font-bold text-lg">No partners found</p>
            <p className="text-sm">Start building your tea distribution network.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-brand">{currentClient ? 'Update Partner Info' : 'New Partner Enrollment'}</h3>
              <button onClick={closeModals} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddOrUpdate} className="p-8 grid md:grid-cols-2 gap-6">
              {/* Legal Name */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Legal Name</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 input-border rounded-xl font-bold"
                  placeholder="Enter Partner Name"
                />
              </div>

              {/* Official Email */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Official Email</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 input-border rounded-xl font-bold"
                  placeholder="partner@example.com"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone (Primary)</label>
                <input 
                  type="text" required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 input-border rounded-xl font-bold"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              {/* GSTIN */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">GSTIN</label>
                <input 
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({...formData, gstin: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 input-border rounded-xl font-bold"
                  placeholder="GST Identification Number"
                />
              </div>

              {/* FSSAI No */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">FSSAI No</label>
                <input 
                  type="text"
                  value={formData.fssaino}
                  onChange={(e) => setFormData({...formData, fssaino: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 input-border rounded-xl font-bold"
                  placeholder="Food Safety and Standards Authority License Number"
                />
              </div>

              {/* Business Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Business Address</label>
                <textarea 
                  required rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 input-border rounded-xl font-bold resize-none"
                  placeholder="Complete Business Address"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 flex gap-4 md:col-span-2">
                <button 
                  type="button" 
                  onClick={closeModals} 
                  disabled={isSaving}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all uppercase tracking-wider disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-4 bg-brand text-white rounded-2xl font-black shadow-xl shadow-brand/20 hover:bg-brand-dark transition-all uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {currentClient ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    currentClient ? 'Apply Changes' : 'Enroll Partner'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal 
        isOpen={isDeleteModalOpen}
        onClose={closeModals}
        onConfirm={handleDelete}
        title="Remove Partner"
        message={`Confirm deletion of "${currentClient?.name}". Historical billing data will be preserved.`}
      />
    </div>
  );
};

export default ClientsPage;