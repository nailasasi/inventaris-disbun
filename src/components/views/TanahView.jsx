import { CloudUpload, Download, Edit3, Image as ImageIcon, Map as MapIcon, MapPin, PlaySquare, PlusCircle, Search, Upload } from 'lucide-react';
import React from 'react';
import { getSafeDateString, safeString } from '../../utils/helpers';

const TanahView = ({ filteredTanahDataFinal, handleExportTanah, isDarkMode, isReadOnly, modals, pbbSelectedYear, pbbYearsList, setEditTanahModal, setMediaTanahModal, setModals, setPbbSelectedYear, setPbbYearsList, setPhotoModal, setStatus, setTanahSearch, status, tanahSearch, userRole }) => {
  return (
    <div className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border overflow-hidden flex flex-col h-[80vh] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
               <div className={`p-6 md:p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50'}`}>
                  <h3 className="font-black text-xl flex items-center gap-2"><MapIcon className="text-emerald-600"/> Inventaris Tanah</h3>
                  <div className="flex flex-wrap items-center gap-2">
                      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/><input type="text" placeholder="Cari KIB, Nama, Alamat..." className={`pl-9 pr-4 py-2 rounded-xl text-xs outline-none border focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`} value={tanahSearch} onChange={e => setTanahSearch(e.target.value)} /></div>
                      <div className="flex items-center gap-1 border rounded-xl px-2 py-1 bg-white dark:bg-slate-700 dark:border-slate-600">
                          <span className="text-[10px] font-bold text-slate-400">PBB:</span>
                          <select value={pbbSelectedYear} onChange={e=>setPbbSelectedYear(e.target.value)} className="bg-transparent text-xs font-bold outline-none dark:text-white">{pbbYearsList.map(y=><option key={y} value={y}>{y}</option>)}</select>
                          <button onClick={()=>{ const cy = prompt("Masukkan Tahun Arsip PBB Baru (Misal: 2031)"); if(cy && !isNaN(cy) && cy.length === 4) setPbbYearsList(prev => [...new Set([...prev, cy])].sort()); }} className="text-emerald-600 hover:text-emerald-800"><PlusCircle size={14}/></button>
                      </div>
                      <button onClick={handleExportTanah} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 text-xs hover:bg-blue-700 transition-colors"><Download size={16}/> Export</button>
                      {userRole === 'admin' && <button onClick={() => { setStatus({...status, uploadType: 'tanah'}); setModals({...modals, upload: true}); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 text-xs hover:bg-emerald-700 transition-colors"><CloudUpload size={16}/> Sync</button>}
                  </div>
               </div>
               <div className="p-0 md:p-4 flex-grow overflow-auto custom-scrollbar">
                  <table className="w-full text-left min-w-[1000px]">
                     <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}><tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="p-4 w-48">KIB / No Barang</th><th className="p-4 w-64">Penggunaan & Alamat</th><th className="p-4 w-48">Luas / Hak</th><th className="p-4 w-48">Petugas / PIC</th><th className="p-4 text-center w-32">Media (Aset)</th><th className="p-4 text-center">Arsip PBB {pbbSelectedYear}</th><th className="p-4 text-center">Aksi / Gmaps</th></tr></thead>
                     <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                        {filteredTanahDataFinal.length === 0 ? <tr><td colSpan="7" className="text-center py-10 text-slate-400 font-bold">Data tanah tidak ditemukan.</td></tr> : filteredTanahDataFinal.map((t, i) => {
                           const gmapsUrl = safeString(t.gmaps).startsWith('http') ? safeString(t.gmaps) : (t.gmaps ? 'https://' + safeString(t.gmaps) : '');
                           const currentPbb = t.pbb_history?.[pbbSelectedYear] || null;
                           return (
                           <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                              <td className="p-4"><p className="font-bold text-sm text-emerald-600">{safeString(t.kib)}</p><p className="text-[10px] md:text-xs text-slate-400 font-mono mt-1">Peroleh: {getSafeDateString(t.tgl_peroleh).split('T')[0]}</p>{t.lastEditedBy && <div className={`mt-2 pt-2 border-t text-[9px] text-slate-400 flex items-center gap-1 ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}><Edit3 size={10}/> {safeString(t.lastEditedBy)}</div>}</td>
                              <td className="p-4"><p className="font-bold text-sm">{safeString(t.penggunaan) || '-'}</p><p className="text-[10px] md:text-xs text-slate-500 mt-1 leading-tight flex items-start gap-1"><MapPin size={12} className="shrink-0 mt-0.5"/> {safeString(t.alamat) || '-'}</p></td>
                              <td className="p-4"><p className="font-black text-sm">{safeString(t.luas) || '-'} m²</p><p className="text-[10px] text-slate-500 mt-1">{safeString(t.status_hak) || '-'}</p></td>
                              <td className="p-4"><p className="font-bold text-xs text-blue-500">{safeString(t.petugas) || 'Belum ada PIC'}</p><p className="text-[10px] text-slate-500 mt-1">Tlp: {safeString(t.tlp_petugas) || '-'}</p></td>
                              <td className="p-4 text-center flex flex-col gap-2 items-center justify-center h-full">
                                  {t.photoUrl ? <button onClick={() => setMediaTanahModal({show: true, viewOnlyUrl: safeString(t.photoUrl), viewOnlyType: 'photo', item: null, file: null, preview: null, isVideo: false, uploading: false, progress: 0})} className="px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded font-bold text-[10px] flex items-center gap-1 w-full justify-center"><ImageIcon size={12}/> Lihat Foto</button> : <button onClick={() => setMediaTanahModal({show: true, item: t, file: null, preview: null, isVideo: false, uploading: false, progress: 0, viewOnlyUrl: '', viewOnlyType: ''})} className="px-2 py-1 border border-slate-200 dark:border-slate-600 text-slate-400 rounded font-bold text-[10px] flex items-center gap-1 w-full justify-center hover:bg-slate-50"><Upload size={12}/> Upload Foto</button>}
                                  {t.videoUrl ? <button onClick={() => setMediaTanahModal({show: true, viewOnlyUrl: safeString(t.videoUrl), viewOnlyType: 'video', item: null, file: null, preview: null, isVideo: false, uploading: false, progress: 0})} className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded font-bold text-[10px] flex items-center gap-1 w-full justify-center"><PlaySquare size={12}/> Lihat Video</button> : <button onClick={() => setMediaTanahModal({show: true, item: t, file: null, preview: null, isVideo: false, uploading: false, progress: 0, viewOnlyUrl: '', viewOnlyType: ''})} className="px-2 py-1 border border-slate-200 dark:border-slate-600 text-slate-400 rounded font-bold text-[10px] flex items-center gap-1 w-full justify-center hover:bg-slate-50"><Upload size={12}/> Upload Video</button>}
                              </td>
                              <td className="p-4 text-center">
                                  {currentPbb ? <button onClick={()=>{ const isExcel = safeString(currentPbb).includes('spreadsheet') || safeString(currentPbb).includes('excel') || safeString(currentPbb).includes('.xls'); if (isExcel) { const a = document.createElement('a'); a.href = currentPbb; a.download = `PBB_${safeString(t.kib)}_${pbbSelectedYear}.xlsx`; a.click(); } else { setPhotoModal({show:true, item:t, preview:safeString(currentPbb), file:null, isSPPBI: false, isPajak: false, isPBB: false, isRkbmdArchive: false, rkbmdMeta: null, pajakYear: '', pbbYear: '', isPdf: safeString(currentPbb).includes('application/pdf'), isExcel: false, fileName: ''}); } }} className="text-xs text-blue-600 font-bold hover:underline border border-blue-200 px-2 py-1 rounded">Lihat PBB</button> : (!isReadOnly ? <button onClick={()=>setPhotoModal({show:true, item:t, preview:null, file:null, isSPPBI: false, isPajak: false, isPBB: true, isRkbmdArchive: false, rkbmdMeta: null, pajakYear: '', pbbYear: pbbSelectedYear, isPdf: false, isExcel: false, fileName: ''})} className="text-[10px] text-slate-400 border px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Upload size={12} className="inline mr-1"/>Upload</button> : <span className="text-[10px] text-slate-400 italic">Kosong</span>)}
                              </td>
                              <td className="p-4 text-center">
                                  <div className="flex flex-col items-center gap-2">
                                      <div className="flex justify-center gap-2">
                                          <button onClick={() => setEditTanahModal({show: true, item: t})} className="p-2 bg-slate-100 hover:bg-emerald-100 text-emerald-600 dark:bg-slate-700 rounded-lg transition-colors" title="Edit Data Tanah"><Edit3 size={16}/></button>
                                          {gmapsUrl && <a href={gmapsUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 hover:bg-blue-100 text-blue-600 dark:bg-slate-700 rounded-lg transition-colors" title="Buka di Google Maps"><MapIcon size={16}/></a>}
                                      </div>
                                      {gmapsUrl && <a href={gmapsUrl} target="_blank" rel="noreferrer" className="text-[9px] text-blue-500 hover:underline max-w-[120px] truncate block" title={gmapsUrl}>{gmapsUrl}</a>}
                                  </div>
                              </td>
                           </tr>
                        )})}
                     </tbody>
                  </table>
               </div>
            </div>
  );
};

export default TanahView;
