import { FilePlus } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { ALL_BIDANG_RKBMD, JENIS_USULAN_RKBMD, DEFAULT_MASA_MANFAAT } from '../../config/constants';

const ModalRKBMD = ({ allowedBidangList, kodeBarangDataList, onClose, onSave }) => {
    const [form, setForm] = useState({ 
        jenis_usulan: JENIS_USULAN_RKBMD[0], bidang: allowedBidangList[0] || ALL_BIDANG_RKBMD[0], 
        tahun_usulan: new Date().getFullYear().toString(),
        program: '', usulan_kode: '', usulan_nama: '', usulan_jumlah: '', usulan_satuan: '',
        max_jumlah: '', max_satuan: '', opt_kode: '', opt_nama: '', opt_jumlah: '', opt_satuan: '',
        riil_jumlah: '', riil_satuan: '', keterangan: ''
    });
    
    const [searchKode, setSearchKode] = useState('');
    const [showKodeDropdown, setShowKodeDropdown] = useState(false);
    const combinedKodeList = useMemo(() => {
        return [...(kodeBarangDataList || []), ...DEFAULT_MASA_MANFAAT];
    }, [kodeBarangDataList]);
    const filteredKodeData = useMemo(() => {
        if (!searchKode) return combinedKodeList.slice(0, 30);
        const lowerSearch = searchKode.toLowerCase();
        return combinedKodeList.filter(kb => 
            (kb.kode && kb.kode.toLowerCase().includes(lowerSearch)) || 
            (kb.nama && kb.nama.toLowerCase().includes(lowerSearch))
        ).slice(0, 30);
    }, [searchKode, combinedKodeList]);
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
               <h3 className="text-xl md:text-2xl font-black mb-6 dark:text-white flex items-center gap-2"><FilePlus className="text-purple-500"/> Input Form RKBMD</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-700">
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Informasi Umum</label>
                          <select className="w-full p-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg outline-none font-bold text-purple-700 dark:text-purple-300 text-sm mb-2" value={form.jenis_usulan} onChange={e=>setForm({...form, jenis_usulan: e.target.value})}>{JENIS_USULAN_RKBMD.map((b,i)=><option key={i} value={b}>{b}</option>)}</select>
                          <select className="w-full p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none font-bold text-slate-900 dark:text-white text-sm mb-2" value={form.bidang} onChange={e=>setForm({...form, bidang: e.target.value})}>{allowedBidangList.map((b,i)=><option key={i} value={b}>{b}</option>)}</select>
                          <div className="flex gap-2">
                              <input type="text" placeholder="Tahun" className="w-1/3 p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm" value={form.tahun_usulan} onChange={e=>setForm({...form, tahun_usulan:e.target.value})}/>
                              <input type="text" placeholder="Program/Kegiatan/OutPut" className="w-2/3 p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm" value={form.program} onChange={e=>setForm({...form, program:e.target.value})}/>
                          </div>
                      </div>
                      <div className="p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30 relative">
                          <label className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase mb-2 block">Data Usulan BMD</label>
                          
                          <div className="relative mb-2">
                              <input type="text" placeholder="Cari master kode barang (Opsional)..." className="w-full p-2 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-lg outline-none text-slate-900 dark:text-white text-sm" 
                                  value={searchKode} 
                                  onChange={e => { setSearchKode(e.target.value); setShowKodeDropdown(true); }} 
                                  onFocus={() => setShowKodeDropdown(true)}
                                  onBlur={() => setTimeout(() => setShowKodeDropdown(false), 200)}
                              />
                              {showKodeDropdown && filteredKodeData.length > 0 && (
                                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                      {filteredKodeData.map((kb, idx) => (
                                          <button key={idx} type="button" className="w-full text-left px-4 py-2 hover:bg-purple-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-0"
                                              onClick={() => { setForm({...form, usulan_kode: kb.kode, usulan_nama: kb.nama}); setSearchKode(''); setShowKodeDropdown(false); }}>
                                              <p className="font-bold text-sm dark:text-white">{kb.nama}</p>
                                              <p className="text-[10px] text-purple-600 font-mono">Kode: {kb.kode}</p>
                                          </button>
                                      ))}
                                  </div>
                              )}
                          </div>
                          <input type="text" placeholder="Kode Barang" className="w-full p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm mb-2" value={form.usulan_kode} onChange={e=>setForm({...form, usulan_kode: e.target.value})} />
                          <input type="text" placeholder="Nama Barang" className="w-full p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm mb-2" value={form.usulan_nama} onChange={e=>setForm({...form, usulan_nama: e.target.value})} />
                          <div className="flex gap-2">
                              <input type="text" placeholder="Jumlah" className="w-1/2 p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm" value={form.usulan_jumlah} onChange={e=>setForm({...form, usulan_jumlah:e.target.value})}/>
                              <input type="text" placeholder="Satuan" className="w-1/2 p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm" value={form.usulan_satuan} onChange={e=>setForm({...form, usulan_satuan:e.target.value})}/>
                          </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-700">
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Kebutuhan Maksimum</label>
                          <div className="flex gap-2">
                              <input type="text" placeholder="Jumlah" className="w-1/2 p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm" value={form.max_jumlah} onChange={e=>setForm({...form, max_jumlah:e.target.value})}/>
                              <input type="text" placeholder="Satuan" className="w-1/2 p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm" value={form.max_satuan} onChange={e=>setForm({...form, max_satuan:e.target.value})}/>
                          </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="p-4 bg-emerald-50/50 dark:emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                          <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2 block">Data Daftar Barang Yang Dapat Dioptimalkan</label>
                          <input type="text" placeholder="Kode Barang" className="w-full p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm mb-2" value={form.opt_kode} onChange={e=>setForm({...form, opt_kode: e.target.value})} />
                          <input type="text" placeholder="Nama Barang" className="w-full p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm mb-2" value={form.opt_nama} onChange={e=>setForm({...form, opt_nama: e.target.value})} />
                          <div className="flex gap-2">
                              <input type="text" placeholder="Jumlah" className="w-1/2 p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm" value={form.opt_jumlah} onChange={e=>setForm({...form, opt_jumlah:e.target.value})}/>
                              <input type="text" placeholder="Satuan" className="w-1/2 p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm" value={form.opt_satuan} onChange={e=>setForm({...form, opt_satuan:e.target.value})}/>
                          </div>
                      </div>
                      <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                          <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-2 block">Kebutuhan Riil</label>
                          <div className="flex gap-2">
                              <input type="text" placeholder="Jumlah" className="w-1/2 p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm" value={form.riil_jumlah} onChange={e=>setForm({...form, riil_jumlah:e.target.value})}/>
                              <input type="text" placeholder="Satuan" className="w-1/2 p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none text-slate-900 dark:text-white text-sm" value={form.riil_satuan} onChange={e=>setForm({...form, riil_satuan:e.target.value})}/>
                          </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-700">
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Keterangan</label>
                          <textarea placeholder="Tuliskan keterangan..." className="w-full p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg outline-none focus:border-emerald-500 text-slate-900 dark:text-white text-sm" value={form.keterangan} onChange={e=>setForm({...form, keterangan:e.target.value})} rows="3"></textarea>
                      </div>
                   </div>
               </div>
               <div className="flex gap-2 mt-8">
                   <button onClick={onClose} className="w-1/3 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">Batal</button>
                   <button onClick={() => onSave(form)} className="w-2/3 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg flex items-center justify-center gap-2">Simpan Usulan</button>
               </div>
            </div>
         </div>
    );
};

export default ModalRKBMD;
