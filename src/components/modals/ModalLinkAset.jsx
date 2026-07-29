import { Loader2, Link } from 'lucide-react';
import React, { useState } from 'react';
import { safeString } from '../../utils/helpers';

const ModalLinkAset = ({ onClose, onSave, item, data, ruanganData, statusLoading }) => {
    const [linkType, setLinkType] = useState('pegawai');
    const [targetValue, setTargetValue] = useState('');
    const [updateMaster, setUpdateMaster] = useState(false);
    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
                <h3 className="font-black text-xl mb-6 dark:text-white flex items-center gap-2"><Link className="text-emerald-500"/> Hubungkan Aset</h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl mb-6 border border-emerald-100 dark:border-emerald-800">
                    <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100">{safeString(item?.nama)}</p>
                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">{safeString(item?.no_kartu)}</p>
                </div>
                <div className="space-y-4">
                    <select value={linkType} onChange={e=>{setLinkType(e.target.value); setTargetValue('');}} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none">
                        <option value="pegawai">Assign ke Pegawai</option>
                        <option value="ruangan">Assign ke Ruangan</option>
                        <option value="manual">Ketik Lokasi Manual</option>
                    </select>
                    
                    {linkType === 'pegawai' && (
                        <select value={targetValue} onChange={e=>setTargetValue(e.target.value)} className="w-full p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none">
                            <option value="">-- Pilih Pegawai --</option>
                            {data.map(p=><option key={p.nip} value={p.nip}>{p.nama}</option>)}
                        </select>
                    )}
                    {linkType === 'ruangan' && (
                        <select value={targetValue} onChange={e=>setTargetValue(e.target.value)} className="w-full p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none">
                            <option value="">-- Pilih Ruangan --</option>
                            {ruanganData.map(r=><option key={r.nama_ruangan} value={r.nama_ruangan}>{r.nama_ruangan}</option>)}
                        </select>
                    )}
                    {linkType === 'manual' && (
                        <input type="text" value={targetValue} onChange={e=>setTargetValue(e.target.value)} placeholder="Ketik Lokasi Bebas (Tanpa Master)" className="w-full p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none"/>
                    )}
                    
                    {linkType !== 'manual' && (
                        <label className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 cursor-pointer">
                            <input type="checkbox" checked={updateMaster} onChange={e=>setUpdateMaster(e.target.checked)} className="w-5 h-5 accent-blue-600"/>
                            <span className="text-sm font-bold text-blue-900 dark:text-blue-200">Suntikkan aset ke daftar master tujuan?</span>
                        </label>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                        <button onClick={onClose} className="w-1/3 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Batal</button>
                        <button onClick={()=>onSave(linkType, targetValue, updateMaster)} disabled={statusLoading || !targetValue} className="w-2/3 py-4 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 flex justify-center shadow-lg">{statusLoading ? <Loader2 className="animate-spin" size={20}/> : 'Simpan Koneksi'}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalLinkAset;
