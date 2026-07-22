import { ArrowRightLeft, Camera, ClipboardCheck, Database, Edit3, FileText, PlusCircle, Printer, QrCode, Send, Trash2, Unplug } from 'lucide-react';
import React from 'react';
import { safeString } from '../../utils/helpers';
import { exportLabelWord } from '../../utils/exportLabelWord';

const RuanganView = ({ confirmDelete, currentRoomData, data, dynamicRooms, filteredPriceData, handleAddRoom, handleDeleteRoom, handleExportBulkLabel, handleExportKIRWord, handleUnlinkFromMaster, isDarkMode, isPegawaiEditable, isReadOnly, modals, newRoomName, priceData, selectedRoomName, selectedUser, setEditRoom, setModals, setNewRoomName, setSelectedRoomName, setTransferItem, setTransferUnitModal, status, templates }) => {
  return (
    <div className="space-y-8">
               <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                     <div className="flex-grow w-full md:w-auto">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Pilih Ruangan</label>
                        <div className="flex gap-2">
                            <select className={`w-full md:w-auto flex-grow p-4 rounded-xl border outline-none font-bold text-sm focus:border-emerald-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50'}`} value={selectedRoomName} onChange={e => setSelectedRoomName(e.target.value)}>
                               {dynamicRooms.map((r, i) => <option key={i} value={r}>{r}</option>)}
                            </select>
                            {!isReadOnly && <button onClick={() => setEditRoom({show: true, oldName: selectedRoomName, newName: selectedRoomName})} className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-xl transition-colors" title="Edit Nama Ruangan"><Edit3 size={20}/></button>}
                            {!isReadOnly && <button onClick={() => handleDeleteRoom(selectedRoomName)} className="p-4 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 rounded-xl transition-colors" title="Hapus Ruangan"><Trash2 size={20}/></button>}
                        </div>
                     </div>
                     {!isReadOnly && (
                         <div className="flex-grow w-full md:w-auto">
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tambah Ruangan Baru</label>
                            <div className="flex gap-2">
                               <input type="text" placeholder="Nama Ruangan..." className={`w-full md:w-auto flex-grow p-4 rounded-xl border outline-none font-bold text-sm focus:border-emerald-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50'}`} value={newRoomName} onChange={e => setNewRoomName(e.target.value)} />
                               <button onClick={handleAddRoom} disabled={!newRoomName || status.loading} className="p-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"><PlusCircle size={20}/></button>
                            </div>
                         </div>
                     )}
                  </div>
                  
                  <div className={`mt-8 pt-8 border-t flex flex-wrap gap-2 ${isDarkMode ? 'border-slate-700' : ''}`}>
                      <button onClick={() => handleExportBulkLabel(currentRoomData.items, selectedRoomName)} className="px-6 py-3 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><QrCode size={16}/> Cetak Semua Label</button>
                      <button onClick={() => handleExportKIRWord(selectedRoomName)} className="px-6 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><Printer size={16}/> Cetak KIR</button>
                      {!isReadOnly && <button onClick={() => setModals({...modals, addRoomItem: true})} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs hover:bg-emerald-700"><PlusCircle size={16}/> Tambah Aset Ruangan</button>}
                  </div>
               </div>
               {/* Tabel Aset Ruangan Utama (Monitoring) */}
               <div className={`rounded-[2rem] shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  <div className={`px-6 py-5 border-b flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-emerald-50 border-emerald-100'}`}>
                     <Database size={18} className="text-emerald-600"/>
                     <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-300">Aset Utama Terhubung: {selectedRoomName}</h3>
                  </div>
                  <div className="p-4 md:p-8 overflow-x-auto">
                      <table className="w-full text-left min-w-[750px]">
                          <thead><tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="pb-4 w-12 text-center">Foto</th><th className="pb-4">Nama Barang</th><th className="pb-4">No Kartu</th><th className="pb-4 text-center">Aksi</th></tr></thead>
                          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                              {currentRoomData.items?.filter(it => !it.isLocalOnly).length === 0 ? <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-bold">Tidak ada aset utama di ruangan ini.</td></tr> : 
                              currentRoomData.items?.filter(it => !it.isLocalOnly).map((it, i) => {
                                 let pItem = Object.values(filteredPriceData || {}).find(x => safeString(x.no_kartu) === safeString(it.no_kartu) && safeString(it.no_kartu) !== '');
                                 if (!pItem) pItem = Object.values(filteredPriceData || {}).find(x => safeString(x.nama).toLowerCase() === safeString(it.nama).toLowerCase() && safeString(x.lokasi).toLowerCase() === safeString(selectedRoomName).toLowerCase());
                                 const mergedItem = { ...it, no_kartu: it.no_kartu || pItem?.no_kartu || '-', tahun: it.tahun || pItem?.tgl_pengadaan || pItem?.tahun || '-', merk: (it.merk && it.merk !== '-') ? it.merk : (pItem?.merk || '-') };
                                 return (
                                 <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                                    <td className="py-4 text-center">{pItem?.photoBase64 ? <img src={safeString(pItem.photoBase64)} className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover mx-auto border" alt="aset"/> : <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-300 border dark:border-slate-600"><Camera size={14}/></div>}</td>
                                    <td className="py-4 font-bold text-sm">{safeString(it.nama)}<br/><span className="text-[10px] md:text-xs font-normal text-slate-400">{safeString(mergedItem.merk)} | {safeString(mergedItem.tahun)}</span></td>
                                    <td className="py-4 text-xs md:text-sm font-mono text-slate-500">{safeString(mergedItem.no_kartu)}</td>
                                    <td className="py-4 text-center flex justify-center gap-1 md:gap-2">
                                        <button onClick={() => exportLabelWord(mergedItem, selectedUser.nama, priceData, templates, data)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-lg transition-colors" title="Cetak Label (Word)"><QrCode size={14}/></button>
                                        {isPegawaiEditable && <button onClick={() => { setTransferItem(mergedItem); setModals({...modals, transfer: true}); }} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-lg transition-colors" title="Mutasi Internal (Antar Pegawai)"><ArrowRightLeft size={14}/></button>}
                                        {isPegawaiEditable && <button onClick={() => { setTransferUnitModal({show: true, item: mergedItem, sourceRef: selectedUser.nip, sourceType: 'pegawai'}); }} className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 rounded-lg transition-colors" title="Mutasi Antar Unit"><Send size={14}/></button>}
                                        {isPegawaiEditable && <button onClick={() => handleUnlinkFromMaster(it, 'ruangan')} className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg transition-colors" title="Keluarkan dari Monitoring (Jadikan Lokal)"><Unplug size={14}/></button>}
                                        {isPegawaiEditable && <button onClick={() => confirmDelete(it, 'ruangan')} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 rounded-lg transition-colors" title="Hapus Sepenuhnya"><Trash2 size={14}/></button>}
                                    </td>
                                 </tr>
                              )})}
                          </tbody>
                      </table>
                  </div>
               </div>
               {/* Tabel Aset Lokal Ruangan (Hanya KIR) */}
               {currentRoomData.items?.filter(it => it.isLocalOnly).length > 0 && (
                   <div className={`rounded-[2rem] shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                      <div className={`px-6 py-4 border-b flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-amber-50 border-amber-100'}`}>
                         <ClipboardCheck size={18} className="text-amber-600"/>
                         <h4 className="font-black text-amber-800 dark:text-amber-300">Catatan Inventaris Lokal Ruangan (Tidak Ada di Monitoring)</h4>
                      </div>
                      <div className="p-4 md:p-6 overflow-x-auto">
                         <table className="w-full text-left min-w-[750px]">
                            <thead><tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="pb-4 w-12 text-center">Tipe</th><th className="pb-4">Nama Barang Lokal</th><th className="pb-4">No Referensi / Kartu</th><th className="pb-4 text-center">Aksi</th></tr></thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                               {currentRoomData.items?.filter(it => it.isLocalOnly).map((it, i) => {
                                  const mergedItem = { ...it, no_kartu: it.no_kartu || '-', tahun: it.tahun || '-', merk: (it.merk && it.merk !== '-') ? it.merk : '-' };
                                  return (
                                  <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                                     <td className="py-4 text-center"><div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto text-amber-500 dark:border-amber-700 border"><FileText size={14}/></div></td>
                                     <td className="py-4 font-bold text-sm">{safeString(it.nama)}<br/><span className="text-[10px] md:text-xs font-normal text-slate-400">{safeString(mergedItem.merk)} | {safeString(mergedItem.tahun)}</span></td>
                                     <td className="py-4 text-xs md:text-sm font-mono text-slate-500">{safeString(mergedItem.no_kartu)}</td>
                                     <td className="py-4 text-center flex justify-center gap-1 md:gap-2">
                                         <button onClick={() => exportLabelWord(mergedItem, selectedRoomName, priceData, templates, data)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-lg transition-colors" title="Cetak Label (Word)"><QrCode size={14}/></button>
                                         {!isReadOnly && <button onClick={() => { setTransferUnitModal({show: true, item: mergedItem, sourceRef: selectedRoomName, sourceType: 'ruangan'}); }} className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 rounded-lg transition-colors" title="Mutasi Antar Unit"><Send size={14}/></button>}
                                         {!isReadOnly && <button onClick={() => handleUnlinkFromMaster(it, 'ruangan')} className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg transition-colors" title="Keluarkan dari Monitoring (Jadikan Lokal)"><Unplug size={14}/></button>}
                                         {!isReadOnly && <button onClick={() => confirmDelete(it, 'ruangan')} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 rounded-lg transition-colors" title="Hapus Sepenuhnya"><Trash2 size={14}/></button>}
                                     </td>
                                  </tr>
                               )})}
                            </tbody>
                         </table>
                      </div>
                   </div>
               )}
            </div>
  );
};

export default RuanganView;
