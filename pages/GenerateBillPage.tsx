
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  FileCheck, 
  User, 
  Package, 
  Trash2, 
  Printer, 
  Plus,
  Minus,
  Zap, 
  Eye, 
  Loader2, 
  ArrowLeft,
  FileText,
  ChevronDown
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

  // Requirement: Default Place to Chennai, others empty
  const [billHeader, setBillHeader] = useState({
    invoiceNo: '',
    place: 'Chennai',
    date: '',
    dueDate: ''
  });
  const [selectedClientId, setSelectedClientId] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [taxRates, setTaxRates] = useState({ cgst: 2.5, sgst: 2.5 });
  
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
          setBillHeader({
            invoiceNo: data.billNumber,
            place: data.place || 'Chennai',
            date: data.date ? data.date.split('T')[0] : '',
            dueDate: data.dueDate ? data.dueDate.split('T')[0] : ''
          });
          setSelectedClientId(data.clientId);
          setBillItems(data.items || []);
          setTaxRates({ cgst: data.cgstRate || 2.5, sgst: data.sgstRate || 2.5 });
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
  
  const cgstAmount = subTotal * (taxRates.cgst / 100);
  const sgstAmount = subTotal * (taxRates.sgst / 100);
  const grandTotal = subTotal + cgstAmount + sgstAmount;

  const handleQtyChange = (idx: number, delta: number) => {
    setBillItems(prev => prev.map((item, i) => {
      if (i === idx) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, amount: newQty * item.price };
      }
      return item;
    }));
  };

  const handleSaveBill = async () => {
    if (!selectedClient || billItems.length === 0) return alert("Select client and items.");
    setIsLoading(true);
    const billData = {
      billNumber: billHeader.invoiceNo,
      place: billHeader.place,
      date: billHeader.date ? new Date(billHeader.date).toISOString() : new Date().toISOString(),
      dueDate: billHeader.dueDate ? new Date(billHeader.dueDate).toISOString() : new Date().toISOString(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      items: billItems,
      subTotal,
      cgstRate: taxRates.cgst,
      sgstRate: taxRates.sgst,
      cgstAmount,
      sgstAmount,
      totalAmount: grandTotal
    };

    const res = mode === 'edit' && id 
      ? await supabase.from('bills').update(billData).eq('id', id)
      : await supabase.from('bills').insert([{ ...billData, id: generateId() }]);

    if (!res.error) navigate('/dashboard/bills');
    else alert("Error saving bill. Please check your data.");
    setIsLoading(false);
  };

  if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-brand" /></div>;

  if (isPreview || mode === 'view') {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-10 no-print gap-4">
          <button onClick={() => mode === 'view' ? navigate('/dashboard/bills') : setIsPreview(false)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold flex items-center gap-2 text-slate-500 hover:text-brand">
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="px-6 py-2.5 bg-brand text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand/20">
              <Printer size={18} /> Print Invoice
            </button>
            {mode !== 'view' && <button onClick={handleSaveBill} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold">Save Final Bill</button>}
          </div>
        </div>

        {/* Professional A4 Invoice View */}
        <div id="invoice-print" className="bg-white mx-auto relative text-black" style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}>
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="w-[60%]">
              <h1 className="text-3xl font-black mb-1 tracking-tight text-brand uppercase">NAMMA TEA WORLD</h1>
              <div className="text-[11px] leading-[1.5] font-medium">
                <p>3/8 kalyani ammal street ,</p>
                <p>Varadharajapuram,Abattur Chennai-600053</p>
                <p className="mt-1"><span className="font-bold uppercase">FSSAI No :</span> 12423023001605</p>
                <p><span className="font-bold uppercase">GSTIN :</span> 33ASJPT8350M1Z3</p>
                <p><span className="font-bold uppercase">PHONE :</span> 9110339096</p>
                <p><span className="font-bold uppercase">EMAIL :</span> nammateaworld@gmail.com</p>
              </div>
            </div>
            <div className="w-[35%] text-[11px] mt-2 font-medium">
              <div className="grid grid-cols-[100px_10px_1fr] gap-y-1">
                <span className="font-bold uppercase">INVOICE NO</span> <span>:</span> <span className="font-medium">{billHeader.invoiceNo || '-'}</span>
                <span className="font-bold uppercase">PLACE</span> <span>:</span> <span className="font-medium">{billHeader.place}</span>
                <span className="font-bold uppercase">INVOICE DATE</span> <span>:</span> <span className="font-medium">{billHeader.date ? new Date(billHeader.date).toLocaleDateString('en-GB') : '-'}</span>
                <span className="font-bold uppercase">DUE DATE</span> <span>:</span> <span className="font-medium">{billHeader.dueDate ? new Date(billHeader.dueDate).toLocaleDateString('en-GB') : '-'}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-black mb-6"></div>

          {/* Details Row */}
          <div className="grid grid-cols-2 gap-10 mb-6 text-[11px] font-medium">
            <div>
              <p className="font-bold mb-1 uppercase tracking-tight opacity-60">BILL TO</p>
              <p className="text-lg font-black mb-1">{selectedClient?.name || 'Customer'}</p>
              <p><span className="font-bold uppercase">GSTIN :</span> {selectedClient?.gst || 'URP'}</p>
              <p><span className="font-bold uppercase">PHONE :</span> {selectedClient?.phone || '-'}</p>
            </div>
            <div>
              <p className="font-bold mb-1 uppercase tracking-tight opacity-60">SHIP TO</p>
              <div className="flex gap-2">
                <span className="font-bold uppercase">ADDRESS:</span>
                <span className="flex-1 whitespace-pre-wrap">{selectedClient?.address || '-'}</span>
              </div>
            </div>
          </div>

          {/* Table - Dynamic based on number of products */}
          <table className="w-full border-collapse border-[2px] border-black text-[11px] mb-1">
            <thead className="bg-gray-100 print-bg-gray">
              <tr className="border-b-[2px] border-black">
                <th className="border-r border-black py-2.5 w-[45px] font-bold text-center">SI</th>
                <th className="border-r border-black py-2.5 text-left font-bold px-4">Description of Goods</th>
                <th className="border-r border-black py-2.5 w-[130px] text-center font-bold uppercase">HSN/SAC</th>
                <th className="border-r border-black py-2.5 w-[65px] text-center font-bold uppercase">QTY</th>
                <th className="border-r border-black py-2.5 w-[110px] text-center font-bold leading-tight uppercase">RATE<br/><span className="text-[9px] font-normal">(PER KG)</span></th>
                <th className="py-2.5 w-[120px] text-center font-bold uppercase">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {billItems.length > 0 ? (
                billItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="border-r border-black py-4 text-center">{idx + 1}</td>
                    <td className="border-r border-black py-4 px-4 font-medium">{item.name}</td>
                    <td className="border-r border-black py-4 text-center">090230</td>
                    <td className="border-r border-black py-4 text-center">{item.quantity}</td>
                    <td className="border-r border-black py-4 text-center">{item.price.toFixed(2)}</td>
                    <td className="py-4 text-right pr-4 font-medium">{item.amount.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-black">
                   <td colSpan={6} className="py-10 text-center text-slate-400 italic">No products added yet</td>
                </tr>
              )}
              {/* Grand Total Row */}
              {billItems.length > 0 && (
                <tr className="font-bold border-t-[2px] border-black">
                  <td colSpan={5} className="py-2.5 text-right pr-4 border-r border-black uppercase">Total Taxable Value</td>
                  <td className="py-2.5 text-right pr-4">{subTotal.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="flex justify-end mb-6">
            <div className="w-[380px] border-x border-b border-black text-[11px] font-medium">
              <div className="flex justify-between px-4 py-2 border-b border-black">
                <span className="uppercase font-bold">CGST {taxRates.cgst}%</span>
                <span>{cgstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-2 border-b border-black">
                <span className="uppercase font-bold">SGST {taxRates.sgst}%</span>
                <span>{sgstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-3 font-black text-[13px] bg-gray-100 print-bg-gray">
                <span className="uppercase text-brand">Grand Total</span>
                <span className="text-brand">{Math.round(grandTotal).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between gap-8 mb-12">
            <div className="w-[45%] text-[11px]">
               <p className="font-bold mb-1 uppercase opacity-60">Amount in Words:</p>
               <p className="font-bold text-slate-800 italic mb-8">{numberToWords(Math.round(grandTotal))}</p>
               
               <div className="border border-black min-h-[110px]">
                  <p className="font-bold px-3 py-1.5 border-b border-black bg-gray-100 print-bg-gray uppercase tracking-tighter">Notes</p>
                  <p className="px-3 py-3 font-medium text-slate-700">Goods once sold cannot be taken back</p>
               </div>
            </div>
            <div className="w-[50%]">
               <div className="border border-black bg-[#f0f7ff] p-5 text-[11px] font-medium h-full">
                  <p className="font-bold mb-4 uppercase tracking-tighter text-brand border-b border-brand/20 pb-1">Company's Bank Details</p>
                  <div className="space-y-2.5">
                    <p><span className="font-bold uppercase">Bank:</span> {adminBank?.bankName || 'HDFC BANK LIMITED'}</p>
                    <p><span className="font-bold uppercase">A/c No:</span> {adminBank?.accountNumber || '50200103874804'}</p>
                    <p><span className="font-bold uppercase">PAN:</span> {adminBank?.panNo || 'ASJPT8350M'}</p>
                    <p><span className="font-bold uppercase">IFSC:</span> {adminBank?.ifscCode || 'HDFC0003742'}</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex justify-end mt-20 pr-4">
            <div className="text-center">
              <div className="h-20 border-b border-black w-48 mb-2"></div>
              <p className="text-[11px] font-bold uppercase">Authorised Signatory</p>
              <p className="text-[9px] text-slate-400 mt-1 uppercase">NAMMA TEA WORLD</p>
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
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3"><Zap className="text-brand" /> Generate GST Invoice</h1>
          <p className="text-slate-500 font-medium">Create professional tax invoices with automated calculations.</p>
        </div>
        <button onClick={() => setIsPreview(true)} className="px-8 py-3.5 bg-brand text-white rounded-2xl font-black shadow-xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
          <Eye size={20} /> PREVIEW INVOICE
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Requirement: Transparent Inputs, Gray Borders */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-wider"><FileText className="text-brand" /> Invoice Header</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Invoice No</label>
                <input 
                  type="text"
                  placeholder="Invoice #"
                  value={billHeader.invoiceNo}
                  onChange={(e) => setBillHeader({...billHeader, invoiceNo: e.target.value})}
                  className="w-full px-4 py-3 input-border rounded-xl font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Place</label>
                <input 
                  type="text"
                  value={billHeader.place}
                  onChange={(e) => setBillHeader({...billHeader, place: e.target.value})}
                  className="w-full px-4 py-3 input-border rounded-xl font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Invoice Date</label>
                <input 
                  type="date"
                  value={billHeader.date}
                  onChange={(e) => setBillHeader({...billHeader, date: e.target.value})}
                  className="w-full px-4 py-3 input-border rounded-xl font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Due Date</label>
                <input 
                  type="date"
                  value={billHeader.dueDate}
                  onChange={(e) => setBillHeader({...billHeader, dueDate: e.target.value})}
                  className="w-full px-4 py-3 input-border rounded-xl font-bold"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-wider"><User className="text-brand" /> Client Selection</h3>
            <div className="relative group select-container">
              <select 
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-4 py-3.5 input-border rounded-xl font-bold appearance-none relative z-10"
              >
                <option value="">Select partner from directory...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform duration-300 group-focus-within:rotate-180 z-0" size={20} />
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-wider"><Package className="text-brand" /> Tea Inventory</h3>
            <div className="space-y-4">
              <div className="relative group select-container">
                <select 
                  onChange={(e) => {
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) {
                      setBillItems([...billItems, { productId: p.id, name: p.name, price: p.price, quantity: 1, amount: p.price }]);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-3.5 input-border rounded-xl font-bold appearance-none relative z-10"
                >
                  <option value="">Choose tea variant to bill...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform duration-300 group-focus-within:rotate-180 z-0" size={20} />
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-4 py-4">Description</th>
                      <th className="px-4 py-4 text-center">Qty</th>
                      <th className="px-4 py-4 text-right">Rate</th>
                      <th className="px-4 py-4 text-right">Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map((item, idx) => (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="px-4 py-4 font-bold text-black">{item.name}</td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                             <button onClick={() => handleQtyChange(idx, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-brand border border-slate-200"><Minus size={14}/></button>
                             <span className="w-6 font-black text-black">{item.quantity}</span>
                             <button onClick={() => handleQtyChange(idx, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-brand border border-slate-200"><Plus size={14}/></button>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-black">₹{item.price.toFixed(2)}</td>
                        <td className="px-4 py-4 text-right font-black text-brand">₹{item.amount.toLocaleString()}</td>
                        <td className="px-4 py-4 text-center"><button onClick={() => setBillItems(billItems.filter((_, i) => i !== idx))} className="text-red-500 hover:scale-110 p-2 rounded-lg transition-all"><Trash2 size={16} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8 sticky top-24">
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Tax Control</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">CGST %</label>
                  <input 
                    type="number" step="0.1" value={taxRates.cgst} 
                    onChange={(e) => setTaxRates({...taxRates, cgst: Number(e.target.value)})}
                    className="w-full px-3 py-2 input-border rounded-lg font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">SGST %</label>
                  <input 
                    type="number" step="0.1" value={taxRates.sgst} 
                    onChange={(e) => setTaxRates({...taxRates, sgst: Number(e.target.value)})}
                    className="w-full px-3 py-2 input-border rounded-lg font-bold"
                  />
                </div>
             </div>
          </section>

          <section className="bg-brand text-white p-8 rounded-3xl shadow-2xl">
            <h2 className="text-sm font-black uppercase tracking-widest mb-8 opacity-60">Bill Totals</h2>
            <div className="space-y-5">
              <div className="flex justify-between text-slate-300 font-bold"><span>Subtotal</span><span>₹{subTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-300 font-bold"><span>Total Tax</span><span>₹{(cgstAmount + sgstAmount).toLocaleString()}</span></div>
              <div className="pt-8 border-t border-brand-light flex justify-between items-end">
                <div><p className="text-xs font-black uppercase opacity-60 mb-1">Net Payable</p><p className="text-4xl font-black">₹{Math.round(grandTotal).toLocaleString()}</p></div>
              </div>
              <button onClick={handleSaveBill} className="w-full py-4 bg-white text-brand rounded-xl font-black mt-8 flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-95 transition-all shadow-xl shadow-brand/20 uppercase tracking-wider"><FileCheck size={20} /> Record Bill</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GenerateBillPage;
