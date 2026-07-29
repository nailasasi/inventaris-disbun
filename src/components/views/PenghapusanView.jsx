import { PlusCircle, Search, Trash2 } from 'lucide-react';
import React from 'react';
import { formatCurrency, safeString } from '../../utils/helpers';

const PenghapusanView = ({ disposalData, handleRestoreItem, isDarkMode, modals, processPermanentDisposal, setModals, setMonitoringSearch }) => {
  return (
    <div className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border overflow-hidden flex flex-col h-[80vh] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                <div className={`p-6 md:p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50'}`}>
                   <h3 className="font-black text-xl text-red-600 flex items-center gap-2"><Trash2/> Daftar Usulan Penghapusan Aset</h3>
                   <div className="flex items-center gap-2 w-full md:w-auto">
                       <div className="relative w-full md:w-auto"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input type="text" placeholder="Cari aset..." className={`w-full md:w-64 pl-10 pr-4 py-2 md:py-3 rounded-xl border outline-none text-sm focus:border-red-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`} onChange={e => setMonitoringSearch(e.target.value)} /></div>
                       <button onClick={() => setModals({...modals, manualDisposal: true})} className="px-4 py-2 md:py-3 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap"><PlusCircle size={16}/><span className="hidden md:inline">Manual</span></button>
                   </div>
                </div>
                <div className="p-0 md:p-4 flex-grow overflow-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}><tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="p-4">Aset & Kode</th><th className="p-4">Lokasi Akhir</th><th className="p-4 text-center">Nilai Buku (Rp)</th><th className="p-4 text-center">Alasan</th><th className="p-4 text-center">Aksi Penahanan (Re-Aktif)</th><th className="p-4 text-center">Hapus Permanen</th></tr></thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                            {disposalData.length === 0 ? <tr><td colSpan="6" className="p-10 text-center font-bold text-slate-400">Tidak ada usulan penghapusan.</td></tr> : disposalData.map((it, i) => (
                                <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-red-50/30'}>
                                    <td className="p-4"><p className="font-bold text-sm">{safeString(it.nama)}</p><p className="text-[10px] text-slate-400 font-mono mt-1">{safeString(it.no_kartu)}</p></td>
                                    <td className="p-4 text-sm font-medium">{it.pemegang !== '-' ? safeString(it.pemegang) : (it.ruangan !== '-' ? safeString(it.ruangan) : safeString(it.lokasi || '-'))}</td>
                                    <td className="p-4 text-center font-bold text-slate-500">{formatCurrency(it.nilai_buku || 0)}</td>
                                    <td className="p-4 text-center"><span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black">{it.isManuallyDisposed ? 'USULAN MANUAL' : (it.isExpired ? 'MASA PAKAI HABIS' : 'NILAI BUKU 0')}</span>{it.alasan_hapus && <p className="text-[10px] mt-2 italic text-slate-500">"{it.alasan_hapus}"</p>}</td>
                                    <td className="p-4 text-center"><button onClick={()=>handleRestoreItem(it)} className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold text-xs rounded-xl transition-all shadow-sm">{it.isManuallyDisposed ? 'Batalkan Usulan' : 'Batalkan & Re-Aktifkan'}</button></td>
                                    <td className="p-4 text-center"><button onClick={() => {
                                        const pass = prompt("MASUKKAN PASSWORD OTORISASI (Kasubbag / Pengurus Barang) untuk MENGHAPUS PERMANEN aset ini dari sistem:");
                                        if (pass) processPermanentDisposal(it, pass);
                                    }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 mx-auto"><Trash2 size={12}/> Hapus Permanen</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
  );
};

export default PenghapusanView;
