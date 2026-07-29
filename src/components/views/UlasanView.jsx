import { Star } from 'lucide-react';
import React from 'react';
import { safeString } from '../../utils/helpers';

const UlasanView = ({ feedbacks, isDarkMode }) => {
  return (
    <div className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border overflow-hidden flex flex-col h-[80vh] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                <div className={`p-6 md:p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50'}`}>
                   <h3 className="font-black text-xl text-yellow-600 flex items-center gap-2"><Star className="fill-yellow-600"/> Daftar Ulasan & Masukan Pengguna</h3>
                </div>
                <div className="p-4 md:p-8 flex-grow overflow-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {feedbacks.length === 0 ? <p className="col-span-full text-center p-10 font-bold text-slate-400">Belum ada ulasan yang diberikan pengguna.</p> : feedbacks.map((f, i) => (
                            <div key={i} className={`p-6 rounded-[2rem] border shadow-sm flex flex-col ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{safeString(f.unitName)}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{safeString(f.userRole)}</p>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star key={idx} size={14} className={idx < f.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300 dark:text-slate-600"} />
                                        ))}
                                    </div>
                                </div>
                                <p className={`flex-grow text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{safeString(f.comment)}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-auto">{f.timestamp ? new Date(f.timestamp.seconds * 1000).toLocaleString('id-ID') : '-'}</p>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
  );
};

export default UlasanView;
