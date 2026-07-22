import { AlertTriangle, CheckCircle2, Database, FileSignature, QrCode, Settings, Trash2, Upload } from 'lucide-react';
import React from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { UNIT_LABELS, appId, db } from '../../config/firebase';

const LaporanView = ({ activeUnitView, customConfirm, handleExportExcel, handleExportWordSPPBI, handleTemplateUpload, isDarkMode, isReadOnly, modals, selectedYear, setModals, setSelectedYear, setStatus, status, templates }) => {
  return (
    <div className="space-y-6">
               <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 w-full md:w-max ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  <span className="font-black text-sm text-slate-500">ARSIP TAHUN:</span>
                  <select className={`p-2 md:p-3 border rounded-xl font-bold outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50'}`} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                     <option value="Semua">Semua Tahun</option>
                     {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                  <button onClick={()=>handleExportExcel('all')} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Database/></div><h4 className="font-black text-base md:text-lg">Semua Data</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Export Excel Lengkap</p></button>
                  <button onClick={()=>handleExportExcel('disposal')} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><AlertTriangle/></div><h4 className="font-black text-base md:text-lg">Usulan Hapus</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Aset Expired / Rp 0</p></button>
                  <button onClick={()=>handleExportExcel('active')} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><CheckCircle2/></div><h4 className="font-black text-base md:text-lg">Aset Aktif</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Aset Produktif</p></button>
                  <button onClick={()=>handleExportWordSPPBI(null)} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><FileSignature/></div><h4 className="font-black text-base md:text-lg">Cetak SPPBI</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Dokumen Word (BAST)</p></button>
                  <button onClick={()=>setModals({...modals, bulkLabel: true})} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><QrCode/></div><h4 className="font-black text-base md:text-lg">Cetak Label</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Pilih Banyak Aset (Word)</p></button>
               </div>
               
               {!isReadOnly && (
                   <div className={`p-6 md:p-8 border rounded-[2rem] shadow-sm mt-8 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                       <h4 className="font-black text-lg mb-4 flex items-center gap-2"><Settings size={20} className="text-slate-400"/> Pengaturan Template HTML/TXT ({UNIT_LABELS[activeUnitView]})</h4>
                       <p className="text-xs text-slate-500 mb-6">Ganti format standar cetak dokumen khusus untuk unit ini dengan mengunggah file HTML/TXT kustom. <button onClick={()=>setModals({...modals, templateInfo: true})} className="text-blue-600 hover:underline font-bold">Lihat Panduan</button></p>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {['sppbi', 'kir', 'label'].map(type => (
                               <div key={type} className={`border p-4 rounded-xl relative group ${isDarkMode ? 'border-slate-700' : ''}`}>
                                   <p className="font-bold text-sm uppercase mb-2">Template {type}</p>
                                   <div className="flex items-center gap-2">
                                       <label className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg cursor-pointer text-center transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                                           <Upload size={14} className="inline mr-1"/> Upload File
                                           <input type="file" accept=".html,.txt" className="hidden" onChange={(e) => handleTemplateUpload(e, type)} />
                                       </label>
                                       {templates[type] && <button onClick={async () => { customConfirm("Hapus Template", `Kembalikan template ${type.toUpperCase()}?`, "danger", async () => { setStatus({...status, loading: true}); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'templates_doc', activeUnitView), { [type]: '' }, {merge: true}); setStatus({...status, loading: false}); }); }} className="p-2 bg-red-50 text-red-500 dark:bg-red-900/30 rounded-lg hover:bg-red-100"><Trash2 size={14}/></button>}
                                   </div>
                                   {templates[type] && <p className="text-[10px] text-emerald-600 mt-2 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Aktif (Kustom)</p>}
                               </div>
                           ))}
                       </div>
                   </div>
               )}
            </div>
  );
};

export default LaporanView;
