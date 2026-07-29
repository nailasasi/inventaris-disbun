import { Search } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { safeString, parseDateRobust, getSafeDateString } from '../../utils/helpers';

const ModalAddRoomAsset = ({ onClose, onSave, priceData, ruanganData, pegawaiData, kodeBarangDataList }) => {
    const [form, setForm] = useState({ nama: '', merk: '', tgl_pengadaan: new Date().toISOString().split('T')[0], no_kartu: '', nilai_perolehan: '', jumlah: 1 });
    const [search, setSearch] = useState('');
    const [saveToMaster, setSaveToMaster] = useState(true); 
    const assignedKards = useMemo(() => { const set = new Set(); (ruanganData || []).forEach(r => (r.items || []).forEach(it => { if(it.no_kartu && it.no_kartu !== '-') set.add(it.no_kartu.toLowerCase()); })); (pegawaiData || []).forEach(p => (p.items || []).forEach(it => { if(it.no_kartu && it.no_kartu !== '-') set.add(it.no_kartu.toLowerCase()); })); return set; }, [ruanganData, pegawaiData]);
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
               <h3 className="text-xl md:text-2xl font-black mb-6 dark:text-white">Aset KIR (Ruangan)</h3>
               <div className="space-y-4">
                  <div className="relative mb-6">
                    <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase ml-2 mb-2 block">Cari dari Master Data (Yang Belum Ter-assign)</label>
                    <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Ketik Nomor Kartu atau Nama Barang..." className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-emerald-50 transition-all text-xs md:text-sm font-bold text-slate-900 dark:text-white" value={search} onChange={e => setSearch(e.target.value)} /></div>
                    {search.length > 1 && (
                      <div className="absolute w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden max-h-48 overflow-y-auto z-50">
                        {Object.values(priceData || {}).filter(p => safeString(p.nama).toLowerCase().includes(search.toLowerCase()) || safeString(p.no_kartu).toLowerCase().includes(search.toLowerCase())).filter(p => !assignedKards.has(safeString(p.no_kartu).toLowerCase())).slice(0, 50).map((p, idx) => {
                            let tglString = new Date().toISOString().split('T')[0];
                            if(p.tgl_pengadaan) {
                                const pd = parseDateRobust(getSafeDateString(p.tgl_pengadaan));
                                if(pd && !isNaN(pd)) tglString = pd.toISOString().split('T')[0];
                            }
                            return (
                            <button key={idx} type="button" onClick={() => {
                                setForm({...form, nama: safeString(p.nama), no_kartu: safeString(p.no_kartu), tgl_pengadaan: tglString, nilai_perolehan: safeString(p.nilai_perolehan), jumlah: 1});
                                setSearch('');
                                setSaveToMaster(true);
                              }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-slate-700 border-b border-slate-50 dark:border-slate-700 transition-colors"><p className="font-bold text-slate-800 dark:text-white text-xs uppercase leading-tight mb-1">{safeString(p.nama)}</p><p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">No. Kartu: {safeString(p.no_kartu) || '-'}</p></button>
                        )})}
                        {Object.values(priceData || {}).filter(p => safeString(p.nama).toLowerCase().includes(search.toLowerCase()) || safeString(p.no_kartu).toLowerCase().includes(search.toLowerCase())).filter(p => !assignedKards.has(safeString(p.no_kartu).toLowerCase())).length === 0 && <p className="p-4 text-center text-xs text-slate-500 font-bold">Tidak ada aset bebas yang cocok.</p>}
                      </div>
                    )}
                  </div>
                  <input type="text" placeholder="Nama Barang" className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-emerald-500 text-slate-900 dark:text-white" value={form.nama} onChange={e=>setForm({...form, nama:e.target.value.toUpperCase()})}/>
                  <input type="text" placeholder="Merk" className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-emerald-500 text-slate-900 dark:text-white" value={form.merk} onChange={e=>setForm({...form, merk:e.target.value.toUpperCase()})}/>
                  <div>
                      <label className="text-[10px] font-bold text-slate-500 ml-2">Tanggal/Bulan/Tahun Pengadaan</label>
                      <input type="date" className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-emerald-500 text-slate-900 dark:text-white mt-1" value={form.tgl_pengadaan} onChange={e=>setForm({...form, tgl_pengadaan:e.target.value})}/>
                  </div>
                  <div className="flex gap-2">
                     <div className="w-2/3">
                         <label className="text-[10px] font-bold text-slate-500 ml-2">No Kartu (Awalan)</label>
                         <input type="text" placeholder="No Kartu" className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-emerald-500 text-slate-900 dark:text-white" value={form.no_kartu} onChange={e=>setForm({...form, no_kartu:e.target.value})}/>
                     </div>
                     <div className="w-1/3">
                         <label className="text-[10px] font-bold text-slate-500 ml-2">Jml/Volume</label>
                         <input type="number" placeholder="Jml" min="1" className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-emerald-500 text-slate-900 dark:text-white" value={form.jumlah} onChange={e=>setForm({...form, jumlah:e.target.value})} title="Dibatasi ke 1 jika ditarik dari Master Data"/>
                     </div>
                  </div>
                  <input type="number" placeholder="Nilai Perolehan (Rp)" className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-emerald-500 text-slate-900 dark:text-white" value={form.nilai_perolehan} onChange={e=>setForm({...form, nilai_perolehan:e.target.value})}/>
                  
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl mt-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" checked={saveToMaster} onChange={e => setSaveToMaster(e.target.checked)} className="w-5 h-5 accent-indigo-600 mt-0.5 shrink-0" />
                          <div className="flex flex-col">
                              <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Simpan ke Daftar Monitoring Aset?</span>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-300 mt-1 leading-tight">Jika <b>TIDAK</b> dicentang, barang ini hanya akan dicatat ke dalam KIR Ruangan dan tidak masuk ke Master Data Monitoring.</span>
                          </div>
                      </label>
                  </div>
                  <button onClick={() => onSave({...form, saveToMaster})} disabled={!form.nama} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50">Simpan</button>
                  <button onClick={onClose} className="w-full py-3 text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl">Batal</button>
               </div>
            </div>
         </div>
    );
};

export default ModalAddRoomAsset;
