import { AlertTriangle, CheckCircle2, Database, Eye, FileSignature, QrCode, Settings, Trash2, Upload } from 'lucide-react';
import React from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { UNIT_LABELS, appId, db } from '../../config/firebase';

const LaporanView = ({ activeUnitView, customConfirm, handleExportExcel, handleExportWordSPPBI, handleTemplateUpload, isDarkMode, isReadOnly, modals, selectedYear, setModals, setSelectedYear, setStatus, status, templates }) => {
  const templateList = [
    {
        key: "sppbi",
        title: "SPPBI",
        icon: "📄",
        accept: ".doc,.docx"
    },
    {
        key: "bast_barang",
        title: "BAST Barang",
        icon: "📄",
        accept: ".doc,.docx"
    },
    {
        key: "bast_kendaraan",
        title: "BAST Kendaraan",
        icon: "🚗",
        accept: ".doc,.docx"
    },
    {
        key: "sppkd",
        title: "SPPKD",
        icon: "📑",
        accept: ".doc,.docx"
    },
    {
        key: "label",
        title: "Label",
        icon: "🏷️",
        accept: ".xls,.xlsx"
    }
  ];

  // Fungsi helper untuk memformat Timestamp Firestore menjadi format tanggal yang rapi
  const formatUploadDate = (timestamp) => {
    if (!timestamp?.toDate) return "-";
    const date = timestamp.toDate();
    const formattedDate = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    const formattedTime = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).replace(".", ":");

    return `${formattedDate} • ${formattedTime}`;
  };

  return (
    <div className="space-y-6">
                <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 w-full md:w-max ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                   <span className="font-black text-sm text-slate-500">ARSIP TAHUN:</span>
                   <select className={`p-2 md:p-3 border rounded-xl font-bold outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50'}`} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                      <option value="Semua">Semua Tahun</option>
                      {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i).map(y => <option key={y} value={y}>{y}</option>)}
                   </select>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                   <button onClick={()=>handleExportExcel('all')} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Database/></div><h4 className="font-black text-base md:text-lg whitespace-nowrap">Semua Data</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Export Excel Lengkap</p></button>
                   <button onClick={()=>handleExportExcel('disposal')} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><AlertTriangle/></div><h4 className="font-black text-base md:text-lg whitespace-nowrap">Usulan Hapus</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Aset Expired / Rp 0</p></button>
                   <button onClick={()=>handleExportExcel('active')} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><CheckCircle2/></div><h4 className="font-black text-base md:text-lg">Aset Aktif</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Aset Produktif</p></button>
                   <button onClick={()=>handleExportWordSPPBI(null)} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><FileSignature/></div><h4 className="font-black text-base md:text-lg">Cetak SPPBI</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Dokumen Word (BAST)</p></button>
                   <button onClick={()=>setModals({...modals, bulkLabel: true})} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><QrCode/></div><h4 className="font-black text-base md:text-lg">Cetak Label</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Pilih Banyak Aset (Word)</p></button>
                </div>
                
                {!isReadOnly && (
                    <div className={`p-6 md:p-8 border rounded-[2rem] shadow-sm mt-8 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                        <h4 className="font-black text-lg mb-4 flex items-center gap-2"><Settings size={20} className="text-slate-400"/> Pengaturan Template Dokumen ({UNIT_LABELS[activeUnitView]})</h4>
                        <p className="text-xs text-slate-500 mb-6">Ganti format standar cetak dokumen khusus untuk unit ini
                            dengan mengunggah template Word (.docx)
                            atau Excel (.xlsx). <button onClick={()=>setModals({...modals, templateInfo: true})} className="text-blue-600 hover:underline font-bold">Lihat Panduan</button></p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {templateList.map(template => (
                                <div
                                    key={template.key}
                                    className={`p-4 rounded-xl relative group border transition-all ${
                                        templates[template.key]
                                            ? isDarkMode
                                                ? "bg-emerald-900/20 border-emerald-700"
                                                : "bg-emerald-50 border-emerald-200"
                                            : isDarkMode
                                                ? "bg-slate-800 border-slate-700"
                                                : "bg-white border-slate-200"
                                    }`}
                                >
                                    <p className="font-bold text-sm uppercase mb-2">{template.icon} Template {template.title}</p>
                                    
                                    {templates[template.key]?.fileName ? (
                                        <div className="mb-3 space-y-1">
                                            <p
                                                className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate"
                                                title={templates[template.key].fileName}
                                            >
                                                {templates[template.key].fileName}
                                            </p>
                                            <div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Terakhir diubah</p>
                                                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                                    {formatUploadDate(templates[template.key].updatedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic mb-3">
                                            Belum ada template
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <label
                                            title={templates[template.key] ? "Ganti Template" : "Upload Template"}
                                            className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg cursor-pointer text-center transition-colors ${
                                                isDarkMode
                                                    ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                                                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                            }`}
                                        >
                                            <Upload size={14} className="inline mr-1"/>
                                            {templates[template.key] ? "Ganti File" : "Upload File"}
                                            <input
                                                 type="file"
                                                 accept={template.accept}
                                                 className="hidden"
                                                 onChange={(e) => handleTemplateUpload(e, template.key)}
                                             />
                                        </label>

                                        {templates[template.key]?.url && (
                                            <button
                                                type="button"
                                                title="Lihat Template"
                                                onClick={() =>
                                                    window.open(
                                                        templates[template.key].url,
                                                        "_blank"
                                                    )
                                                }
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300"
                                            >
                                                <Eye size={14}/>
                                            </button>
                                        )}

                                        {templates[template.key] && (
                                            <button
                                                type="button"
                                                title="Hapus Template"
                                                onClick={async () => {
                                                    customConfirm("Hapus Template", `Kembalikan template ${template.title}?`, "danger", async () => {
                                                        setStatus({...status, loading: true});
                                                        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'templates_doc', activeUnitView), { [template.key]: '' }, {merge: true});
                                                        setStatus({...status, loading: false});
                                                    });
                                                }}
                                                className="p-2 bg-red-50 text-red-500 dark:bg-red-900/30 rounded-lg hover:bg-red-100"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        )}
                                    </div>

                                    {templates[template.key] && (
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
                                            <CheckCircle2 size={12}/> Siap Digunakan
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>
  );
};

export default LaporanView;