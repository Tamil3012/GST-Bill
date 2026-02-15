
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
  Loader2
} from 'lucide-react';
import { Client } from '../types';
import { generateId } from '../utils/helpers';
import { supabase } from '../utils/supabase';
import Modal from '../components/Modal';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bankAccount: ''
  });

  const fetchClients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (data) setClients(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientData = { 
      ...formData,
      dateAdded: new Date().toISOString()
    };

    if (currentClient) {
      const { error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', currentClient.id);
      
      if (!error) {
        setClients(clients.map(c => c.id === currentClient.id ? { ...c, ...clientData } : c));
      }
    } else {
      const newId = generateId();
      const { error } = await supabase
        .from('clients')
        .insert([{ ...clientData, id: newId }]);
      
      if (!error) {
        setClients([...clients, { ...clientData, id: newId }]);
      }
    }
    closeModals();
  };

  const handleDelete = async () => {
    if (currentClient) {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', currentClient.id);
      
      if (!error) {
        setClients(clients.filter(c => c.id !== currentClient.id));
      }
    }
    closeModals();
  };

  const closeModals = () => {
    setAddModalOpen(false);
    setDeleteModalOpen(false);
    setCurrentClient(null);
    setFormData({ name: '', email: '', phone: '', address: '', bankAccount: '' });
  };

  const openEdit = (c: Client) => {
    setCurrentClient(c);
    setFormData({ 
      name: c.name, 
      email: c.email, 
      phone: c.phone, 
      address: c.address, 
      bankAccount: c.bankAccount 
    });
    setAddModalOpen(true);
  };

  const filteredClients = clients.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="text-indigo-600" /> Client Directory
          </h1>
          <p className="text-slate-500">Manage your business partners and client contact information.</p>
        </div>
        <button 
          onClick={() => setAddModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Add New Client
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search clients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="col-span-full py-20 text-center text-slate-400 italic">Syncing client database...</div>
        ) : filteredClients.length > 0 ? filteredClients.map((client) => (
          <div key={client.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button onClick={() => openEdit(client)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={16}/></button>
              <button onClick={() => { setCurrentClient(client); setDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
                {client.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg truncate w-40">{client.name}</h3>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Client</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Mail size={16} className="text-slate-400" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Phone size={16} className="text-slate-400" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-500">
                <MapPin size={16} className="text-slate-400 mt-1 shrink-0" />
                <span className="line-clamp-2">{client.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 pt-3 border-t border-slate-50">
                <CreditCard size={16} className="text-slate-400" />
                <span className="font-mono text-xs">{client.bankAccount}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-slate-100">
            <div className="flex flex-col items-center justify-center opacity-30">
              <Users size={48} className="mb-4" />
              <p className="font-bold text-lg">No clients found</p>
              <p className="text-sm">Manage your relationships by adding your first client.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">{currentClient ? 'Update Client Details' : 'Add New Client'}</h3>
              <button onClick={closeModals} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddOrUpdate} className="p-8 grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Phone Number</label>
                <input 
                  type="text" required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Bank Account Details</label>
                <input 
                  type="text" required
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700">Mailing Address</label>
                <textarea 
                  required rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium resize-none"
                />
              </div>
              <div className="pt-4 flex gap-4 md:col-span-2">
                <button type="button" onClick={closeModals} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {currentClient ? 'Update Details' : 'Register Client'}
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
        title="Remove Client"
        message={`Are you sure you want to remove "${currentClient?.name}" from your directory? This will not delete their existing bills.`}
      />
    </div>
  );
};

export default ClientsPage;
