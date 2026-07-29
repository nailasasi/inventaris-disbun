import { Search, Loader2, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { safeString } from '../../utils/helpers';

const ModalManualDisposal = ({ onClose, onSave, activeAssets, statusLoading }) => {
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [alasan, setAlasan] = useState('');
    const filtered = (activeAssets || []).filter(p => safeString(p.nama).toLowerCase().includes(search.toLowerCase()) || safeString(p.no_kartu).toLowerCase().includes(search.toLowerCase())).slice(0, 20);
    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] w-full max-w-lg shadow-2xl">
                <h3 className="text-xl font-black mb-6 dark:text-white flex items-center gap-2"><Trash2 className="text-red-500"/> Input Usulan Hapus Baru</h3>
                {!selectedItem ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase ml-2 mb-2 block">Tarik Data dari Monitoring Aset</label>
                            <Search className="absolute left-4 top-1/2 mt-3 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Cari nama aset atau no kartu..." className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-red-500 text-sm font-bold text-slate-900 dark:text-white" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="max-h-60 overflow-y-auto border dark:border-slate-700 rounded-xl custom-scrollbar">
                            {filtered.map((item, idx) => (
                                <button key={idx} onClick={() => setSelectedItem(item)} className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 border-b border-slate-50 dark:border-slate-700 transition-colors"><p className="font-bold text-slate-800 dark:text-white text-xs uppercase leading-tight mb-1">{safeString(item.nama)}</p><p className="text-[10px] font-mono font-bold text-slate-500">No: {safeString(item.no_kartu) || '-'} • Lokasi: {item.pemegang !== '-' ? item.pemegang : (item.ruangan !== '-' ? item.ruangan : item.lokasi)}</p></button>
                            ))}
                            {search && filtered.length === 0 && <p className="p-4 text-center text-xs text-slate-500 font-bold">Aset tidak ditemukan</p>}
                        </div>
                        <button onClick={onClose} className="w-full py-3 text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl mt-4">Batal</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-100 dark:border-red-800 mb-6"><p className="text-xs text-red-500 font-bold mb-1">Aset Terpilih:</p><p className="font-bold text-red-900 dark:text-red-100 text-sm">{safeString(selectedItem.nama)}</p><p className="text-xs text-red-600 dark:text-red-300 font-mono mt-1">No: {safeString(selectedItem.no_kartu) || '-'}</p></div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Alasan Penghapusan</label>
                            <textarea placeholder="Contoh: Rusak berat / Hilang / Dilelang" className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-red-500 text-sm font-medium text-slate-900 dark:text-white" rows="3" value={alasan} onChange={(e)=>setAlasan(e.target.value)}></textarea>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <button onClick={() => setSelectedItem(null)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">Pilih Ulang</button>
                            <button onClick={() => onSave(selectedItem, alasan)} disabled={statusLoading || !alasan} className="flex-1 py-3 bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 rounded-xl flex justify-center gap-2">{statusLoading ? <Loader2 className="animate-spin" size={20}/> : 'Pindahkan ke Usulan'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModalManualDisposal;
