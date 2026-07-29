import { Loader2, Send } from 'lucide-react';
import React, { useState } from 'react';
import { UNIT_CODES, UNIT_LABELS } from '../../config/firebase';
import { BIDANG_PUSAT_LIST } from '../../config/constants';

const ModalTransferUnit = ({ item, sourceUnitView, selectedUser, selectedRoom, onClose, onSave, statusLoading }) => {
    const [targetUnit, setTargetUnit] = useState('');
    const [targetBidang, setTargetBidang] = useState('');
    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] w-full max-w-md shadow-2xl text-slate-900 dark:text-white">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Send size={24} className="text-indigo-600 dark:text-indigo-400"/> Mutasi Antar Unit</h3>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl mb-6 border border-indigo-100 dark:border-indigo-800 text-sm">
                    <p className="font-bold text-indigo-900 dark:text-indigo-100">Aset: {item?.nama}</p>
                    <p className="font-mono text-indigo-600 dark:text-indigo-400 text-xs mt-1">No: {item?.no_kartu}</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Pilih Unit Tujuan</label>
                        <select value={targetUnit} onChange={e=>setTargetUnit(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:border-indigo-500">
                            <option value="">-- Pilih Unit --</option>
                            {Object.entries(UNIT_LABELS).filter(([code])=>code!==sourceUnitView).map(([code, label]) => (
                                <option key={code} value={code}>{label}</option>
                            ))}
                        </select>
                    </div>
                    {targetUnit === UNIT_CODES.PUSAT && (
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Bidang Tujuan (Di Pusat)</label>
                            <select value={targetBidang} onChange={e=>setTargetBidang(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:border-indigo-500">
                                <option value="">-- Pilih Bidang --</option>
                                {BIDANG_PUSAT_LIST.map((b,i) => <option key={i} value={b}>{b}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="flex gap-2 pt-4">
                        <button onClick={onClose} className="w-1/3 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">Batal</button>
                        <button onClick={()=>onSave(targetUnit, targetBidang)} disabled={!targetUnit || (targetUnit === UNIT_CODES.PUSAT && !targetBidang) || statusLoading} className="w-2/3 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex justify-center gap-2 shadow-lg">{statusLoading ? <Loader2 className="animate-spin" size={20}/> : 'Ajukan Mutasi'}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalTransferUnit;
