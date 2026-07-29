import { ArrowRightLeft, Camera, CheckSquare, ClipboardCheck, Database, FileText, PlusCircle, Printer, QrCode, Search, Send, Trash2, Upload, User } from 'lucide-react';
import React from 'react';
import { safeString } from '../../utils/helpers';
import { exportLabelWord } from '../../utils/exportLabelWord';
import { exportLabelExcel } from '../../utils/exportLabelExcel';


const DataAsetView = ({ confirmDelete, data, handleExportBulkLabel, handleExportWordSPPBI, handleSearchChange, isDarkMode, isPegawaiEditable, modals, priceData, searchTerm, selectedUser, setModals, setPhotoModal, setTransferItem, setTransferUnitModal, templates }) => {
  return (
    <div className="space-y-8">
               <div className="relative"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"/><input type="text" placeholder="Cari Pegawai (Ketik Nama / NIP)..." className={`w-full pl-14 p-4 md:p-5 rounded-2xl border shadow-sm outline-none font-bold text-sm md:text-base ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white'}`} onChange={handleSearchChange} value={searchTerm}/></div>
               {selectedUser ? (
                  <div className="space-y-6">
                     <div className={`rounded-[2rem] md:rounded-[3rem] border shadow-xl overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                        <div className={`p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isDarkMode ? 'border-slate-700' : ''}`}>
                           <div className="flex items-center gap-4 md:gap-6">
                              <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600"><User size={24} className="md:w-8 md:h-8"/></div>
                              <div><h3 className="text-xl md:text-2xl font-black">{safeString(selectedUser.nama)}</h3><p className="text-xs md:text-sm font-bold text-slate-400">{safeString(selectedUser.nip)}</p></div>
                           </div>
                           <div className="flex flex-wrap gap-2 w-full md:w-auto">
                              <button onClick={() => handleExportBulkLabel(selectedUser.items, selectedUser.nama)} className="px-4 py-3 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><QrCode size={16}/> Cetak Semua Label</button>
                              <button onClick={() => handleExportWordSPPBI(selectedUser)} className="px-4 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><Printer size={16}/> Cetak SPPBI</button>
                              {selectedUser.sppbiPhoto ? <button onClick={()=>{ setPhotoModal({show:true, item:null, preview:safeString(selectedUser.sppbiPhoto), file:null, isSPPBI: true, isPajak: false, isPBB: false, isRkbmdArchive: false, pajakYear: '', pbbYear: '', rkbmdMeta: null, isPdf: safeString(selectedUser.sppbiPhoto).includes('application/pdf'), isExcel: false, fileName: ''}); }} className="px-4 py-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><CheckSquare size={16}/> Lihat SPPBI</button> : (isPegawaiEditable ? <button onClick={() => setPhotoModal({show: true, item: null, preview: null, file: null, isSPPBI: true, isPajak: false, isPBB: false, isRkbmdArchive: false, pajakYear: '', pbbYear: '', rkbmdMeta: null, isPdf: false, isExcel: false, fileName: ''})} className="px-4 py-3 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><Upload size={16}/> Upload SPPBI</button> : <span className="px-4 py-3 bg-slate-50 text-slate-400 dark:bg-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs">Belum ada SPPBI</span>)}
                              {isPegawaiEditable && <button onClick={() => setModals({...modals, addItem: true})} className="px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><PlusCircle size={16}/> Tambah Aset</button>}
                           </div>
                        </div>
                     </div>
                     {/* Tabel Aset Utama (Monitoring) */}
                     <div className={`rounded-[2rem] shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                        <div className={`px-6 py-4 border-b flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-emerald-50 border-emerald-100'}`}>
                           <Database size={18} className="text-emerald-600"/>
                           <h4 className="font-black text-emerald-800 dark:text-emerald-300">Aset Utama (Terhubung Monitoring)</h4>
                        </div>
                        <div className="p-4 md:p-6 overflow-x-auto">
                           <table className="w-full text-left min-w-[750px]">
                              <thead><tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="pb-4 w-12 text-center">Foto</th><th className="pb-4">Nama Barang</th><th className="pb-4">No Kartu</th><th className="pb-4 text-center">Aksi</th></tr></thead>
                              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                                 {selectedUser.items?.filter(it => !it.isLocalOnly).length === 0 ? <tr><td colSpan="4" className="py-6 text-center text-xs font-bold text-slate-400">Tidak ada aset utama terhubung.</td></tr> :
                                 selectedUser.items?.filter(it => !it.isLocalOnly).map((it, i) => {
                                    const dataSource = priceData;
                                    let pItem = Object.values(dataSource || {}).find(x => safeString(x.no_kartu) === safeString(it.no_kartu) && safeString(it.no_kartu) !== '');
                                    if (!pItem) pItem = Object.values(dataSource || {}).find(x => safeString(x.nama).toLowerCase() === safeString(it.nama).toLowerCase() && safeString(x.lokasi).toLowerCase() === safeString(selectedUser.nama).toLowerCase());
                                    const mergedItem = { ...it, no_kartu: it.no_kartu || pItem?.no_kartu || '-', tahun: it.tahun || pItem?.tgl_pengadaan || pItem?.tahun || '-', merk: (it.merk && it.merk !== '-') ? it.merk : (pItem?.merk || '-') };
                                    return (
                                    <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                                       <td className="py-4 text-center">{pItem?.photoBase64 ? <img src={safeString(pItem.photoBase64)} className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover mx-auto border" alt="aset"/> : <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-300 dark:border-slate-600 border"><Camera size={14}/></div>}</td>
                                       <td className="py-4 font-bold text-sm">{safeString(it.nama)}<br/><span className="text-[10px] md:text-xs font-normal text-slate-400">{safeString(mergedItem.merk)} | {safeString(mergedItem.tahun)}</span></td>
                                       <td className="py-4 text-xs md:text-sm font-mono text-slate-500">{safeString(mergedItem.no_kartu)}</td>
                                       <td className="py-4 text-center flex justify-center gap-1 md:gap-2">
                                           <button
                                             onClick={() => {
                                                console.log("BUTTON LABEL DIKLIK");

                                                exportLabelExcel(
                                                      templates.label.url,
                                                      [mergedItem],
                                                      selectedUser.nama,
                                                      priceData,
                                                      data,
                                                      safeString
                                                );
                                             }}
                                             className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                                             title="Cetak Label (Excel)"
                                          >
                                             <QrCode size={14} />
                                          </button>
                                           {isPegawaiEditable && <button onClick={() => { setTransferItem(mergedItem); setModals({...modals, transfer: true}); }} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-lg transition-colors" title="Mutasi Internal (Antar Pegawai)"><ArrowRightLeft size={14}/></button>}
                                           {isPegawaiEditable && <button onClick={() => { setTransferUnitModal({show: true, item: mergedItem, sourceRef: selectedUser.nip, sourceType: 'pegawai'}); }} className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 rounded-lg transition-colors" title="Mutasi Antar Unit"><Send size={14}/></button>}
                                           {isPegawaiEditable && <button onClick={() => confirmDelete(it, 'pegawai')} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={14}/></button>}
                                       </td>
                                    </tr>
                                 )})}
                              </tbody>
                           </table>
                        </div>
                     </div>
                     {/* Tabel Aset Lokal (Hanya di KIB Pegawai) */}
                     {selectedUser.items?.filter(it => it.isLocalOnly).length > 0 && (
                        <div className={`rounded-[2rem] shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                           <div className={`px-6 py-4 border-b flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-amber-50 border-amber-100'}`}>
                              <ClipboardCheck size={18} className="text-amber-600"/>
                              <h4 className="font-black text-amber-800 dark:text-amber-300">Catatan Inventaris Lokal (Tidak Ada di Monitoring)</h4>
                           </div>
                           <div className="p-4 md:p-6 overflow-x-auto">
                              <table className="w-full text-left min-w-[750px]">
                                 <thead><tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="pb-4 w-12 text-center">Tipe</th><th className="pb-4">Nama Barang Lokal</th><th className="pb-4">No Referensi / Kartu</th><th className="pb-4 text-center">Aksi</th></tr></thead>
                                 <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                                    {selectedUser.items?.filter(it => it.isLocalOnly).map((it, i) => {
                                       const mergedItem = { ...it, no_kartu: it.no_kartu || '-', tahun: it.tahun || '-', merk: (it.merk && it.merk !== '-') ? it.merk : '-' };
                                       return (
                                       <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                                          <td className="py-4 text-center"><div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto text-amber-500 dark:border-amber-700 border"><FileText size={14}/></div></td>
                                          <td className="py-4 font-bold text-sm">{safeString(it.nama)}<br/><span className="text-[10px] md:text-xs font-normal text-slate-400">{safeString(mergedItem.merk)} | {safeString(mergedItem.tahun)}</span></td>
                                          <td className="py-4 text-xs md:text-sm font-mono text-slate-500">{safeString(mergedItem.no_kartu)}</td>
                                          <td className="py-4 text-center flex justify-center gap-1 md:gap-2">
                                              <button onClick={() => exportLabelWord(mergedItem, selectedUser.nama, priceData, templates, data)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-lg transition-colors" title="Cetak Label (Word)"><QrCode size={14}/></button>
                                              {isPegawaiEditable && <button onClick={() => { setTransferItem(mergedItem); setModals({...modals, transfer: true}); }} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-lg transition-colors" title="Mutasi Internal"><ArrowRightLeft size={14}/></button>}
                                              {isPegawaiEditable && <button onClick={() => confirmDelete(it, 'pegawai')} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={14}/></button>}
                                          </td>
                                       </tr>
                                    )})}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     )}
                  </div>
               ) : <div className={`text-center py-20 font-bold border-2 border-dashed rounded-[2rem] ${isDarkMode ? 'border-slate-700 text-slate-500 bg-slate-800' : 'text-slate-400 bg-slate-50'}`}>Ketik nama pegawai untuk menampilkan data aset.</div>}
            </div>
  );
};

export default DataAsetView;
