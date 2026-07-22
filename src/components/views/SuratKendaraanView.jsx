import { AlertCircle, FileKey, FileSignature, Printer } from 'lucide-react';
import React from 'react';

const SuratKendaraanView = ({ availableVehicles, handleExportSuratJalan, isDarkMode, pengurusOptions, setSuratJalanForm, suratJalanForm, suratJalanHistory, vehicleItems }) => {
  return (
    <div className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                <div className={`p-6 md:p-8 border-b ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50'}`}>
                   <h3 className="font-black text-xl flex items-center gap-2"><FileKey className="text-blue-600"/> Buat Surat Tugas / Izin Kendaraan Dinas</h3>
                   <p className="text-slate-500 text-sm mt-2">Pilih kendaraan dinas dan isi formulir perjalanan untuk mencetak surat tugas secara otomatis. Kendaraan yang sudah dipinjam pada tanggal yang dipilih tidak akan muncul di daftar.</p>
                </div>
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Pilih Kendaraan Dinas</label>
                            <select className={`w-full p-4 rounded-xl border outline-none font-bold text-sm focus:border-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50'}`} value={suratJalanForm.kendaraanId} onChange={e => setSuratJalanForm({...suratJalanForm, kendaraanId: e.target.value})}>
                                <option value="">-- Pilih Kendaraan --</option>
                                {availableVehicles.map(v => <option key={v.no_kartu} value={v.no_kartu}>{v.no_kartu} - {v.nama}</option>)}
                            </select>
                            {suratJalanForm.tglBerangkat && vehicleItems.length !== availableVehicles.length && (
                                <p className="text-[10px] text-orange-500 mt-1 flex items-center gap-1"><AlertCircle size={10}/> Beberapa kendaraan disembunyikan karena sedang dipakai pada tanggal ini.</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Nama Pengemudi</label>
                            <input type="text" placeholder="Masukkan nama pengemudi..." className={`w-full p-4 rounded-xl border outline-none font-bold text-sm focus:border-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50'}`} value={suratJalanForm.pengemudi} onChange={e => setSuratJalanForm({...suratJalanForm, pengemudi: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Pengurus Barang (Penyerah)</label>
                            <select className={`w-full p-4 rounded-xl border outline-none font-bold text-sm focus:border-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50'}`} value={suratJalanForm.pengurusId} onChange={e => setSuratJalanForm({...suratJalanForm, pengurusId: e.target.value})}>
                                <option value="">-- Pilih Pengurus --</option>
                                {pengurusOptions.map(p => <option key={p.nip} value={p.nip}>{p.nama}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tujuan Perjalanan</label>
                            <input type="text" placeholder="Contoh: Kunjungan Dinas ke Kab. Malang" className={`w-full p-4 rounded-xl border outline-none font-bold text-sm focus:border-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50'}`} value={suratJalanForm.tujuan} onChange={e => setSuratJalanForm({...suratJalanForm, tujuan: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Waktu</label>
                                <select className={`w-full p-4 rounded-xl border outline-none font-bold text-sm focus:border-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50'}`} value={suratJalanForm.waktu} onChange={e => setSuratJalanForm({...suratJalanForm, waktu: e.target.value})}>
                                    <option value="1 Hari">1 Hari</option>
                                    <option value="2 Hari">2 Hari</option>
                                    <option value="3 Hari">3 Hari</option>
                                    <option value="Lebih dari 3 Hari">Lebih dari 3 Hari</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tgl Berangkat</label>
                                <input type="date" className={`w-full p-4 rounded-xl border outline-none font-bold text-sm focus:border-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50'}`} value={suratJalanForm.tglBerangkat} onChange={e => setSuratJalanForm({...suratJalanForm, tglBerangkat: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    
                    <div className={`p-6 rounded-2xl border flex flex-col justify-center items-center text-center space-y-4 ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-blue-50 border-blue-100'}`}>
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center dark:bg-blue-900/50 dark:text-blue-400">
                            <FileSignature size={32} />
                        </div>
                        <div>
                            <h4 className="font-black text-lg text-blue-800 dark:text-blue-300">Cetak Surat Tugas</h4>
                            <p className="text-xs text-slate-500 mt-2 max-w-sm">Dokumen akan otomatis memuat tanda tangan mengetahui dari <b>Kasubbag Umum & Kepegawaian</b> dan penyerahan oleh <b>Pengurus Barang</b>.</p>
                        </div>
                        <button onClick={handleExportSuratJalan} disabled={!suratJalanForm.kendaraanId || !suratJalanForm.pengemudi || !suratJalanForm.tujuan || !suratJalanForm.pengurusId} className="w-full mt-4 py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg">
                            <Printer size={20}/> Download Surat Tugas (Word)
                        </button>
                    </div>
                </div>
                {suratJalanHistory.length > 0 && (
                    <div className="p-6 md:p-8 border-t dark:border-slate-700">
                        <h4 className="font-bold text-sm text-slate-500 mb-4">Riwayat Pemakaian Kendaraan Ini</h4>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs text-slate-400 border-b dark:border-slate-700">
                                    <tr>
                                        <th className="pb-2">Tanggal</th>
                                        <th className="pb-2">Pengemudi</th>
                                        <th className="pb-2">Tujuan</th>
                                        <th className="pb-2">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-slate-700">
                                    {suratJalanHistory.map((h, i) => (
                                        <tr key={i}>
                                            <td className="py-2">{h.tglBerangkat}</td>
                                            <td className="py-2 font-bold">{h.receiverName}</td>
                                            <td className="py-2">{h.tujuan}</td>
                                            <td className="py-2">{h.waktu}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
             </div>
  );
};

export default SuratKendaraanView;
