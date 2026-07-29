import { AlertTriangle, BarChart3, Car, FilePlus, Send, Users, X } from 'lucide-react';
import React from 'react';
import { UNIT_CODES, UNIT_LABELS } from '../../config/firebase';
import { getSafeDateString, parseDateRobust, safeString } from '../../utils/helpers';

const DashboardView = ({ activeUnitView, filteredPegawaiData, filteredPriceData, handleApproveMutasi, handleRejectMutasi, isDarkMode, mutasiPendingData, setActiveTab, setShowDashboardAlert, showDashboardAlert, statsAsetAktif, statsPenghapusan, statsReAktif, status, todayBookings, totalStat, userRole, visibleRkbmdData }) => {
  return (
    <div className="space-y-6 md:space-y-8">
               {userRole !== 'staff' && mutasiPendingData.some(m => m.targetUnit === activeUnitView) && (
                   <div className="p-6 md:p-8 bg-indigo-50 border border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 rounded-[2rem] shadow-sm">
                       <h4 className="font-black text-indigo-800 dark:text-indigo-200 text-lg mb-4 flex items-center gap-2"><Send size={20}/> Menunggu Verifikasi Mutasi Masuk</h4>
                       <div className="space-y-3">
                           {mutasiPendingData.filter(m => m.targetUnit === activeUnitView).map(m => (
                               <div key={m.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm border border-indigo-100 dark:border-indigo-700/50">
                                   <div>
                                       <p className="font-bold text-sm md:text-base dark:text-white">{safeString(m.item.nama)}</p>
                                       <p className="text-xs text-slate-500 font-mono mt-1">No: {safeString(m.item.no_kartu) || '-'} • Dari: {safeString(m.senderName)} ({UNIT_LABELS[m.sourceUnit]})</p>
                                       {m.targetUnit === UNIT_CODES.PUSAT && m.targetBidang && <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">Tujuan Bidang: {m.targetBidang}</p>}
                                   </div>
                                   <div className="flex items-center gap-2 w-full md:w-auto">
                                       <button onClick={() => handleRejectMutasi(m)} disabled={status.loading} className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30 rounded-xl font-bold text-xs transition-colors">Tolak</button>
                                       <button onClick={() => handleApproveMutasi(m)} disabled={status.loading} className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold text-xs transition-colors shadow-md">Terima & Assign</button>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}
               {userRole === 'admin' && showDashboardAlert && (
                 (() => {
                     const expiring = Object.values(filteredPriceData).filter(item => {
                         const n = safeString(item.nama).toLowerCase();
                         const isVehicle = (n.includes('motor') || n.includes('mobil') || n.includes('kendaraan') || n.includes('truk') || n.includes('jeep') || n.includes('pick up')) && !n.includes('kursi roda') && !n.includes('roda dorong');
                         if (!isVehicle && !item.tgl_pajak) return false;
                         const d = getSafeDateString(item.tgl_pajak) || getSafeDateString(item.tgl_pengadaan);
                         if (!d) return false;
                         const tMasa = parseDateRobust(d);
                         if (!tMasa) return false;
                         return Math.ceil((tMasa - new Date()) / 86400000) <= 30;
                     });
                     if (expiring.length > 0) {
                        return (
                           <div className="bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800 p-4 md:p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm mb-6"><div className="flex items-start md:items-center gap-4"><div className="p-3 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 rounded-2xl shrink-0"><AlertTriangle size={28} /></div><div><h4 className="font-black text-red-800 dark:text-red-200 text-base md:text-lg">Peringatan Pajak Kendaraan!</h4><p className="text-xs md:text-sm text-red-600 dark:text-red-300 mt-1 font-medium">Terdapat <b className="font-black">{expiring.length} kendaraan</b> di unit ini yang masa pajaknya akan segera habis.</p></div></div><div className="flex items-center gap-2 w-full md:w-auto"><button onClick={() => setActiveTab('pajak')} className="flex-1 md:flex-none px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-red-700 shadow-lg shadow-red-200">Lihat Detail</button><button onClick={() => setShowDashboardAlert(false)} className="p-3 bg-red-100 text-red-500 rounded-xl hover:bg-red-200 shrink-0"><X size={18} /></button></div></div>
                        );
                     } return null;
                 })()
               )}
               {userRole === 'admin' && todayBookings.length > 0 && (
                   <div className="p-6 md:p-8 bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 rounded-[2rem] shadow-sm mb-6">
                       <h4 className="font-black text-blue-800 dark:text-blue-200 text-lg mb-4 flex items-center gap-2"><Car size={20}/> Aktivitas Peminjaman Kendaraan Dinas (24 Jam Terakhir)</h4>
                       <div className="space-y-3">
                           {todayBookings.map((b, idx) => (
                               <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm border border-blue-100 dark:border-blue-700/50">
                                   <div>
                                       <p className="font-bold text-sm md:text-base dark:text-white">{safeString(b.itemName)} - {safeString(b.no_kartu)}</p>
                                       <p className="text-xs text-slate-500 font-mono mt-1">Pengemudi: {safeString(b.receiverName)} • Tujuan: {safeString(b.tujuan)}</p>
                                   </div>
                                   <div className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full">
                                       Berangkat: {safeString(b.tglBerangkatRaw || b.tglBerangkat)}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                  <div className={`col-span-1 p-6 md:p-8 rounded-[2rem] shadow-xl border flex flex-col justify-center gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="p-4 bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-2xl w-max"><Users size={32}/></div><div><h3 className="text-3xl md:text-4xl font-black">{filteredPegawaiData.length}</h3><p className="text-xs font-bold text-slate-400 uppercase mt-1">Total Pegawai</p></div></div>
                  <div className={`col-span-1 lg:col-span-2 p-6 md:p-8 rounded-[2rem] shadow-xl border flex flex-col justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                     <h3 className="text-lg font-black mb-6 flex items-center gap-2"><BarChart3 className="text-emerald-500"/> Statistik Kondisi Aset ({UNIT_LABELS[activeUnitView]})</h3>
                     <div className="space-y-5">
                        <div><div className="flex justify-between text-xs font-bold mb-2"><span className="text-emerald-600 dark:text-emerald-400">Aset Aktif Digunakan ({statsAsetAktif})</span><span>{Math.round((statsAsetAktif / totalStat) * 100)}%</span></div><div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden"><div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style={{width: `${(statsAsetAktif / totalStat) * 100}%`}}></div></div></div>
                        <div><div className="flex justify-between text-xs font-bold mb-2"><span className="text-blue-600 dark:text-blue-400">Aset Re-Aktif (Habis Pakai) ({statsReAktif})</span><span>{Math.round((statsReAktif / totalStat) * 100)}%</span></div><div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden"><div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{width: `${(statsReAktif / totalStat) * 100}%`}}></div></div></div>
                        <div><div className="flex justify-between text-xs font-bold mb-2"><span className="text-red-600 dark:text-red-400">Usulan Penghapusan ({statsPenghapusan})</span><span>{Math.round((statsPenghapusan / totalStat) * 100)}%</span></div><div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden"><div className="bg-red-500 h-3 rounded-full transition-all duration-1000" style={{width: `${(statsPenghapusan / totalStat) * 100}%`}}></div></div></div>
                     </div>
                  </div>
                  <div className={`col-span-1 p-6 md:p-8 rounded-[2rem] shadow-xl border flex flex-col justify-center gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="p-4 bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 rounded-2xl w-max"><FilePlus size={32}/></div><div><h3 className="text-3xl md:text-4xl font-black">{visibleRkbmdData.length}</h3><p className="text-xs font-bold text-slate-400 uppercase mt-1">Usulan RKBMD</p></div></div>
               </div>
            </div>
  );
};

export default DashboardView;
