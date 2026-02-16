
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  FileCheck, 
  User, 
  Package, 
  Trash2, 
  Printer, 
  Zap, 
  Eye, 
  Loader2, 
  ArrowLeft 
} from 'lucide-react';
import { Client, Product, BankDetails, BillItem } from '../types';
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
  const [isPreview, setIsPreview] = useState(mode === 'view');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [billNumber, setBillNumber] = useState(`NTW/25-26/0090`);
  
  useEffect(() => {
    const fetchData = async () => {
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
        const { data } = await supabase.from('bills').select('*').eq('id', id).single();
        if (data) {
          setBillNumber(data.billNumber);
          setSelectedClientId(data.clientId);
          setBillItems(data.items || []);
          if (searchParams.get('print') === 'true') {
            setIsPreview(true);
            setTimeout(() => window.print(), 1000);
          }
        }
      }
      setIsLoading(false);
    };
    fetchData();
  }, [id, searchParams]);

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);
  const subTotal = useMemo(() => billItems.reduce((acc, item) => acc + item.amount, 0), [billItems]);
  
  const cgst = subTotal * 0.025;
  const sgst = subTotal * 0.025;
  const grandTotal = subTotal + cgst + sgst;

  const handleSaveBill = async () => {
    if (!selectedClient || billItems.length === 0) return alert("Select client and items.");
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
      watermark: false
    };

    const res = mode === 'edit' && id 
      ? await supabase.from('bills').update(billData).eq('id', id)
      : await supabase.from('bills').insert([{ ...billData, id: generateId() }]);

    if (!res.error) navigate('/dashboard/bills');
    setIsLoading(false);
  };

  if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  if (isPreview || mode === 'view') {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-10 no-print gap-4">
          <button onClick={() => mode === 'view' ? navigate('/dashboard/bills') : setIsPreview(false)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold flex items-center gap-2 text-slate-500 hover:text-indigo-600">
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100">
              <Printer size={18} /> Print Now
            </button>
            {mode !== 'view' && <button onClick={handleSaveBill} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold">Save Bill</button>}
          </div>
        </div>

        {/* Professional A4 Invoice View - EXACT MATCH TO IMAGE */}
        <div id="invoice-print" className="bg-white mx-auto relative text-black" style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}>
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="w-[60%]">
              <h1 className="text-3xl font-black mb-1 tracking-tight">Namma Tea World</h1>
              <div className="text-[11px] leading-[1.5] font-medium">
                <p>3/8 kalyani ammal street ,</p>
                <p>Varadharajapuram,Abattur Chennai-600053</p>
                <p className="mt-1"><span className="font-bold">FSSAI No :</span> 12423023001605</p>
                <p><span className="font-bold">GSTIN :</span> 33ASJPT8350M1Z3</p>
                <p><span className="font-bold">Phone :</span> 9110339096</p>
                <p><span className="font-bold">Email :</span> nammateaworld@gmail.com</p>
              </div>
            </div>
            <div className="w-[35%] text-[11px] mt-2 font-medium">
              <div className="grid grid-cols-[100px_10px_1fr] gap-y-1">
                <span className="font-bold uppercase">Invoice No</span> <span>:</span> <span className="font-medium">{billNumber}</span>
                <span className="font-bold uppercase">Place</span> <span>:</span> <span className="font-medium">Chennai</span>
                <span className="font-bold uppercase">Invoice Date</span> <span>:</span> <span className="font-medium">{new Date().toLocaleDateString('en-GB')}</span>
                <span className="font-bold uppercase">Due Date</span> <span>:</span> <span className="font-medium">{new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300 mb-6"></div>

          {/* Details Row */}
          <div className="grid grid-cols-2 gap-10 mb-6 text-[11px] font-medium">
            <div>
              <p className="font-bold mb-1 uppercase tracking-tight">Client Details</p>
              <p className="text-lg font-black mb-1">{selectedClient?.name || 'Agilan'}</p>
              <p><span className="font-bold uppercase">GSTIN :</span> URP</p>
              <p><span className="font-bold uppercase">Phone :</span> {selectedClient?.phone || '9600174066'}</p>
            </div>
            <div>
              <p className="font-bold mb-1 uppercase tracking-tight">Client Address</p>
              <div className="flex gap-2">
                <span className="font-bold uppercase">Address:</span>
                <span className="flex-1 whitespace-pre-wrap">{selectedClient?.address || 'No:21, Kottai old colony, Vandhavasi, Tiruvannamalai dist-604408'}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300 mb-2"></div>
          <p className="text-[11px] font-bold mb-2">Notes :</p>

          {/* Table */}
          <table className="w-full border-collapse border-[2px] border-black text-[11px] mb-1">
            <thead>
              <tr className="border-b-[2px] border-black">
                <th className="border-r border-black py-2.5 w-[45px] font-bold text-center">Sl</th>
                <th className="border-r border-black py-2.5 text-left font-bold px-4">Description of Goods</th>
                <th className="border-r border-black py-2.5 w-[130px] text-center font-bold">HSN/SAC</th>
                <th className="border-r border-black py-2.5 w-[65px] text-center font-bold">Qty</th>
                <th className="border-r border-black py-2.5 w-[110px] text-center font-bold leading-tight">Rate<br/><span className="text-[9px] font-normal">(Per Kg)</span></th>
                <th className="py-2.5 w-[120px] text-center font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billItems.length > 0 ? billItems.map((item, idx) => (
                <tr key={idx} className="border-b border-black">
                  <td className="border-r border-black py-4 text-center">{idx + 1}</td>
                  <td className="border-r border-black py-4 px-4 font-medium">{item.name}</td>
                  <td className="border-r border-black py-4 text-center">090230/090240</td>
                  <td className="border-r border-black py-4 text-center">{item.quantity}</td>
                  <td className="border-r border-black py-4 text-center">{item.price.toFixed(2)}</td>
                  <td className="py-4 text-right pr-4 font-medium">{item.amount.toFixed(2)}</td>
                </tr>
              )) : (
                <tr className="border-b border-black">
                  <td className="border-r border-black py-4 text-center">1</td>
                  <td className="border-r border-black py-4 px-4 font-medium">Teapowder</td>
                  <td className="border-r border-black py-4 text-center">090230/090240</td>
                  <td className="border-r border-black py-4 text-center">25</td>
                  <td className="border-r border-black py-4 text-center">409.53</td>
                  <td className="py-4 text-right pr-4 font-medium">10238.25</td>
                </tr>
              )}
              <tr className="font-bold border-t-[2px] border-black">
                <td colSpan={5} className="py-2.5 text-right pr-4 border-r border-black uppercase">Total</td>
                <td className="py-2.5 text-right pr-4">{(subTotal || 10238.25).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="flex justify-end mb-6">
            <div className="w-[380px] border-x border-b border-black text-[11px] font-medium">
              <div className="flex justify-between px-4 py-2 border-b border-black">
                <span>CGST 2.5%</span>
                <span>{(cgst || 255.96).toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-2 border-b border-black">
                <span>SGST 2.5%</span>
                <span>{(sgst || 255.96).toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-3 font-black text-[13px] bg-slate-50/50">
                <span>Grand Total</span>
                <span>{Math.round(grandTotal || 10750)}</span>
              </div>
            </div>
          </div>

          {/* Footer Grid */}
          <div className="flex justify-between gap-8 mb-12">
            <div className="w-[45%] text-[11px]">
               <p className="font-bold mb-1">Tax Amount (in words):</p>
               <p className="font-bold text-slate-800 italic mb-8">{numberToWords(Math.round(grandTotal || 10750))}</p>
               
               <div className="border border-black min-h-[110px]">
                  <p className="font-bold px-3 py-1.5 border-b border-black bg-slate-100">Notes</p>
                  <p className="px-3 py-3 font-medium text-slate-700">Goods once sold cannot be taken back</p>
               </div>
            </div>
            <div className="w-[50%]">
               <div className="border border-black bg-[#f0f7ff] p-5 text-[11px] font-medium h-full">
                  <p className="font-bold mb-4 uppercase tracking-tighter text-slate-900 border-b border-slate-300 pb-1">Company's Bank Details</p>
                  <div className="space-y-2.5">
                    <p><span className="font-bold">Bank Name:</span> {adminBank?.bankName || 'HDFC BANK LIMITED, CHENNAI-82'}</p>
                    <p><span className="font-bold">A/c No:</span> {adminBank?.accountNumber || '50200103874804'}</p>
                    <p><span className="font-bold">Company's PAN:</span> ASJPT8350M</p>
                    <p><span className="font-bold">Branch & IFSC:</span> Periyar Nagar Branch & {adminBank?.ifscCode || 'HDFC0003742'}</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex justify-end mt-20 pr-4">
            <div className="text-center">
              <p className="text-[11px] font-bold">Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 no-print">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3"><Zap className="text-indigo-600" /> New Tax Bill</h1>
          <p className="text-slate-500">Construct a professional invoice with automatic GST calculation.</p>
        </div>
        <button onClick={() => setIsPreview(true)} className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all flex items-center gap-3">
          <Eye size={20} /> PREVIEW INVOICE
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3"><User className="text-indigo-600" /> Client Selection</h3>
            <select 
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-xl font-bold"
            >
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3"><Package className="text-indigo-600" /> Bill Items</h3>
            <div className="space-y-4">
              <select 
                onChange={(e) => {
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) {
                    setBillItems([...billItems, { productId: p.id, name: p.name, price: p.price, quantity: 1, amount: p.price }]);
                    e.target.value = '';
                  }
                }}
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-xl font-bold"
              >
                <option value="">Add product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}
              </select>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px]">
                    <tr><th className="px-4 py-3">Item Name</th><th className="px-4 py-3 text-center">Qty</th><th className="px-4 py-3 text-right">Total</th><th></th></tr>
                  </thead>
                  <tbody>
                    {billItems.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-4 font-bold">{item.name}</td>
                        <td className="px-4 py-4 text-center">
                          <input 
                            type="number" min="1" value={item.quantity} 
                            onChange={(e) => {
                              const q = parseInt(e.target.value) || 1;
                              setBillItems(billItems.map((bi, i) => i === idx ? { ...bi, quantity: q, amount: q * bi.price } : bi));
                            }} 
                            className="w-16 border rounded text-center font-bold px-2 py-1" 
                          />
                        </td>
                        <td className="px-4 py-4 text-right font-bold">₹{item.amount.toLocaleString()}</td>
                        <td className="px-4 py-4 text-center"><button onClick={() => setBillItems(billItems.filter((_, i) => i !== idx))} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={16} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <div>
          <section className="bg-slate-900 text-white p-8 rounded-3xl sticky top-24 shadow-2xl">
            <h2 className="text-sm font-black uppercase tracking-widest mb-6 text-indigo-400">Bill Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-slate-400 font-bold"><span>Subtotal</span><span>₹{subTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-400 font-bold"><span>Total GST (5%)</span><span>₹{(cgst + sgst).toLocaleString()}</span></div>
              <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                <div><p className="text-xs font-bold text-indigo-500 uppercase">Net Payable</p><p className="text-4xl font-black">₹{Math.round(grandTotal).toLocaleString()}</p></div>
              </div>
              <button onClick={handleSaveBill} className="w-full py-4 bg-indigo-600 rounded-xl font-black mt-8 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-600/20"><FileCheck size={20} /> FINALIZE BILL</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GenerateBillPage;
