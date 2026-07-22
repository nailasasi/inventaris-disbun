import { Loader2, Lock, Edit3, Edit } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { formatCurrency, parseDateRobust, parseKodeBarangData, calculateNilaiBuku, formatDisplayDate, getSafeDateString } from '../../utils/helpers';

const ModalEditNilaiBuku = ({ onClose, onSave, item, statusLoading, kodeBarangDataList }) => {
    const [nilaiPerolehan, setNilaiPerolehan] = useState(item?.nilai_perolehan || 0);
    const [tglPengadaan, setTglPengadaan] = useState(item?.tgl_pengadaan ? getSafeDateString(item.tgl_pengadaan).split('T')[0] : '');
    const [tglHabis, setTglHabis] = useState(item?.tgl_habis ? getSafeDateString(item.tgl_habis).split('T')[0] : '');
    const [nilaiBuku, setNilaiBuku] = useState(item?.nilai_buku || 0);
    const [pass, setPass] = useState('');
    useEffect(() => {
        if (tglPengadaan) {
            const { masa_manfaat } = parseKodeBarangData(item?.no_kartu, kodeBarangDataList);
            
            const dPengadaan = parseDateRobust(tglPengadaan);
            if (dPengadaan) {
                const dHabis = new Date(dPengadaan);
                dHabis.setFullYear(dHabis.getFullYear() + masa_manfaat);
                setTglHabis(dHabis.toISOString().split('T')[0]);
            }
            
            const nb = calculateNilaiBuku(nilaiPerolehan, tglPengadaan, masa_manfaat);
            setNilaiBuku(nb);
        }
    }, [nilaiPerolehan, tglPengadaan, item?.no_kartu, kodeBarangDataList]);
    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
                <h3 className="font-black text-xl mb-2 dark:text-white flex items-center gap-2"><Edit3 className="text-blue-500"/> Edit Nilai Pengadaan & Masa Pakai</h3>
                <p className="text-xs text-slate-500 mb-6 font-medium">Aset: <b className="text-slate-800 dark:text-slate-200">{item?.nama}</b></p>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Nilai Pengadaan (Rp)</label>
                        <input type="number" value={nilaiPerolehan} onChange={e=>setNilaiPerolehan(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Tanggal Pengadaan</label>
                        <input type="date" value={tglPengadaan} onChange={e=>setTglPengadaan(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                        <div>
                            <label className="text-[10px] font-bold text-blue-500 uppercase block mb-1">Tgl Habis (Otomatis)</label>
                            <span className="text-sm font-black text-blue-800 dark:text-blue-300">{formatDisplayDate(tglHabis)}</span>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-blue-500 uppercase block mb-1">Nilai Buku (Otomatis)</label>
                            <span className="text-sm font-black text-blue-800 dark:text-blue-300">{formatCurrency(nilaiBuku)}</span>
                        </div>
                    </div>
                    <div className="pt-2">
                        <label className="text-[10px] font-black text-red-500 mb-2 block uppercase flex items-center gap-1"><Lock size={12}/> Password Otorisasi (Wajib)</label>
                        <input type="password" placeholder="Password Admin" value={pass} onChange={e=>setPass(e.target.value)} className="w-full p-4 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-red-500"/>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                        <button onClick={onClose} className="w-1/3 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Batal</button>
                        <button onClick={()=>onSave(nilaiPerolehan, tglPengadaan, tglHabis, nilaiBuku, pass)} disabled={statusLoading || !pass} className="w-2/3 py-4 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50 flex justify-center shadow-lg">{statusLoading ? <Loader2 className="animate-spin" size={20}/> : 'Simpan Perubahan'}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalEditNilaiBuku;
