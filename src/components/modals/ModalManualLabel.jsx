import { Info } from 'lucide-react';
import React from 'react';

const ModalManualLabel = ({ onClose, templates }) => {
   return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] w-full max-w-md shadow-2xl text-center">
                <div className="w-20 h-20 bg-amber-100 text-amber-500 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><Info size={40}/></div>
                <h3 className="font-black text-xl mb-2 dark:text-white">Label Manual</h3>
                <p className="text-slate-500 text-sm mb-6">Fitur input data bebas untuk mencetak label sedang dalam pengembangan. Silakan gunakan cetak label dari Data Pegawai atau Ruangan.</p>
                <button onClick={onClose} className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200">Tutup</button>
            </div>
        </div>
   )
}

export default ModalManualLabel;
