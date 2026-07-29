import { User, Loader2, Edit } from 'lucide-react';
import React, { useState } from 'react';
import { safeString } from '../../utils/helpers';

const ModalEditPajakOwner = ({ onClose, onSave, item, data, ruanganData, statusLoading }) => {
    const [targetId, setTargetId] = useState('');
    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] w-full max-w-lg shadow-2xl">
                <h3 className="text-xl font-black mb-6 dark:text-white flex items-center gap-2"><User className="text-emerald-500"/> Edit Pemegang Kendaraan</h3>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-100 dark:border-emerald-800 mb-6">
                    <p className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">{safeString(item?.nama)}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-300 font-mono mt-1">No Polisi: {safeString(item?.no_kartu) || '-'}</p>
                </div>
                <div className="space-y-4">
                    <select className="w-full p-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-medium dark:text-white focus:border-emerald-500 text-slate-900 dark:text-white" value={targetId} onChange={e=>setTargetId(e.target.value)}>
                        <option value="">-- Pilih Pegawai Baru --</option>
                        {(data||[]).map((p,i)=><option key={i} value={p.nip}>{p.nama}</option>)}
                        <option disabled>──────────</option>
                        {(ruanganData||[]).map((r,i)=><option key={i} value={r.nama_ruangan}>{r.nama_ruangan}</option>)}
                    </select>
                    <div className="flex gap-2 pt-4">
                        <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">Batal</button>
                        <button onClick={() => onSave(targetId)} disabled={statusLoading || !targetId} className="flex-1 py-3 bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 rounded-xl flex justify-center gap-2">{statusLoading ? <Loader2 className="animate-spin" size={20}/> : 'Simpan Perubahan'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalEditPajakOwner;
