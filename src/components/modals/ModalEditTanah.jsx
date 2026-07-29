import { MapPin, Loader2, Lock, Link, Edit } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { safeString } from '../../utils/helpers';

const ModalEditTanah = ({ show, item, onClose, onSave, statusLoading }) => {
    const [form, setForm] = useState({
        kib: '', deskripsi: '', tgl_peroleh: '', luas: '', alamat: '', status_hak: '', 
        penggunaan: '', petugas: '', tlp: '', gmaps: '', 
        biaya_pengurusan: '', penerimaan_pad: '', tarif_retribusi: '', total_tarif: '', satuan_tarif: '',
        password: ''
    });
    useEffect(() => {
        if (item) {
            setForm({
                kib: safeString(item.kib), deskripsi: safeString(item.deskripsi), tgl_peroleh: safeString(item.tgl_peroleh),
                luas: safeString(item.luas), alamat: safeString(item.alamat), status_hak: safeString(item.status_hak),
                penggunaan: safeString(item.penggunaan), petugas: safeString(item.tlp_petugas), tlp: safeString(item.tlp_petugas),
                gmaps: safeString(item.gmaps), biaya_pengurusan: safeString(item.biaya_pengurusan), penerimaan_pad: safeString(item.penerimaan_pad),
                tarif_retribusi: safeString(item.tarif_retribusi), total_tarif: safeString(item.total_tarif), satuan_tarif: safeString(item.satuan_tarif),
                password: ''
            });
        }
    }, [item]);
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <h3 className="text-xl font-black mb-6 dark:text-white flex items-center gap-2"><MapPin className="text-emerald-500"/> Edit Inventaris Tanah</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm border-b pb-2 border-emerald-100 dark:border-emerald-900">Data Dasar</h4>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">KIB / Nomor</label><input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm font-bold text-slate-900 dark:text-white" value={form.kib} onChange={e=>setForm({...form, kib:e.target.value})} disabled/></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Deskripsi</label><input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white" value={form.deskripsi} onChange={e=>setForm({...form, deskripsi:e.target.value})} /></div>
                        <div className="flex gap-2">
                            <div className="w-1/2"><label className="text-[10px] font-bold text-slate-500 uppercase">Tgl Peroleh</label><input type="date" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white" value={form.tgl_peroleh ? form.tgl_peroleh.split('T')[0] : ''} onChange={e=>setForm({...form, tgl_peroleh:e.target.value})} /></div>
                            <div className="w-1/2"><label className="text-[10px] font-bold text-slate-500 uppercase">Luas (m²)</label><input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white" value={form.luas} onChange={e=>setForm({...form, luas:e.target.value})} /></div>
                        </div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Alamat Lengkap</label><textarea className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white" value={form.alamat} onChange={e=>setForm({...form, alamat:e.target.value})} rows="2"></textarea></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Link Google Maps</label><input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white" value={form.gmaps} onChange={e=>setForm({...form, gmaps:e.target.value})} /></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Status Hak</label><input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white" value={form.status_hak} onChange={e=>setForm({...form, status_hak:e.target.value})} /></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Penggunaan / Kondisi</label><input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white" value={form.penggunaan} onChange={e=>setForm({...form, penggunaan:e.target.value})} /></div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-amber-600 dark:text-amber-400 text-sm border-b pb-2 border-amber-100 dark:border-amber-900">Retribusi & Finansial</h4>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Biaya Pengurusan / Thn (Rp)</label><input type="number" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white" value={form.biaya_pengurusan} onChange={e=>setForm({...form, biaya_pengurusan:e.target.value})} /></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Penerimaan PAD / Thn (Rp)</label><input type="number" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white" value={form.penerimaan_pad} onChange={e=>setForm({...form, penerimaan_pad:e.target.value})} /></div>
                        <div className="flex gap-2">
                            <div className="w-2/3"><label className="text-[10px] font-bold text-slate-500 uppercase">Tarif Retribusi (Rp)</label><input type="number" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white" value={form.tarif_retribusi} onChange={e=>setForm({...form, tarif_retribusi:e.target.value})} /></div>
                            <div className="w-1/3"><label className="text-[10px] font-bold text-slate-500 uppercase">Satuan</label><input type="text" placeholder="m2 / tahun" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white" value={form.satuan_tarif} onChange={e=>setForm({...form, satuan_tarif:e.target.value})} /></div>
                        </div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Total Tarif Jika Disewakan (Rp)</label><input type="number" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white font-bold text-amber-600 dark:text-amber-400" value={form.total_tarif} onChange={e=>setForm({...form, total_tarif:e.target.value})} /></div>
                        
                        <h4 className="font-bold text-blue-600 dark:text-blue-400 text-sm border-b pb-2 border-blue-100 dark:border-blue-900 mt-6">Data Petugas</h4>
                        <div className="flex gap-2">
                            <div className="w-1/2"><label className="text-[10px] font-bold text-slate-500 uppercase">Nama Petugas / PIC</label><input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white" value={form.petugas} onChange={e=>setForm({...form, petugas:e.target.value})} /></div>
                            <div className="w-1/2"><label className="text-[10px] font-bold text-slate-500 uppercase">Telepon (WA)</label><input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm text-slate-900 dark:text-white" value={form.tlp} onChange={e=>setForm({...form, tlp:e.target.value})} /></div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50 mt-6">
                            <label className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 mb-2"><Lock size={12}/> Password Otorisasi (Wajib)</label>
                            <input type="password" placeholder="Password Admin untuk Menyimpan" className="w-full p-2.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 rounded-lg outline-none focus:border-red-500 text-sm font-bold dark:text-red-100" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2 mt-8">
                    <button onClick={onClose} className="w-1/3 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">Batal</button>
                    <button onClick={() => onSave(form, item)} disabled={statusLoading || !form.password} className="w-2/3 py-4 bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 rounded-xl flex justify-center gap-2">{statusLoading ? <Loader2 className="animate-spin" size={20}/> : 'Simpan Semua Perubahan'}</button>
                </div>
            </div>
        </div>
    );
};

export default ModalEditTanah;
