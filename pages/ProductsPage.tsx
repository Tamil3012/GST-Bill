
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  X,
  ChevronRight,
  ChevronLeft,
  Filter,
  Loader2
} from 'lucide-react';
import { Product } from '../types';
import { generateId } from '../utils/helpers';
import { supabase } from '../utils/supabase';
import Modal from '../components/Modal';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({ name: '', price: '' });

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (data) setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = { 
      name: formData.name, 
      price: Number(formData.price),
      dateAdded: new Date().toISOString()
    };

    if (currentProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', currentProduct.id);
      
      if (!error) {
        setProducts(products.map(p => p.id === currentProduct.id ? { ...p, ...productData } : p));
      }
    } else {
      const newId = generateId();
      const { error } = await supabase
        .from('products')
        .insert([{ ...productData, id: newId }]);
      
      if (!error) {
        setProducts([...products, { ...productData, id: newId }]);
      }
    }
    closeModals();
  };

  const handleDelete = async () => {
    if (currentProduct) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', currentProduct.id);
      
      if (!error) {
        setProducts(products.filter(p => p.id !== currentProduct.id));
      }
    }
    closeModals();
  };

  const closeModals = () => {
    setAddModalOpen(false);
    setDeleteModalOpen(false);
    setCurrentProduct(null);
    setFormData({ name: '', price: '' });
  };

  const openEdit = (p: Product) => {
    setCurrentProduct(p);
    setFormData({ name: p.name, price: String(p.price) });
    setAddModalOpen(true);
  };

  const filteredProducts = products.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="text-indigo-600" /> Inventory Management
          </h1>
          <p className="text-slate-500">Add, edit, or remove products from your catalog.</p>
        </div>
        <button 
          onClick={() => setAddModalOpen(true)}
          className="px-5 py-2.5 bg-brand text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-brand/70 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Unit Price</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                   <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">Syncing with database...</td>
                </tr>
              ) : filteredProducts.length > 0 ? filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{p.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-600 font-bold">₹{p.price.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(p.dateAdded).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEdit(p)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => { setCurrentProduct(p); setDeleteModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <Package size={48} className="mb-4" />
                      <p className="font-bold text-lg">No products found</p>
                      <p className="text-sm">Start by adding a new product to your inventory.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">{currentProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={closeModals} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddOrUpdate} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Product Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Premium Tea Powder"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Price (₹)</label>
                <input 
                  type="number"
                  required
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={closeModals} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-brand text-white rounded-xl font-bold shadow-xl shadow-indigo-100 hover:bg-brand/70 transition-all">
                  {currentProduct ? 'Save Changes' : 'Create Product'}
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
        title="Delete Product"
        message={`Are you sure you want to delete "${currentProduct?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default ProductsPage;
