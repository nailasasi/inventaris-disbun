import { Check, Download, FileBadge, PlusCircle, Upload } from 'lucide-react';
import React from 'react';
import { ALL_BIDANG_RKBMD, JENIS_USULAN_RKBMD } from '../../config/constants';
import { safeString } from '../../utils/helpers';

const RkbmdView = ({ allowedBidangList, canEditRkbmd, customAlert, deleteRkbmd, displayedRkbmdData, handleExportRkbmd, handleUploadRkbmdTemplate, isDarkMode, isReadOnly, modals, rkbmdArsip, rkbmdFilters, rkbmdSelectedJenis, rkbmdSelectedYear, setModals, setPhotoModal, setRkbmdFilters, setRkbmdSelectedJenis, setRkbmdSelectedYear, userRole }) => {
  return (
    <div className="space-y-6 md:space-y-8">
               <div className="flex flex-wrap gap-4">
                  {canEditRkbmd && <button onClick={() => { setModals({...modals, rkbmd: true}); }} className="px-6 md:px-8 py-3 md:py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2 text-sm md:text-base"><PlusCircle size={20}/> Buat Usulan</button>}
                  <button onClick={() => handleExportRkbmd('ALL')} className={`px-6 md:px-8 py-3 md:py-4 border rounded-2xl font-bold transition-all flex items-center gap-2 text-sm md:text-base ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white hover:bg-slate-50'}`}><Download size={20}/> Export Excel (All)</button>
                  {canEditRkbmd && (
                     <div className="relative overflow-hidden group">
                        <button className={`px-6 md:px-8 py-3 md:py-4 border text-emerald-600 rounded-2xl font-bold transition-all flex items-center gap-2 text-sm md:text-base ${isDarkMode ? 'bg-slate-800 border-emerald-900/50 hover:bg-emerald-900/30' : 'bg-white hover:bg-emerald-50'}`}><Upload size={20}/> Template Excel</button>
                        <input type="file" accept=".xlsx, .xls" onChange={handleUploadRkbmdTemplate} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload format Excel untuk Output"/>
                     </div>
                  )}
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                   <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                      <h4 className="font-bold text-sm text-slate-500 mb-4">Pilih Tampilan Bidang (Multiple):</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                         {ALL_BIDANG_RKBMD.map((b,i) => {
                            if (userRole !== 'admin' && !allowedBidangList.includes(b)) return null;
                            const isActive = rkbmdFilters.includes(b);
                            return <button key={i} onClick={() => setRkbmdFilters(prev => isActive ? prev.filter(x => x !== b) : [...prev, b])} className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive ? 'bg-purple-600 text-white border-purple-600' : (isDarkMode ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-50 text-slate-600 hover:bg-purple-50')}`}>{isActive && <Check size={14}/>} {b}</button>;
                         })}
                         {rkbmdFilters.length > 0 && <button onClick={()=>setRkbmdFilters([])} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">Tampilkan Semua Bidang</button>}
                      </div>
                      <div className="flex gap-4">
                          <select value={rkbmdSelectedYear} onChange={e=>setRkbmdSelectedYear(e.target.value)} className={`p-3 font-bold text-sm outline-none border rounded-xl flex-1 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}><option value="Semua">Semua Tahun</option>{Array.from({length: 6}, (_, i) => new Date().getFullYear() + i).map(y=><option key={y} value={y.toString()}>{y}</option>)}</select>
                          <select value={rkbmdSelectedJenis} onChange={e=>setRkbmdSelectedJenis(e.target.value)} className={`p-3 font-bold text-sm outline-none border rounded-xl flex-1 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}><option value="Semua">Semua Jenis Usulan</option>{JENIS_USULAN_RKBMD.map((j,i)=><option key={i} value={j}>{j}</option>)}</select>
                      </div>
                   </div>
                   <div className={`p-6 rounded-[2rem] border bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800`}>
                      <h4 className="font-bold text-sm text-indigo-700 dark:text-indigo-300 mb-4 flex items-center gap-2"><FileBadge size={18}/> Arsip Dokumen Sah RKBMD</h4>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-4">Pilih filter Tahun dan Jenis Usulan di samping, lalu Bidang di bawah ini untuk melihat/mengunggah dokumen usulan yang telah disahkan (Ditandatangani).</p>
                      
                      <div className="space-y-4">
                          <select id="arsipBidangSelect" className="w-full p-3 font-bold text-sm outline-none border border-indigo-200 rounded-xl bg-white dark:bg-slate-800 dark:border-indigo-700 dark:text-white">
                              {allowedBidangList.map((b,i) => <option key={i} value={b}>{b}</option>)}
                          </select>
                          
                          <div className="flex gap-2">
                              <button onClick={() => {
                                  const b = document.getElementById('arsipBidangSelect').value;
                                  if (rkbmdSelectedYear === 'Semua' || rkbmdSelectedJenis === 'Semua') return customAlert("Filter Diperlukan", "Pilih Tahun (bukan Semua) dan Jenis Usulan (bukan Semua) di kotak filter sebelum melihat/mengunggah arsip.");
                                  const arsipKey = `${rkbmdSelectedYear}_${rkbmdSelectedJenis.replace(/[^a-zA-Z0-9]/g, '')}_${b.replace(/[^a-zA-Z0-9]/g, '')}`;
                                  const currentArsip = rkbmdArsip[arsipKey];
                                  if (currentArsip) {
                                      const isExcel = safeString(currentArsip).includes('spreadsheet') || safeString(currentArsip).includes('excel') || safeString(currentArsip).includes('.xls');
                                      if (isExcel) { const a = document.createElement('a'); a.href = currentArsip; a.download = `Arsip_RKBMD_${rkbmdSelectedYear}.xlsx`; a.click(); } 
                                      else { setPhotoModal({show:true, item:null, preview:safeString(currentArsip), file:null, isSPPBI: false, isPajak: false, isPBB: false, isRkbmdArchive: false, rkbmdMeta: null, pajakYear: '', pbbYear: '', isPdf: safeString(currentArsip).includes('application/pdf'), isExcel: false, fileName: ''}); }
                                  } else { customAlert("Tidak Ditemukan", `Belum ada dokumen sah yang diunggah untuk ${rkbmdSelectedJenis} Tahun ${rkbmdSelectedYear} Bidang ${b}.`); }
                              }} className="flex-1 py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-700 rounded-xl hover:bg-indigo-100 transition-all text-xs">Lihat Arsip</button>
                              
                              {!isReadOnly && <button onClick={() => {
                                  const b = document.getElementById('arsipBidangSelect').value;
                                  if (rkbmdSelectedYear === 'Semua' || rkbmdSelectedJenis === 'Semua') return customAlert("Filter Diperlukan", "Pilih Tahun (bukan Semua) dan Jenis Usulan (bukan Semua) di kotak filter sebelum mengunggah arsip.");
                                  setPhotoModal({show: true, item: null, preview: null, file: null, isSPPBI: false, isPajak: false, isPBB: false, isRkbmdArchive: true, rkbmdMeta: {tahun: rkbmdSelectedYear, jenis: rkbmdSelectedJenis, bidang: b}, pajakYear: '', pbbYear: '', isPdf: false, isExcel: false, fileName: ''});
                              }} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-xs flex justify-center items-center gap-1"><Upload size={14}/> Upload Baru</button>}
                          </div>
                      </div>
                   </div>
               </div>
               <div className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border p-6 md:p-8 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  <div className="flex justify-between items-center mb-6"><h3 className="font-black text-lg md:text-xl ml-2">Daftar Usulan ({displayedRkbmdData.length})</h3></div>
                  <div className="space-y-3 md:space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                     {displayedRkbmdData.map(r => (
                        <div key={r.id} className={`p-4 md:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-transparent'}`}>
                           <div><h4 className="font-bold text-base md:text-lg">{safeString(r.usulan_nama || r.nama_barang || '(Tanpa Nama)')}</h4><p className="text-[10px] md:text-xs text-slate-500 mt-1"><span className="text-purple-600 font-bold">{safeString(r.jenis_usulan)} ({safeString(r.tahun_usulan)})</span> • {safeString(r.bidang)} • {safeString(r.usulan_jumlah || r.jumlah)} {safeString(r.usulan_satuan || r.satuan)} • User: {safeString(r.inputByRole)}</p><p className="text-[10px] text-slate-400 mt-1 truncate max-w-xl">Ket: {safeString(r.keterangan || r.alasan) || '-'}</p></div>
                           <div className="text-left md:text-right w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end">
                              {canEditRkbmd ? <button onClick={() => deleteRkbmd(r.id)} className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded font-bold hover:bg-red-200 mt-0 md:mt-1">Hapus</button> : <span className="text-[10px] text-slate-400">Read-only</span>}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
  );
};

export default RkbmdView;
