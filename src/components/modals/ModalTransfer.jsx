import { Loader2, ArrowRightLeft, Download } from 'lucide-react';
import React, { useState } from 'react';
import { safeString } from '../../utils/helpers';

const ModalTransfer = ({ item, data, selectedUser, onClose, onSave, statusLoading }) => {
    const [targetNip, setTargetNip] = useState('');
    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl">
                <h3 className="text-xl md:text-2xl font-black mb-6 dark:text-white flex items-center gap-2"><ArrowRightLeft size={24} className="text-blue-600 dark:text-blue-400"/> Mutasi Aset</h3>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
                  <p className="font-bold text-sm text-blue-900 dark:text-blue-100">Aset: {safeString(item?.nama)}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-1">No: {safeString(item?.no_kartu) || '-'}</p>
                </div>
                <div className="space-y-4">
                    <select className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700 outline-none font-medium focus:border-blue-500 text-slate-900 dark:text-white" value={targetNip} onChange={e=>setTargetNip(e.target.value)}>
                        <option value="">-- Pilih Pegawai Tujuan --</option>
                        {(data||[]).filter(p=>p.nip !== selectedUser?.nip).map((p,i)=><option key={i} value={p.nip}>{p.nama}</option>)}
                    </select>
                    <button onClick={() => onSave(targetNip)} disabled={!targetNip || statusLoading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center gap-2">{statusLoading ? <Loader2 className="animate-spin" size={20}/> : "Proses & Download BAST"}</button>
                    <button onClick={onClose} className="w-full py-3 text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl">Batal</button>
                </div>
            </div>
        </div>
    );
};

export default ModalTransfer;
