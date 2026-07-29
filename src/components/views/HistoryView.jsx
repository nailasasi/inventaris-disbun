import { History as HistoryIcon } from 'lucide-react';
import React from 'react';
import { safeString } from '../../utils/helpers';

const HistoryView = ({ filteredHistoryData, isDarkMode }) => {
  return (
    <div className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border overflow-hidden flex flex-col h-[80vh] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                <div className={`p-6 md:p-8 border-b flex items-center gap-4 shrink-0 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50'}`}>
                   <h3 className="font-black text-xl flex items-center gap-2"><HistoryIcon className="text-emerald-600"/> Riwayat Mutasi & Aktivitas</h3>
                </div>
                <div className="p-0 md:p-4 flex-grow overflow-auto custom-scrollbar">
                   <table className="w-full text-left min-w-[800px]">
                      <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                         <tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}>
                            <th className="p-4">Waktu</th>
                            <th className="p-4">Jenis Aktivitas</th>
                            <th className="p-4">Nama Aset</th>
                            <th className="p-4">Dari (Sumber)</th>
                            <th className="p-4">Ke (Tujuan)</th>
                         </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                         {filteredHistoryData.length === 0 ? <tr><td colSpan="5" className="p-10 text-center font-bold text-slate-400">Belum ada riwayat tercatat.</td></tr> : 
                         filteredHistoryData.map((h, i) => (
                            <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                               <td className="p-4 font-mono text-xs text-slate-500">{h.timestamp ? new Date(h.timestamp.seconds * 1000).toLocaleString('id-ID') : '-'}</td>
                               <td className="p-4 font-bold text-xs"><span className={`px-2 py-1 rounded-md ${h.type === 'MUTASI' || h.type === 'MUTASI ANTAR UNIT' || h.type.includes('MUTASI') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : (h.type.includes('HAPUS') ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300')}`}>{safeString(h.type)}</span></td>
                               <td className="p-4 font-bold text-sm">{safeString(h.itemName)} <br/><span className="font-mono font-normal text-[10px] text-slate-400">{safeString(h.no_kartu)}</span></td>
                               <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{safeString(h.senderName) || '-'}</td>
                               <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{safeString(h.receiverName) || '-'}{h.alasan && <><br/><span className="text-[10px] text-slate-400 mt-1 italic block">"{h.alasan}"</span></>}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
  );
};

export default HistoryView;
