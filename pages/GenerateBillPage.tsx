
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  FileCheck, 
  User, 
  Package, 
  Plus, 
  Trash2, 
  Printer, 
  Zap, 
  CreditCard,
  Building2,
  Check,
  Eye,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Client, Product, BankDetails, BillItem, Bill } from '../types';
import { generateId, numberToWords } from '../utils/helpers';
import { supabase } from '../utils/supabase';

interface GenerateBillPageProps {
  mode: 'create' | 'edit' | 'view';
}

const GenerateBillPage: React.FC<GenerateBillPageProps> = ({ mode }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [adminBank, setAdminBank] = useState<BankDetails | null>(null);
  const [showWatermark, setShowWatermark] = useState(true);
  const [isPreview, setIsPreview] = useState(mode === 'view');
  const [isLoading, setIsLoading] = useState(true);

  // Bill Construction State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [billNumber, setBillNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`);
  
  const fetchInitialData = async () => {
    setIsLoading(true);
    
    const [clientsRes, productsRes, bankRes] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('products').select('*'),
      supabase.from('bank_details').select('*').limit(1).single()
    ]);

    if (clientsRes.data) setClients(clientsRes.data);
    if (productsRes.data) setProducts(productsRes.data);
    if (bankRes.data) setAdminBank(bankRes.data);

    if (id) {
      const { data } = await supabase
        .from('bills')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setBillNumber(data.billNumber);
        setSelectedClientId(data.clientId);
        setBillItems(data.items || []);
        setShowWatermark(data.watermark ?? true);
        
        // Handle immediate print trigger from query params
        if (searchParams.get('print') === 'true') {
          setIsPreview(true);
          setTimeout(() => {
            window.print();
          }, 1200);
        }
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, [id, mode]);

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

  const subTotal = useMemo(() => billItems.reduce((acc, item) => acc + item.amount, 0), [billItems]);
  const cgst = useMemo(() => subTotal * 0.09, [subTotal]);
  const sgst = useMemo(() => subTotal * 0.09, [subTotal]);
  const grandTotal = subTotal + cgst + sgst;

  const addProductToBill = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = billItems.find(item => item.productId === productId);
    if (existing) {
      setBillItems(billItems.map(item => item.productId === productId 
        ? { ...item, quantity: item.quantity + 1, amount: (item.quantity + 1) * item.price } 
        : item));
    } else {
      setBillItems([...billItems, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        amount: product.price
      }]);
    }
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setBillItems(billItems.map(item => item.productId === id 
      ? { ...item, quantity: qty, amount: qty * item.price } 
      : item));
  };

  const removeItem = (id: string) => {
    setBillItems(billItems.filter(item => item.productId !== id));
  };

  const handleSaveBill = async () => {
    if (!selectedClient || billItems.length === 0) {
      alert("Please select a client and add at least one product.");
      return;
    }

    setIsLoading(true);
    const billData = {
      billNumber,
      date: new Date().toISOString(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      items: billItems,
      subTotal,
      cgst,
      sgst,
      totalAmount: grandTotal,
      watermark: showWatermark
    };

    let response;
    if (mode === 'edit' && id) {
      response = await supabase.from('bills').update(billData).eq('id', id);
    } else {
      response = await supabase.from('bills').insert([{ ...billData, id: generateId() }]);
    }

    if (response.error) {
      alert("Error saving bill: " + response.error.message);
    } else {
      navigate('/dashboard/bills');
    }
    setIsLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="animate-spin" size={40} />
        <p className="font-medium">Loading Bill Data...</p>
      </div>
    );
  }

  // Preview or View Mode
  if (isPreview || mode === 'view') {
    return (
      <div className="animate-in fade-in duration-500 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 no-print gap-4">
          <button onClick={() => mode === 'view' ? navigate('/dashboard/bills') : setIsPreview(false)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 font-bold hover:text-indigo-600 transition-colors flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center">
            <ArrowLeft size={18} /> {mode === 'view' ? 'Back to List' : 'Back to Editor'}
          </button>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
             <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl flex-1 sm:flex-initial">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Watermark</span>
              <button 
                onClick={() => setShowWatermark(!showWatermark)}
                className={`w-10 h-5 rounded-full transition-colors relative ${showWatermark ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${showWatermark ? 'left-5.5' : 'left-0.5'}`}></div>
              </button>
            </div>
            <button onClick={handlePrint} className="flex-1 sm:flex-initial px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              <Printer size={18} /> Print Invoice
            </button>
            {mode !== 'view' && (
              <button onClick={handleSaveBill} className="flex-1 sm:flex-initial px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                <Check size={18} /> {mode === 'edit' ? 'Update' : 'Save'}
              </button>
            )}
          </div>
        </div>

        {/* The Invoice View - Styled for A4 */}
        <div className="bg-white p-6 sm:p-12 shadow-2xl border border-slate-100 max-w-[21cm] mx-auto min-h-[29.7cm] relative overflow-hidden" id="invoice-print">
          {showWatermark && <div className="watermark">TAMIL</div>}
          
          <div className="flex justify-between items-start mb-8 sm:mb-12 border-b-4 border-indigo-600 pb-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">TAX INVOICE</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">{adminBank?.accountHolderName || 'TAMIL ENTERPRISES'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Invoice Number</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{billNumber}</p>
              <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-12 text-[10px] sm:text-sm">
            <div>
              <p className="font-bold text-indigo-600 uppercase tracking-widest mb-3">Billed By</p>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-2">{adminBank?.accountHolderName || 'TAMIL ENTERPRISES'}</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Corporate Office, Business Hub,<br />
                Salem, Tamil Nadu - 636001<br />
                GSTIN: 33AAAAA0000A1Z5
              </p>
              <div className="font-mono text-slate-400">
                Bank: {adminBank?.bankName || 'N/A'}<br />
                A/C: {adminBank?.accountNumber || 'N/A'}<br />
                IFSC: {adminBank?.ifscCode || 'N/A'}
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-indigo-600 uppercase tracking-widest mb-3">Billed To</p>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-2">{selectedClient?.name || 'Walk-in Client'}</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                {selectedClient?.address || 'No Address Provided'}
              </p>
              <div className="text-slate-500 font-medium">
                Email: {selectedClient?.email}<br />
                Phone: {selectedClient?.phone}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mb-8 sm:mb-12">
            <table className="w-full text-[10px] sm:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-4 text-left font-black text-slate-900 uppercase tracking-widest">Description</th>
                  <th className="py-4 text-center font-black text-slate-900 uppercase tracking-widest">Qty</th>
                  <th className="py-4 text-right font-black text-slate-900 uppercase tracking-widest">Rate</th>
                  <th className="py-4 text-right font-black text-slate-900 uppercase tracking-widest">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-4 text-center text-slate-600 font-medium">{item.quantity}</td>
                    <td className="py-4 text-right text-slate-600 font-medium">₹{item.price.toLocaleString()}</td>
                    <td className="py-4 text-right font-black text-slate-900">₹{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-8 sm:mb-12">
            <div className="w-full sm:w-80 space-y-4 text-[10px] sm:text-sm">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span>₹{subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>CGST (9%)</span>
                <span>₹{cgst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>SGST (9%)</span>
                <span>₹{sgst.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t-2 border-slate-900 flex justify-between">
                <span className="font-black text-slate-900 uppercase tracking-wider">Grand Total</span>
                <span className="font-black text-xl sm:text-2xl text-indigo-600">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mb-8 sm:mb-12 p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Amount in Words</p>
            <p className="text-xs sm:text-sm font-black text-slate-900 italic">{numberToWords(Math.round(grandTotal))}</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-end gap-8 mt-12 sm:mt-20">
            <div className="max-w-xs text-[9px] sm:text-[10px] text-slate-400 leading-relaxed italic">
              * This is a computer-generated invoice.<br />
              * Goods once sold will not be taken back.<br />
              * All disputes are subject to Salem, TN jurisdiction.
            </div>
            <div className="text-center w-full sm:w-auto">
              <div className="h-16 w-40 sm:h-20 sm:w-48 border-b border-slate-300 mb-3 mx-auto flex items-center justify-center opacity-30">
                <p className="text-[10px] text-slate-400">Authorized Signature</p>
              </div>
              <p className="font-black text-slate-900 text-[10px] sm:text-xs uppercase">For {adminBank?.accountHolderName || 'TAMIL ENTERPRISES'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Editor Mode (Simplified for brevity)
  return (
    <div className="space-y-8 animate-in fade-in duration-500 no-print">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Zap className="text-indigo-600" /> {mode === 'edit' ? 'Update Invoice' : 'Create GST Bill'}
          </h1>
          <p className="text-slate-500 text-sm">Fill in details below to generate a new invoice.</p>
        </div>
        <button 
          onClick={() => setIsPreview(true)}
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <Eye size={20} /> Preview & Print
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><User size={24} /></div>
              <div><h2 className="text-xl font-bold text-slate-900">Client Selection</h2></div>
            </div>
            <select 
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-semibold"
            >
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><Package size={24} /></div>
              <div><h2 className="text-xl font-bold text-slate-900">Inventory Items</h2></div>
            </div>
            <div className="space-y-6">
              <select 
                onChange={(e) => { if (e.target.value) { addProductToBill(e.target.value); e.target.value = ''; } }}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-semibold"
              >
                <option value="">Add a product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}
              </select>
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                    <tr><th className="px-6 py-4">Item</th><th className="px-6 py-4">Qty</th><th className="px-6 py-4">Total</th><th className="px-6 py-4"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {billItems.length > 0 ? billItems.map((item) => (
                      <tr key={item.productId} className="group hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold">{item.name}</td>
                        <td className="px-6 py-4">
                          <input type="number" min="1" value={item.quantity} onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)} className="w-14 px-2 py-1 border border-slate-200 rounded-lg text-center" />
                        </td>
                        <td className="px-6 py-4 font-black text-indigo-600">₹{item.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => removeItem(item.productId)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    )) : <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">No items added.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 text-white p-6 sm:p-8 rounded-[2.5rem] shadow-2xl sticky top-24">
            <h2 className="text-xl font-bold mb-8 uppercase tracking-widest text-indigo-400">Bill Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-slate-400 text-sm"><span>Subtotal</span><span className="text-white">₹{subTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-400 text-sm"><span>GST (18%)</span><span className="text-white">₹{(cgst + sgst).toLocaleString()}</span></div>
              <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Grand Total</span>
                <span className="text-2xl font-black text-white">₹{grandTotal.toLocaleString()}</span>
              </div>
              <div className="pt-8 space-y-4">
                <button onClick={() => setIsPreview(true)} disabled={!selectedClient || billItems.length === 0} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 disabled:opacity-50 transition-all">PREVIEW & PRINT</button>
                <button onClick={handleSaveBill} disabled={!selectedClient || billItems.length === 0} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all">SAVE INVOICE</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ShieldCheck = ({size, className}: {size?: number, className?: string}) => <Zap size={size} className={className} />;

export default GenerateBillPage;
