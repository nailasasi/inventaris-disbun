import { QrCode } from 'lucide-react';
import React, { useState } from 'react';

const ModalBulkLabelExport = ({ onClose, monitoringData, onExport }) => {
    const [location, setLocation] = useState('Semua Aset');
    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
                <h3 className="font-black text-xl mb-4 flex items-center gap-2 dark:text-white"><QrCode className="text-emerald-500"/> Cetak Label Massal</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Fungsi ini akan mengekspor semua label untuk aset-aset yang berstatus <b>AKTIF</b> pada tabel Monitoring Aset. Tentukan nama lokasi general jika tidak ada keterangan.</p>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Lokasi Default</label>
                <input className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white border dark:border-slate-700 rounded-xl mb-6 outline-none focus:border-emerald-500 font-bold" placeholder="Misal: Kantor Pusat" value={location} onChange={e=>setLocation(e.target.value)} />
                <div className="flex gap-2">
                    <button onClick={onClose} className="w-1/3 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Batal</button>
                    <button onClick={() => { onExport(monitoringData, location); onClose(); }} className="w-2/3 py-4 bg-emerald-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg hover:bg-emerald-700 transition-colors">Cetak {monitoringData.length} Label</button>
                </div>
            </div>
        </div>
    )
}

export default ModalBulkLabelExport;
