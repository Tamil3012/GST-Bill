import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ChevronDown,
  Download
} from 'lucide-react';
import { Client, Product, BankDetails, BillItem } from '../types';
import { generateId, numberToWords } from '../utils/helpers';
import { supabase } from '../utils/supabase';
import html2canvas from 'html2canvas';

interface GenerateBillPageProps {
  mode: 'create' | 'edit' | 'view';
}

const GenerateBillPage: React.FC<GenerateBillPageProps> = ({ mode }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [adminBank, setAdminBank] = useState<BankDetails | null>(null);
  const [isPreview, setIsPreview] = useState(mode === 'view');
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const [billHeader, setBillHeader] = useState({
    invoiceNo: '',
    place: 'Chennai',
    date: '',
    dueDate: ''
  });
  const [selectedClientId, setSelectedClientId] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  
  // Tax rates as strings to handle empty input properly
  // Default: CGST = 2.5, SGST = 2.5, IGST = empty
  const [taxRates, setTaxRates] = useState({ 
    cgst: '2.5', 
    sgst: '2.5', 
    igst: '' 
  });
  
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
          
          // Set tax rates from saved data
          if (data.igstRate && data.igstRate > 0) {
            setTaxRates({ cgst: '', sgst: '', igst: String(data.igstRate) });
          } else {
            setTaxRates({ 
              cgst: data.cgstRate ? String(data.cgstRate) : '2.5', 
              sgst: data.sgstRate ? String(data.sgstRate) : '2.5', 
              igst: '' 
            });
          }
          
          if (searchParams.get('print') === 'true') {
            setIsPreview(true);
            setTimeout(() => handleDirectPrint(), 1500);
          }
        }
      }
      setIsLoading(false);
    };
    fetchData();
  }, [id, searchParams]);

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);
  const subTotal = useMemo(() => billItems.reduce((acc, item) => acc + item.amount, 0), [billItems]);
  
  // Convert string to number for calculations (empty = 0)
  const cgstValue = taxRates.cgst === '' ? 0 : parseFloat(taxRates.cgst) || 0;
  const sgstValue = taxRates.sgst === '' ? 0 : parseFloat(taxRates.sgst) || 0;
  const igstValue = taxRates.igst === '' ? 0 : parseFloat(taxRates.igst) || 0;
  
  // Calculate tax amounts
  const cgstAmount = subTotal * (cgstValue / 100);
  const sgstAmount = subTotal * (sgstValue / 100);
  const igstAmount = subTotal * (igstValue / 100);
  
  // Grand total
  const grandTotal = subTotal + cgstAmount + sgstAmount + igstAmount;

  // ===== TAX CHANGE HANDLERS =====
  const handleCgstChange = (value: string) => {
    // Allow only numbers and decimal point
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    
    // If CGST has value, clear IGST
    setTaxRates({
      cgst: value,
      sgst: taxRates.sgst,
      igst: value !== '' ? '' : taxRates.igst
    });
  };

  const handleSgstChange = (value: string) => {
    // Allow only numbers and decimal point
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    
    // If SGST has value, clear IGST
    setTaxRates({
      cgst: taxRates.cgst,
      sgst: value,
      igst: value !== '' ? '' : taxRates.igst
    });
  };

  const handleIgstChange = (value: string) => {
    // Allow only numbers and decimal point
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    
    // If IGST has value, clear CGST and SGST
    setTaxRates({
      cgst: value !== '' ? '' : taxRates.cgst,
      sgst: value !== '' ? '' : taxRates.sgst,
      igst: value
    });
  };

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
      cgstRate: cgstValue,
      sgstRate: sgstValue,
      igstRate: igstValue,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount: grandTotal
    };

    const res = mode === 'edit' && id 
      ? await supabase.from('bills').update(billData).eq('id', id)
      : await supabase.from('bills').insert([{ ...billData, id: generateId() }]);

    if (!res.error) navigate('/dashboard/bills');
    else alert("Error saving bill. Please check your data.");
    setIsLoading(false);
  };

  // ===== DIRECT PRINT =====
  const handleDirectPrint = async () => {
    if (!invoiceRef.current) return;
    
    setIsPrinting(true);
    
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice - ${billHeader.invoiceNo || 'Print'}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                @page { size: A4; margin: 0; }
                html, body { width: 210mm; height: 297mm; }
                body { display: flex; justify-content: center; align-items: flex-start; }
                img { width: 210mm; height: auto; max-height: 297mm; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${imgData}" />
            </body>
          </html>
        `);
        iframeDoc.close();

        iframe.onload = () => {
          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            
            setTimeout(() => {
              document.body.removeChild(iframe);
              setIsPrinting(false);
            }, 1000);
          }, 500);
        };
      }
    } catch (error) {
      console.error('Print error:', error);
      alert('Error printing. Please try again.');
      setIsPrinting(false);
    }
  };

  // ===== DOWNLOAD AS PDF =====
  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    setIsPrinting(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: 0,
        filename: `Invoice_${billHeader.invoiceNo || 'document'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
        },
        jsPDF: {
          unit: 'mm' as const,
          format: 'a4' as const,
          orientation: 'portrait' as const,
        },
      };

      await html2pdf().set(opt).from(invoiceRef.current).save();
    } catch (error) {
      console.error('PDF error:', error);
      alert('Error generating PDF.');
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-brand" size={40} />
    </div>
  );

  if (isPreview || mode === 'view') {
    return (
      <div className="animate-in fade-in duration-500">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-10 gap-4">
          <button 
            onClick={() => mode === 'view' ? navigate('/dashboard/bills') : setIsPreview(false)} 
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold flex items-center gap-2 text-slate-500 hover:text-brand"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex gap-3">
            <button 
              onClick={handleDownloadPDF}
              disabled={isPrinting}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
            >
              {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Download PDF
            </button>
            
            <button 
              onClick={handleDirectPrint}
              disabled={isPrinting}
              className="px-6 py-2.5 bg-brand text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand/20 disabled:opacity-50"
            >
              {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
              Print Invoice
            </button>
            
            {mode !== 'view' && (
              <button onClick={handleSaveBill} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold">
                Save Final Bill
              </button>
            )}
          </div>
        </div>

        {/* Invoice Preview */}
        <div 
          ref={invoiceRef}
          id="invoice-print" 
          className="bg-white mx-auto relative text-black" 
          style={{ width: '210mm', minHeight: '297mm', padding: '10mm' }}
        >
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="w-[60%]">
              <h1 className="text-3xl font-black mb-1 tracking-wide text-black">Namma Tea World</h1>
              <div className="text-[11px] leading-[1.5] font-medium">
                <p className='font-bold text-[14px]'>{adminBank?.address || '3/8 kalyani ammal street ,'}</p>
                <p className='font-normal text-[12px] mt-2'><span className="font-bold uppercase">FSSAI No :</span> {adminBank?.fssaiNo || '12423023001605'}</p>
                <p className='font-normal text-[12px]'><span className="font-bold uppercase">GSTIN :</span> {adminBank?.gstin || '33ASJPT8350M1Z3'}</p>
                <p className='font-normal text-[12px]'><span className="font-bold uppercase">PHONE :</span> {adminBank?.phone || '9110339096'}</p>
                <p className='font-normal text-[12px]'><span className="font-bold uppercase">EMAIL :</span> {adminBank?.email || 'nammateaworld@gmail.com'}</p>
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

          <div className="border-t-2 border-gray-200 mb-4"></div>

          {/* Details Row */}
          <div className="grid grid-cols-2 gap-10 mb-6 text-[11px] font-medium">
            <div>
              <p className="font-bold mb-1 text-[14px] tracking-tight opacity-60">Client Details</p>
              <p className="text-lg font-black mb-1">{selectedClient?.name || 'Customer'}</p>
              {selectedClient?.gstin && (
                <p>
                  <span className="font-bold uppercase">GSTIN :</span> {selectedClient.gstin}
                </p>
              )}
              {selectedClient?.fssaino && (
                <p>
                  <span className="font-bold uppercase">FSSAI No :</span> {selectedClient.fssaino}
                </p>
              )}
              {selectedClient?.phone && (
                <p>
                  <span className="font-bold uppercase">PHONE :</span> {selectedClient.phone}
                </p>
              )}
              {selectedClient?.email && (
                <p>
                  <span className="font-bold uppercase">EMAIL :</span> {selectedClient.email}
                </p>
              )}
            </div>
            <div>
              <p className="font-bold mb-1 tracking-tight opacity-60 text-[14px]">Client Address</p>
              <div className="flex gap-2">
                <span className="font-bold uppercase">ADDRESS:</span>
                <span className="flex-1 whitespace-pre-wrap">{selectedClient?.address || '-'}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border-[2px] border-black text-[11px] mb-1">
            <thead className="bg-gray-100">
              <tr className="border-b-[2px] border-black">
                <th className="border-r-2 border-black py-2.5 w-[45px] font-bold text-center text-[14px]">SI</th>
                <th className="border-r-2 border-black py-2.5 text-left font-bold px-4 text-[14px]">Description of Goods</th>
                <th className="border-r-2 border-black py-2.5 w-[130px] text-center font-bold text-[14px]">HSN/SAC</th>
                <th className="border-r-2 border-black py-2.5 w-[65px] text-center font-bold text-[14px]">Qty</th>
                <th className="border-r-2 border-black py-2.5 w-[110px] text-center font-bold leading-tight text-[14px]">Rate<br/><span className="text-[9px] font-normal">(PER KG)</span></th>
                <th className="py-2.5 w-[120px] text-center font-bold text-[14px]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billItems.length > 0 ? (
                billItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="border-r-2 border-black pb-4 text-center text-[14px]">{idx + 1}</td>
                    <td className="border-r-2 border-black pb-4 px-4 font-medium text-[14px]">{item.name}</td>
                    <td className="border-r-2 border-black pb-4 text-center text-[14px]">090230</td>
                    <td className="border-r-2 border-black pb-4 text-center text-[14px]">{item.quantity}</td>
                    <td className="border-r-2 border-black pb-4 text-center text-[14px]">{item.price.toFixed(2)}</td>
                    <td className="pb-4 text-right pr-4 font-medium text-[14px]">{item.amount.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-black">
                   <td colSpan={6} className="py-10 text-center text-slate-400 italic">No products added yet</td>
                </tr>
              )}
              {billItems.length > 0 && (
                <tr className="font-bold border-t-[2px] border-black">
                  <td colSpan={5} className="py-2.5 text-right pr-4 border-r-2 border-black uppercase pb-4">Total Taxable Value</td>
                  <td className="py-2.5 text-right pr-4">{subTotal.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals Section - Show only taxes with values */}
          <div className="flex justify-end mb-6">
            <div className="w-[380px] text-[11px] font-medium border-2 border">
              
              {/* Show CGST only if value > 0 */}
              {cgstValue > 0 && (
                <div className="flex justify-between px-4 py-2">
                  <span className="uppercase font-bold text-[14px]">CGST {cgstValue}%</span>
                  <span>{cgstAmount.toFixed(2)}</span>
                </div>
              )}
              
              {/* Show SGST only if value > 0 */}
              {sgstValue > 0 && (
                <div className={`flex justify-between px-4 py-2 ${igstValue === 0 ? 'border-b-2 border-gray-200 pb-4' : ''}`}>
                  <span className="uppercase font-bold text-[14px]">SGST {sgstValue}%</span>
                  <span>{sgstAmount.toFixed(2)}</span>
                </div>
              )}
              
              {/* Show IGST only if value > 0 */}
              {igstValue > 0 && (
                <div className="flex justify-between px-4 py-2 border-b-2 border-gray-200 pb-4">
                  <span className="uppercase font-bold text-[14px]">IGST {igstValue}%</span>
                  <span>{igstAmount.toFixed(2)}</span>
                </div>
              )}
              
              {/* Grand Total */}
              <div className="flex justify-between px-4 font-black text-[13px] bg-gray-100">
                <span className="text-black pb-4 pt-2">Grand Total</span>
                <span className="text-black pt-2">₹ {Math.round(grandTotal).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between gap-8 mb-12">
            <div className="w-[45%] text-[11px]">
               <p className="font-bold mb-1 opacity-60">Tax Amount (in words):</p>
               <p className="font-bold text-slate-800 italic mb-8">{numberToWords(Math.round(grandTotal))}</p>
               
               <div className="border-2 border min-h-[110px]">
                  <p className="font-bold px-3 pb-4 border-b-2 border-gray-200 bg-gray-100 tracking-tighter">Notes</p>
                  <p className="px-3 py-3 font-medium text-slate-700">Goods once sold cannot be taken back</p>
               </div>
            </div>
            <div className="w-[50%]">
               <div className="border-2 border pb-4 px-4 text-[11px] font-medium h-full">
                  <p className="font-bold mb-4 tracking-tighter text-[14px] border-b-2 border-gray-200 pb-4">Company's Bank Details</p>
                  <div className="space-y-2.5">
                    <p className="text-[14px]"><span className="font-bold text-[14px]">Bank:</span> {adminBank?.bankName || 'HDFC BANK LIMITED'}</p>
                    <p className="text-[14px]"><span className="font-bold text-[14px]">A/c No:</span> {adminBank?.accountNumber || '50200103874804'}</p>
                    <p className="text-[14px]"><span className="font-bold text-[14px]">PAN:</span> {adminBank?.panNo || 'ASJPT8350M'}</p>
                    <p className="text-[14px]"><span className="font-bold text-[14px]">IFSC:</span> {adminBank?.ifscCode || 'HDFC0003742'}</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex justify-end pr-4">
            <div className="text-center">
              <div className="h-20 border-b border-gray-300 w-48 mb-2"></div>
              <p className="text-[11px] font-bold">Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== EDIT/CREATE MODE =====
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* CSS to remove number input spinners */}
      <style>
        {`
          /* Remove number input spinners for Chrome, Safari, Edge, Opera */
          input[type=number]::-webkit-outer-spin-button,
          input[type=number]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          
          /* Remove number input spinners for Firefox */
          input[type=number] {
            -moz-appearance: textfield;
          }
          
          /* Custom class for text inputs that accept numbers */
          .tax-input {
            -webkit-appearance: none;
            -moz-appearance: textfield;
          }
        `}
      </style>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Zap className="text-brand" /> Generate GST Invoice
          </h1>
          <p className="text-slate-500 font-medium">Create professional tax invoices with automated calculations.</p>
        </div>
        <button 
          onClick={() => setIsPreview(true)} 
          className="px-8 py-3.5 bg-brand text-white rounded-2xl font-black shadow-xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Eye size={20} /> PREVIEW INVOICE
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Invoice Header Section */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-wider">
              <FileText className="text-brand" /> Invoice Header
            </h3>
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
                  onChange={(e) => setBillHeader({ ...billHeader, date: e.target.value })}
                  className="w-full px-4 py-3 input-border rounded-xl font-bold appearance-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Due Date</label>
                <input
                  type="date"
                  value={billHeader.dueDate}
                  onChange={(e) => setBillHeader({ ...billHeader, dueDate: e.target.value })}
                  className="w-full px-4 py-3 input-border rounded-xl font-bold appearance-none"
                />
              </div>
            </div>
          </section>

          {/* Client Selection */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-wider">
              <User className="text-brand" /> Client Selection
            </h3>
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

          {/* Tea Inventory */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-wider">
              <Package className="text-brand" /> Tea Inventory
            </h3>
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
                            <button onClick={() => handleQtyChange(idx, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-brand border border-slate-200">
                              <Minus size={14}/>
                            </button>
                            <span className="w-6 font-black text-black">{item.quantity}</span>
                            <button onClick={() => handleQtyChange(idx, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-brand border border-slate-200">
                              <Plus size={14}/>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-black">₹{item.price.toFixed(2)}</td>
                        <td className="px-4 py-4 text-right font-black text-brand">₹{item.amount.toLocaleString()}</td>
                        <td className="px-4 py-4 text-center">
                          <button onClick={() => setBillItems(billItems.filter((_, i) => i !== idx))} className="text-red-500 hover:scale-110 p-2 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8 sticky top-24">
          {/* Tax Control */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Tax Control</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* CGST Input - Using type="text" to remove spinners */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">CGST %</label>
                <input 
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={taxRates.cgst}
                  onChange={(e) => handleCgstChange(e.target.value)}
                  className="w-full px-3 py-2 input-border rounded-lg font-bold tax-input"
                />
              </div>
              
              {/* SGST Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">SGST %</label>
                <input 
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={taxRates.sgst}
                  onChange={(e) => handleSgstChange(e.target.value)}
                  className="w-full px-3 py-2 input-border rounded-lg font-bold tax-input"
                />
              </div>
              
              {/* IGST Input - Full Width */}
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">IGST %</label>
                <input 
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={taxRates.igst}
                  onChange={(e) => handleIgstChange(e.target.value)}
                  className="w-full px-3 py-2 input-border rounded-lg font-bold tax-input"
                />
              </div>
            </div>
            
            {/* Active Tax Display */}
            {/* <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Active Tax:</p>
              {igstValue > 0 ? (
                <p className="text-sm font-black text-brand">IGST @ {igstValue}%</p>
              ) : (cgstValue > 0 || sgstValue > 0) ? (
                <p className="text-sm font-black text-brand">
                  {cgstValue > 0 && `CGST @ ${cgstValue}%`}
                  {cgstValue > 0 && sgstValue > 0 && ' + '}
                  {sgstValue > 0 && `SGST @ ${sgstValue}%`}
                </p>
              ) : (
                <p className="text-sm font-medium text-slate-400">No tax applied</p>
              )}
            </div> */}
          </section>

          {/* Bill Totals */}
          <section className="bg-brand text-white p-8 rounded-3xl shadow-2xl">
            <h2 className="text-sm font-black uppercase tracking-widest mb-8 opacity-60">Bill Totals</h2>
            <div className="space-y-5">
              <div className="flex justify-between text-slate-300 font-bold">
                <span>Subtotal</span>
                <span>₹{subTotal.toLocaleString()}</span>
              </div>
              
              {/* Show CGST if > 0 */}
              {cgstValue > 0 && (
                <div className="flex justify-between text-slate-300 font-bold">
                  <span>CGST ({cgstValue}%)</span>
                  <span>₹{cgstAmount.toLocaleString()}</span>
                </div>
              )}
              
              {/* Show SGST if > 0 */}
              {sgstValue > 0 && (
                <div className="flex justify-between text-slate-300 font-bold">
                  <span>SGST ({sgstValue}%)</span>
                  <span>₹{sgstAmount.toLocaleString()}</span>
                </div>
              )}
              
              {/* Show IGST if > 0 */}
              {igstValue > 0 && (
                <div className="flex justify-between text-slate-300 font-bold">
                  <span>IGST ({igstValue}%)</span>
                  <span>₹{igstAmount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between text-slate-300 font-bold">
                <span>Total Tax</span>
                <span>₹{(cgstAmount + sgstAmount + igstAmount).toLocaleString()}</span>
              </div>
              
              <div className="pt-8 border-t border-brand-light flex justify-between items-end">
                <div>
                  <p className="text-xs font-black uppercase opacity-60 mb-1">Net Payable</p>
                  <p className="text-4xl font-black">₹{Math.round(grandTotal).toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={handleSaveBill} 
                className="w-full py-4 bg-white text-brand rounded-xl font-black mt-8 flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-95 transition-all shadow-xl shadow-brand/20 uppercase tracking-wider"
              >
                <FileCheck size={20} /> Record Bill
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GenerateBillPage;