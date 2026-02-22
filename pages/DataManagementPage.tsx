
import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar
} from 'lucide-react';
import { Product, Client } from '../types';
import { downloadCSV, generateId } from '../utils/helpers';

const DataManagementPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleExport = (type: 'products' | 'clients') => {
    setIsProcessing(true);
    const data = JSON.parse(localStorage.getItem(type) || '[]');
    if (data.length === 0) {
      alert(`No ${type} found to export.`);
      setIsProcessing(false);
      return;
    }
    
    setTimeout(() => {
      downloadCSV(data, `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      setIsProcessing(false);
      setLastAction(`${type} exported successfully.`);
    }, 1000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>, type: 'products' | 'clients') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const currentData = JSON.parse(localStorage.getItem(type) || '[]');
      const newData = [...currentData];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const values = lines[i].split(',');
        const record: any = {};
        headers.forEach((header, index) => {
          record[header.trim()] = values[index]?.trim();
        });

        const existingIndex = newData.findIndex(item => item.id === record.id);
        if (existingIndex > -1) {
          newData[existingIndex] = { ...newData[existingIndex], ...record };
        } else {
          newData.push({ ...record, id: record.id || generateId(), dateAdded: record.dateAdded || new Date().toISOString() });
        }
      }

      localStorage.setItem(type, JSON.stringify(newData));
      setIsProcessing(false);
      setLastAction(`${type} imported and updated successfully.`);
      // Force reload or state update would be better in a full app
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Database className="text-indigo-600" /> Data Management
        </h1>
        <p className="text-slate-500">Bulk import and export your business records via CSV/Excel formats.</p>
      </div>

      {lastAction && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={20} />
          <span className="font-bold">{lastAction}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Products Management */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Products Catalog</h3>
              <p className="text-sm text-slate-500">Master list of all inventory items.</p>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
              <AlertCircle className="text-blue-600 shrink-0" size={20} />
              <p className="text-xs text-blue-700 leading-relaxed">
                Exporting will generate a CSV file with ID, Name, Price, and Date Added. Importing will update records if the ID matches.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleExport('products')}
                disabled={isProcessing}
                className="py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-indigo-600 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} /> Export List
              </button>
              <label className="cursor-pointer py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand/70 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 text-center">
                <Upload size={18} /> Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={(e) => handleImport(e, 'products')} />
              </label>
            </div>
          </div>
        </div>

        {/* Clients Management */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Client Directory</h3>
              <p className="text-sm text-slate-500">Contact and billing details for partners.</p>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
              <AlertCircle className="text-blue-600 shrink-0" size={20} />
              <p className="text-xs text-blue-700 leading-relaxed">
                Import CSV must include Name, Email, Phone, Address, and BankAccount headers for correct data mapping.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleExport('clients')}
                disabled={isProcessing}
                className="py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-purple-600 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} /> Export List
              </button>
              <label className="cursor-pointer py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-100 text-center">
                <Upload size={18} /> Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={(e) => handleImport(e, 'clients')} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="font-bold text-slate-900">Processing Your Data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagementPage;
