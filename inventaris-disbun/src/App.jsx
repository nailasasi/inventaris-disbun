/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Package, User, MapPin, Briefcase, Menu,
  Calendar, Info, AlertCircle, Printer, Car, CheckSquare,
  Upload, FileText, CheckCircle2, X, Loader2, QrCode,
  FileDown, FileSignature, Building2, Save, FileType, Database,
  Trash2, ArrowRightLeft, Move, History as HistoryIcon, Clock, ChevronLeft, Home,
  FileCheck, CloudUpload, ClipboardCheck, PlusCircle, ShoppingCart,
  Globe, LayoutDashboard, Users, BarChart3, Star, MessageSquare, Send,
  Zap, ArrowRight, Check, ShieldCheck, DollarSign, TrendingDown, CalendarDays,
  Lock, LogIn, KeyRound, AlertTriangle, Download, Camera, FilePlus, RotateCcw, Link, Edit3, Map as MapIcon, PlaySquare, Image as ImageIcon,
  Leaf, Settings, Sun, Moon, Edit, FileBadge, Building, FileKey, ListTree, Unplug
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, writeBatch, updateDoc, arrayRemove, arrayUnion, serverTimestamp, addDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// =========================================================================
// KONFIGURASI ADAPTIF & UTILITIES
// =========================================================================

const MANUAL_CONFIG = {
  apiKey: "AIzaSyCSWisYU_yau2S-Ktm1We_FBo1jx-GInmM",
  authDomain: "disbuninven.firebaseapp.com",
  projectId: "disbuninven",
  storageBucket: "disbuninven.firebasestorage.app",
  messagingSenderId: "751597078296",
  appId: "1:751597078296:web:f128fb8b302e175a6a806d"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : MANUAL_CONFIG;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'production-v1';

const UNIT_CODES = {
    PUSAT: '020301.00000',
    P2BTP: '020301.00001',
    PSBP: '020301.00002'
};

const UNIT_LABELS = {
    [UNIT_CODES.PUSAT]: 'Dinas Perkebunan Pusat',
    [UNIT_CODES.P2BTP]: 'UPT P2BTP',
    [UNIT_CODES.PSBP]: 'UPT PSBP'
};

const safeString = (v) => (v === undefined || v === null || v === 'undefined') ? '' : String(v);

const ROOM_LIST = [
  "Ruang Kerja Kepala Dinas", "Ruang Rapat Kepala Dinas", "Ruang Receptionist Kepala Dinas",
  "Ruang Kerja Sekretaris Dinas", "Ruang Rapat lantai 1/ ruang rapat kakao", "Ruang Sub Bagian Umum",
  "Ruang Penyusunan Program Anggaran", "Ruang Bagian Keuangan", "Ruang Record Center",
  "Ruang Aset", "Ruang Perpustakaan", "Ruang Transit Dharmawanita Dinas Perkebunan",
  "Ruang Rapat APBN", "Ruang Rapat lantai 3/ Ruang Rapat Tebu",
  "Ruang Kepala Bidang 1 (Bidang Produksi dan Pemasaran Hasil)", "Ruang Bidang 1 (Bidang Produksi dan Pemasaran Hasil)", "Ruang Rapat Bidang 1 (Bidang Produksi dan Pemasaran Hasil)",
  "Ruang Kepala Bidang 2 (Bidang Perlindungan)", "Ruang Bidang 2 (Bidang Perlindungan)", "Ruang Rapat Bidang 2 (Bidang Perlindungan)",
  "Ruang Kepala Bidang 3 (Bidang Tanaman Semusim)", "Ruang Bidang 3 (Bidang Tanaman Semusim)", "Ruang Rapat Bidang 3 (Bidang Proteksi Tanaman Tahunan)",
  "Ruang Kepala Bidang 4 (Bidang Proteksi Tanaman Tahunan)", "Ruang Bidang 4 (Bidang Proteksi Tanaman Tahunan)", "Ruang Rapat Bidang 4 (Bidang Proteksi Tanaman Tahunan)"
];

const ALL_BIDANG_RKBMD = [
  "Bidang Produksi dan Pemasaran Hasil (PPH)", 
  "Bidang Perlindungan", 
  "Bidang Tanaman Semusim", 
  "Bidang Proteksi Tanaman Tahunan", 
  "Sekretariat",
  "UPT P2BTP",
  "UPT PSBP"
];

const JENIS_USULAN_RKBMD = ["Usulan RKBMD Pengadaan", "Usulan RKBMD Pemindahtanganan", "Usulan RKBMD Pemeliharaan"];

const BIDANG_PUSAT_LIST = [
  "Sekretariat",
  "Bidang Perlindungan Perkebunan",
  "Bidang Pengolahan dan Pemasaran Hasil",
  "Bidang Produksi Tanaman Semusim",
  "Bidang Proteksi Tanaman Tahunan"
];

const DEFAULT_MASA_MANFAAT = [
  { kode: '1.3.2.01', nama: 'Alat Besar Darat', masa_manfaat: 10 },
  { kode: '1.3.2.02', nama: 'Alat Besar Apung', masa_manfaat: 8 },
  { kode: '1.3.2.03', nama: 'Alat Bantu', masa_manfaat: 7 },
  { kode: '1.3.2.04', nama: 'Kendaraan Bermotor Penumpang', masa_manfaat: 7 },
  { kode: '1.3.2.05', nama: 'Kendaraan Bermotor Angkutan', masa_manfaat: 7 },
  { kode: '1.3.2.06', nama: 'Peralatan Bengkel', masa_manfaat: 5 },
  { kode: '1.3.2.07', nama: 'Alat Ukur', masa_manfaat: 5 },
  { kode: '1.3.2.08', nama: 'Alat Pertanian', masa_manfaat: 5 },
  { kode: '1.3.2.09', nama: 'Peralatan Kantor', masa_manfaat: 5 },
  { kode: '1.3.2.10', nama: 'Perlengkapan Kantor', masa_manfaat: 5 },
  { kode: '1.3.2.11', nama: 'Komputer', masa_manfaat: 4 },
  { kode: '1.3.2.12', nama: 'Meja / Kursi / Mebeulair', masa_manfaat: 5 },
  { kode: '1.3.2.13', nama: 'Peralatan Dapur', masa_manfaat: 4 },
  { kode: '1.3.2.14', nama: 'Penghias Ruangan', masa_manfaat: 5 },
  { kode: '1.3.2.16', nama: 'Alat Fotografi', masa_manfaat: 5 },
  { kode: '1.3.3.01', nama: 'Bangunan Gedung', masa_manfaat: 50 },
  { kode: '1.3.3.02', nama: 'Monumen', masa_manfaat: 50 },
  { kode: '1.3.4.01', nama: 'Jalan dan Jembatan', masa_manfaat: 10 },
  { kode: '1.3.5', nama: 'Aset Tetap Lainnya', masa_manfaat: 4 },
];

const loadScripts = async () => {
  const load = (id, src) => new Promise((res, rej) => {
    if (document.getElementById(id)) return res();
    const s = document.createElement('script'); s.id = id; s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  try {
    await load('xlsx', "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
    await load('saver', "https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js");
  } catch (e) {
      console.error("Error loading external scripts", e);
  }
};

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);

const parseDateRobust = (dStr) => {
  if (!dStr) return null;
  if (typeof dStr.toDate === 'function') return dStr.toDate();
  const str = safeString(dStr).trim();
  if (/^\d+$/.test(str)) {
      const num = parseInt(str, 10);
      if (num > 20000 && num < 100000) return new Date(new Date(Date.UTC(1899, 11, 30)).getTime() + num * 86400000);
      else if (num >= 1900 && num <= 2100) return new Date(`${num}-01-01T00:00:00`);
      else if (num > 100000000000) return new Date(num);
  }
  if (str.includes('/')) {
    const p = str.split('/');
    if (p.length === 3) return new Date(`${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}T00:00:00`); 
  }
  const d = new Date(str); return isNaN(d.getTime()) ? null : d;
};

const parseKodeBarangData = (fullStr, kodeBarangDataList) => {
    if (!fullStr) return { kode: '', masa_manfaat: 4, nama: '' };
    let targetKode = String(fullStr).trim();
    
    if (targetKode.includes('-')) {
        targetKode = targetKode.split('-')[1].trim();
    }

    if (kodeBarangDataList && kodeBarangDataList.length > 0) {
        const matched = kodeBarangDataList.find(kb => targetKode.startsWith(kb.kode));
        if (matched) return { kode: matched.kode, masa_manfaat: parseInt(matched.masa_manfaat) || 4, nama: matched.nama };
    }
    
    const defaultMatched = DEFAULT_MASA_MANFAAT.find(kb => targetKode.startsWith(kb.kode));
    if (defaultMatched) return { kode: defaultMatched.kode, masa_manfaat: parseInt(defaultMatched.masa_manfaat) || 4, nama: defaultMatched.nama };

    return { kode: targetKode, masa_manfaat: 4, nama: '' };
};

const calculateNilaiBuku = (nilaiPerolehan, tglPengadaanStr, masaManfaat = 4) => {
    const perolehan = parseFloat(nilaiPerolehan) || 0;
    if (perolehan === 0) return 0;
    
    const tglPengadaan = parseDateRobust(tglPengadaanStr) || new Date();
    const tahunPengadaan = tglPengadaan.getFullYear();
    const tahunSekarang = new Date().getFullYear();
    
    let selisihTahun = tahunSekarang - tahunPengadaan;
    if (selisihTahun < 0) selisihTahun = 0; 
    
    if (selisihTahun >= masaManfaat) return 0;
    
    const persentasePenyusutan = 1 / masaManfaat; 
    const penyusutanTotal = perolehan * persentasePenyusutan * selisihTahun;
    const nilaiBuku = perolehan - penyusutanTotal;
    
    return Math.max(0, Math.round(nilaiBuku));
};

const formatDisplayDate = (dStr) => { const d = parseDateRobust(dStr); return d ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(d) : '-'; };
const getSafeDateString = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') return dateVal;
  if (typeof dateVal.toDate === 'function') { try { return dateVal.toDate().toISOString(); } catch(e) { return ''; } }
  if (dateVal instanceof Date) { try { return dateVal.toISOString(); } catch(e) { return ''; } }
  return safeString(dateVal);
};

const exportLabelWord = (item, locationStr = '', priceData = {}, templates = {}, pegawaiData = []) => {
    let finalNoKartu = safeString(item.no_kartu); 
    let finalMerk = safeString(item.merk);
    
    let matchedItem = Object.values(priceData || {}).find(x => safeString(x.no_kartu) === finalNoKartu && finalNoKartu !== '-') || Object.values(priceData || {}).find(x => safeString(x.nama).toLowerCase() === safeString(item.nama).toLowerCase() && safeString(x.no_kartu) !== '');
    if (!finalNoKartu || finalNoKartu === '-') if (matchedItem) finalNoKartu = matchedItem.no_kartu;
    if (!finalMerk || finalMerk === '-' || finalMerk.toLowerCase() === 'n/a') finalMerk = (matchedItem && matchedItem.merk) ? matchedItem.merk : '-';
    
    const finalTahun = safeString(item.tahun) || safeString(item.tgl_pengadaan) || (matchedItem ? safeString(matchedItem.tgl_pengadaan) : '-');
    const safeIdForPrint = finalNoKartu ? finalNoKartu.replace(/[^a-zA-Z0-9.-]/g, '_') : 'Generated';
    
    let namaSkpd = safeString(item.skpd || ''); 
    if (!namaSkpd || namaSkpd === '-') {
        if (locationStr) {
            const holder = (pegawaiData||[]).find(p => safeString(p.nama).toLowerCase() === safeString(locationStr).toLowerCase());
            if (holder && holder.skpd && holder.skpd !== '-') namaSkpd = holder.skpd; 
            else if (holder && holder.bidang && holder.bidang !== '-') namaSkpd = holder.bidang; 
            else namaSkpd = '-';
        } else namaSkpd = '-';
    }

    const namaDinas = "DINAS PERKEBUNAN PROV. JATIM";

    let htmlContent = templates.label ? templates.label
        .replace(/\{\{NAMA_BARANG\}\}/g, safeString(item.nama) || 'N/A')
        .replace(/\{\{MERK\}\}/g, finalMerk)
        .replace(/\{\{NO_KARTU\}\}/g, finalNoKartu || '-')
        .replace(/\{\{TAHUN\}\}/g, finalTahun)
        .replace(/\{\{SISTEM_ID\}\}/g, safeIdForPrint)
        .replace(/\{\{LOKASI\}\}/g, safeString(locationStr) || '-')
        .replace(/\{\{NAMA_DINAS\}\}/g, namaDinas)
        .replace(/\{\{NAMA_SKPD\}\}/g, namaSkpd)
        : `
        <table style="width: 320px; border-collapse: collapse; border: 2px solid #047857; font-family: 'Arial', sans-serif;">
            <tr><td style="background-color: #047857; color: white; text-align: center; font-weight: bold; font-size: 14px; padding: 6px;">${namaDinas}</td></tr>
            <tr><td style="background-color: #047857; color: white; text-align: center; font-size: 10px; padding-bottom: 6px; border-bottom: 1px solid #047857;">${namaSkpd}</td></tr>
            <tr><td style="padding: 10px;"><table style="width: 100%; border-collapse: collapse; font-size: 12px; line-height: 1.5;">
                <tr><td style="width: 80px; font-weight: bold;">No. Kartu</td><td style="width: 10px;">:</td><td style="font-weight: bold;">${finalNoKartu || '-'}</td></tr>
                <tr><td style="font-weight: bold;">Nama Barang</td><td>:</td><td style="font-weight: bold;">${safeString(item.nama) || 'N/A'}</td></tr>
                <tr><td style="font-weight: bold; color: #555;">Merk / Tipe</td><td>:</td><td style="color: #555;">${finalMerk}</td></tr>
                <tr><td style="font-weight: bold;">Tahun</td><td>:</td><td>${finalTahun}</td></tr>
                <tr><td style="font-weight: bold; padding-top: 5px;">Lokasi/User</td><td style="padding-top: 5px;">:</td><td style="padding-top: 5px;">${safeString(locationStr) || '-'}</td></tr>
            </table></td></tr>
        </table><br/>`;

    let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body>${htmlContent}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    if (window.saveAs) window.saveAs(blob, `Label_Aset_${safeIdForPrint}.doc`); 
    else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Label_Aset_${safeIdForPrint}.doc`; a.click(); }
};

// =========================================================================
// ISOLATED MODAL COMPONENTS
// =========================================================================

const ModalFeedback = ({ onClose, onSave }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] w-full max-w-md shadow-2xl">
                <h3 className="font-black text-xl mb-4 dark:text-white">Beri Masukan Aplikasi</h3>
                <div className="flex gap-2 mb-6 justify-center">
                    {[1, 2, 3, 4, 5].map(r => (
                        <Star key={r} size={32} onClick={() => setRating(r)} className={`cursor-pointer transition-colors ${rating >= r ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`} />
                    ))}
                </div>
                <textarea className="w-full p-4 border dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl mb-4 outline-none font-medium dark:text-white" rows="4" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Tulis komentar atau kendala Anda di sini..."></textarea>
                <button onClick={() => onSave(rating, comment)} disabled={!comment} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-emerald-700">Kirim Masukan</button>
                <button onClick={onClose} className="w-full py-4 mt-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">Batal</button>
            </div>
        </div>
    )
}

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

const ModalLinkAset = ({ onClose, onSave, item, data, ruanganData, statusLoading }) => {
    const [linkType, setLinkType] = useState('pegawai');
    const [targetValue, setTargetValue] = useState('');
    const [updateMaster, setUpdateMaster] = useState(false);

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
                <h3 className="font-black text-xl mb-6 dark:text-white flex items-center gap-2"><Link className="text-emerald-500"/> Hubungkan Aset</h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl mb-6 border border-emerald-100 dark:border-emerald-800">
                    <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100">{safeString(item?.nama)}</p>
                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">{safeString(item?.no_kartu)}</p>
                </div>
                <div className="space-y-4">
                    <select value={linkType} onChange={e=>{setLinkType(e.target.value); setTargetValue('');}} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none">
                        <option value="pegawai">Assign ke Pegawai</option>
                        <option value="ruangan">Assign ke Ruangan</option>
                        <option value="manual">Ketik Lokasi Manual</option>
                    </select>
                    
                    {linkType === 'pegawai' && (
                        <select value={targetValue} onChange={e=>setTargetValue(e.target.value)} className="w-full p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none">
                            <option value="">-- Pilih Pegawai --</option>
                            {data.map(p=><option key={p.nip} value={p.nip}>{p.nama}</option>)}
                        </select>
                    )}
                    {linkType === 'ruangan' && (
                        <select value={targetValue} onChange={e=>setTargetValue(e.target.value)} className="w-full p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none">
                            <option value="">-- Pilih Ruangan --</option>
                            {ruanganData.map(r=><option key={r.nama_ruangan} value={r.nama_ruangan}>{r.nama_ruangan}</option>)}
                        </select>
                    )}
                    {linkType === 'manual' && (
                        <input type="text" value={targetValue} onChange={e=>setTargetValue(e.target.value)} placeholder="Ketik Lokasi Bebas (Tanpa Master)" className="w-full p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none"/>
                    )}
                    
                    {linkType !== 'manual' && (
                        <label className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 cursor-pointer">
                            <input type="checkbox" checked={updateMaster} onChange={e=>setUpdateMaster(e.target.checked)} className="w-5 h-5 accent-blue-600"/>
                            <span className="text-sm font-bold text-blue-900 dark:text-blue-200">Suntikkan aset ke daftar master tujuan?</span>
                        </label>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                        <button onClick={onClose} className="w-1/3 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Batal</button>
                        <button onClick={()=>onSave(linkType, targetValue, updateMaster)} disabled={statusLoading || !targetValue} className="w-2/3 py-4 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 flex justify-center shadow-lg">{statusLoading ? <Loader2 className="animate-spin" size={20}/> : 'Simpan Koneksi'}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

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

const ModalAddAsset = ({ onClose, onSave, priceData, pegawaiData, ruanganData, kodeBarangDataList }) => {
    const [form, setForm] = useState({ nama: '', merk: '', tgl_pengadaan: new Date().toISOString().split('T')[0], no_kartu: '', nilai_perolehan: '' });
    const [search, setSearch] = useState('');
    const [saveToMaster, setSaveToMaster] = useState(true); 
    
    const assignedKards = useMemo(() => { 
        const set = new Set(); 
        (ruanganData || []).forEach(r => (r.items || []).forEach(it => { if(it.no_kartu && it.no_kartu !== '-') set.add(it.no_kartu.toLowerCase()); })); 
        (pegawaiData || []).forEach(p => (p.items || []).forEach(it => { if(it.no_kartu && it.no_kartu !== '-') set.add(it.no_kartu.toLowerCase()); })); 
        return set; 
    }, [ruanganData, pegawaiData]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
               <h3 className="text-xl md:text-2xl font-black mb-6 dark:text-white">Tambah Aset Pegawai</h3>
               <div className="space-y-4">
                  <div className="relative mb-6">
                    <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase ml-2 mb-2 block">Cari Master Data (Yang Belum Ter-assign)</label>
                    <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Ketik Nomor Kartu / Nama Barang..." className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-emerald-500 text-sm font-bold text-slate-900 dark:text-white" value={search} onChange={e => setSearch(e.target.value)} /></div>
                    {search.length > 1 && (
                      <div className="absolute w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden max-h-48 overflow-y-auto z-50">
                        {Object.values(priceData || {})
                            .filter(p => safeString(p.nama).toLowerCase().includes(search.toLowerCase()) || safeString(p.no_kartu).toLowerCase().includes(search.toLowerCase()))
                            .filter(p => !assignedKards.has(safeString(p.no_kartu).toLowerCase()))
                            .slice(0, 50).map((p, idx) => {
                            
                            let tglString = new Date().toISOString().split('T')[0];
                            if(p.tgl_pengadaan) {
                                const pd = parseDateRobust(getSafeDateString(p.tgl_pengadaan));
                                if(pd && !isNaN(pd)) tglString = pd.toISOString().split('T')[0];
                            }
                            
                            return (
                            <button key={idx} type="button" onClick={() => { 
                                setForm({...form, nama: safeString(p.nama), no_kartu: safeString(p.no_kartu), tgl_pengadaan: tglString, nilai_perolehan: safeString(p.nilai_perolehan)}); 
                                setSearch(''); 
                                setSaveToMaster(true); 
                            }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-slate-700 border-b border-slate-50 dark:border-slate-700 transition-colors">
                              <p className="font-bold text-slate-800 dark:text-white text-xs uppercase leading-tight mb-1">{safeString(p.nama)}</p><p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">No. Kartu: {safeString(p.no_kartu) || '-'}</p>
                            </button>
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
                  <div>
                      <label className="text-[10px] font-bold text-slate-500 ml-2">No Kartu (Format Lengkap untuk menghitung Umur Otomatis)</label>
                      <input type="text" placeholder="Contoh: 11.01.35...-1.3.2..." className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-emerald-500 text-slate-900 dark:text-white mt-1" value={form.no_kartu} onChange={e=>setForm({...form, no_kartu:e.target.value})}/>
                  </div>
                  <input type="number" placeholder="Nilai Perolehan (Rp)" className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-emerald-500 text-slate-900 dark:text-white" value={form.nilai_perolehan} onChange={e=>setForm({...form, nilai_perolehan:e.target.value})}/>
                  
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl mt-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" checked={saveToMaster} onChange={e => setSaveToMaster(e.target.checked)} className="w-5 h-5 accent-indigo-600 mt-0.5 shrink-0" />
                          <div className="flex flex-col">
                              <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Simpan ke Daftar Monitoring Aset?</span>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-300 mt-1 leading-tight">Jika <b>TIDAK</b> dicentang, barang ini hanya akan menjadi catatan lokal (Inventaris Pegawai) dan tidak masuk ke Master Data Monitoring.</span>
                          </div>
                      </label>
                  </div>

                  <button onClick={() => onSave({...form, saveToMaster})} disabled={!form.nama} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50">Simpan & Cetak Label</button>
                  <button onClick={onClose} className="w-full py-3 text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl">Batal</button>
               </div>
            </div>
         </div>
    );
};

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

const ModalManualDisposal = ({ onClose, onSave, activeAssets, statusLoading }) => {
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [alasan, setAlasan] = useState('');
    const filtered = (activeAssets || []).filter(p => safeString(p.nama).toLowerCase().includes(search.toLowerCase()) || safeString(p.no_kartu).toLowerCase().includes(search.toLowerCase())).slice(0, 20);

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] w-full max-w-lg shadow-2xl">
                <h3 className="text-xl font-black mb-6 dark:text-white flex items-center gap-2"><Trash2 className="text-red-500"/> Input Usulan Hapus Baru</h3>
                {!selectedItem ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase ml-2 mb-2 block">Tarik Data dari Monitoring Aset</label>
                            <Search className="absolute left-4 top-1/2 mt-3 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Cari nama aset atau no kartu..." className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-red-500 text-sm font-bold text-slate-900 dark:text-white" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="max-h-60 overflow-y-auto border dark:border-slate-700 rounded-xl custom-scrollbar">
                            {filtered.map((item, idx) => (
                                <button key={idx} onClick={() => setSelectedItem(item)} className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 border-b border-slate-50 dark:border-slate-700 transition-colors"><p className="font-bold text-slate-800 dark:text-white text-xs uppercase leading-tight mb-1">{safeString(item.nama)}</p><p className="text-[10px] font-mono font-bold text-slate-500">No: {safeString(item.no_kartu) || '-'} • Lokasi: {item.pemegang !== '-' ? item.pemegang : (item.ruangan !== '-' ? item.ruangan : item.lokasi)}</p></button>
                            ))}
                            {search && filtered.length === 0 && <p className="p-4 text-center text-xs text-slate-500 font-bold">Aset tidak ditemukan</p>}
                        </div>
                        <button onClick={onClose} className="w-full py-3 text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl mt-4">Batal</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-100 dark:border-red-800 mb-6"><p className="text-xs text-red-500 font-bold mb-1">Aset Terpilih:</p><p className="font-bold text-red-900 dark:text-red-100 text-sm">{safeString(selectedItem.nama)}</p><p className="text-xs text-red-600 dark:text-red-300 font-mono mt-1">No: {safeString(selectedItem.no_kartu) || '-'}</p></div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Alasan Penghapusan</label>
                            <textarea placeholder="Contoh: Rusak berat / Hilang / Dilelang" className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border dark:border-slate-700 focus:border-red-500 text-sm font-medium text-slate-900 dark:text-white" rows="3" value={alasan} onChange={(e)=>setAlasan(e.target.value)}></textarea>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <button onClick={() => setSelectedItem(null)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">Pilih Ulang</button>
                            <button onClick={() => onSave(selectedItem, alasan)} disabled={statusLoading || !alasan} className="flex-1 py-3 bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 rounded-xl flex justify-center gap-2">{statusLoading ? <Loader2 className="animate-spin" size={20}/> : 'Pindahkan ke Usulan'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// =========================================================================
// MAIN APP COMPONENT
// =========================================================================

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [userRole, setUserRole] = useState(''); 
  const [user, setUser] = useState(null);
  const [userUnit, setUserUnit] = useState(UNIT_CODES.PUSAT);
  const [activeUnitView, setActiveUnitView] = useState(UNIT_CODES.PUSAT);

  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [data, setData] = useState([]);
  const [ruanganData, setRuanganData] = useState([]);
  const [priceData, setPriceData] = useState({});
  const [kodeBarangData, setKodeBarangData] = useState([]); 

  const [rkbmdData, setRkbmdData] = useState([]); 
  const [tanahData, setTanahData] = useState([]); 
  const [historyData, setHistoryData] = useState([]);
  const [mutasiPendingData, setMutasiPendingData] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [templates, setTemplates] = useState({ sppbi: '', kir: '', label: '' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoomName, setSelectedRoomName] = useState(ROOM_LIST[0]);
  const [newRoomName, setNewRoomName] = useState('');
  const [monitoringSearch, setMonitoringSearch] = useState('');
  const [tanahSearch, setTanahSearch] = useState('');
  const [monitoringSelectedYear, setMonitoringSelectedYear] = useState('Semua');
  
  const [modals, setModals] = useState({ upload: false, transfer: false, transferUnit: false, addItem: false, addRoomItem: false, rkbmd: false, exportLetter: false, templateInfo: false, manualDisposal: false, manualLabel: false, feedback: false, bulkLabel: false });
  const [linkAsetModal, setLinkAsetModal] = useState({ show: false, item: null });
  const [editNilaiModal, setEditNilaiModal] = useState({ show: false, item: null });
  const [editPajakModal, setEditPajakModal] = useState({ show: false, item: null });
  const [transferUnitModal, setTransferUnitModal] = useState({ show: false, item: null, sourceRef: null, sourceType: '' });

  const [status, setStatus] = useState({ loading: false, synced: false, progress: 0, uploadType: 'prices', uploadAppend: true });
  const [selectedYear, setSelectedYear] = useState('Semua'); 
  const [pajakSelectedYear, setPajakSelectedYear] = useState(new Date().getFullYear().toString());
  const [pbbSelectedYear, setPbbSelectedYear] = useState(new Date().getFullYear().toString());
  const [pajakYearsList, setPajakYearsList] = useState(['2025','2026','2027','2028','2029','2030']);
  const [pbbYearsList, setPbbYearsList] = useState(['2025','2026','2027','2028','2029','2030']);

  const [rkbmdSelectedYear, setRkbmdSelectedYear] = useState('Semua');
  const [rkbmdSelectedJenis, setRkbmdSelectedJenis] = useState('Semua');
  const [rkbmdArsip, setRkbmdArsip] = useState({});

  const [transferItem, setTransferItem] = useState(null);
  const [photoModal, setPhotoModal] = useState({ show: false, item: null, preview: null, file: null, isSPPBI: false, isPajak: false, isPBB: false, isRkbmdArchive: false, pajakYear: '', pbbYear: '', rkbmdMeta: null, isPdf: false, isExcel: false, fileName: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', type: 'info', isAlert: false, onConfirm: null });
  const [editRoom, setEditRoom] = useState({ show: false, oldName: '', newName: '' });
  const [taxAlertShown, setTaxAlertShown] = useState(false);
  const [showDashboardAlert, setShowDashboardAlert] = useState(true);

  const [rkbmdFilters, setRkbmdFilters] = useState([]);
  const [editTanahModal, setEditTanahModal] = useState({ show: false, item: null });
  const [mediaTanahModal, setMediaTanahModal] = useState({ show: false, item: null, file: null, preview: null, isVideo: false, uploading: false, progress: 0, viewOnlyUrl: '', viewOnlyType: '' });
  const [rkbmdTemplateHeaders, setRkbmdTemplateHeaders] = useState([]);

  const [suratJalanForm, setSuratJalanForm] = useState({ kendaraanId: '', pengemudi: '', tujuan: '', waktu: '1 Hari', tglBerangkat: new Date().toISOString().split('T')[0], pengurusId: '' });

  const isReadOnly = userRole !== 'admin' && userRole !== 'admin_upt';
  const canEditRkbmd = ['admin', 'admin_upt', 'pph', 'perlinbun', 'semusim', 'tahunan'].includes(userRole);
  
  const filteredRuanganData = useMemo(() => ruanganData.filter(r => (r.unitId || UNIT_CODES.PUSAT) === activeUnitView), [ruanganData, activeUnitView]);
  
  const filteredPegawaiData = useMemo(() => {
      return (data || []).filter(p => {
          const str = JSON.stringify(p).toUpperCase();
          const matchP2BTP = str.includes('UPT PENGEMBANGAN DAN PRODUKSI BENIH TANAMAN PERKEBUNAN') || str.includes('P2BTP');
          const matchPSBP = str.includes('UPT PENGAWASAN DAN SERTIFIKASI BENIH PERKEBUNAN') || str.includes('PSBP');
          
          if (activeUnitView === UNIT_CODES.P2BTP) return matchP2BTP;
          if (activeUnitView === UNIT_CODES.PSBP) return matchPSBP;
          
          return !matchP2BTP && !matchPSBP;
      });
  }, [data, activeUnitView]);

  const filteredPriceData = useMemo(() => { const res = {}; Object.keys(priceData).forEach(k => { if ((priceData[k].unitId || UNIT_CODES.PUSAT) === activeUnitView) res[k] = priceData[k]; }); return res; }, [priceData, activeUnitView]);
  const filteredRkbmdData = useMemo(() => rkbmdData.filter(r => (r.unitId || UNIT_CODES.PUSAT) === activeUnitView), [rkbmdData, activeUnitView]);
  
  const filteredTanahDataForView = useMemo(() => tanahData, [tanahData]);
  const filteredHistoryData = useMemo(() => historyData.filter(h => (h.unitId || UNIT_CODES.PUSAT) === activeUnitView), [historyData, activeUnitView]);

  const baseRooms = activeUnitView === UNIT_CODES.PUSAT ? ROOM_LIST : [];
  const dynamicRooms = Array.from(new Set([...baseRooms, ...(filteredRuanganData || []).map(r => r.nama_ruangan)])).filter(Boolean);
  
  const isPegawaiEditable = useMemo(() => {
      if (!selectedUser) return false;
      if (userRole === 'admin') return true;
      if (userRole === 'admin_upt') {
          const str = JSON.stringify(selectedUser).toUpperCase();
          const matchP2BTP = str.includes('UPT PENGEMBANGAN DAN PRODUKSI BENIH TANAMAN PERKEBUNAN') || str.includes('P2BTP');
          const matchPSBP = str.includes('UPT PENGAWASAN DAN SERTIFIKASI BENIH PERKEBUNAN') || str.includes('PSBP');
          
          if (userUnit === UNIT_CODES.P2BTP && matchP2BTP) return true;
          if (userUnit === UNIT_CODES.PSBP && matchPSBP) return true;
          return false;
      }
      return false;
  }, [selectedUser, userRole, userUnit]);

  const allowedBidangList = (userRole === 'admin') ? ALL_BIDANG_RKBMD 
        : (userRole === 'admin_upt' && userUnit === UNIT_CODES.P2BTP) ? [UNIT_LABELS[UNIT_CODES.P2BTP]]
        : (userRole === 'admin_upt' && userUnit === UNIT_CODES.PSBP) ? [UNIT_LABELS[UNIT_CODES.PSBP]]
        : userRole === 'pph' ? ["Bidang Produksi dan Pemasaran Hasil (PPH)"] 
        : userRole === 'perlinbun' ? ["Bidang Perlindungan"] 
        : userRole === 'semusim' ? ["Bidang Tanaman Semusim"] 
        : userRole === 'tahunan' ? ["Bidang Proteksi Tanaman Tahunan"] 
        : [ALL_BIDANG_RKBMD[0]];

  const visibleRkbmdData = (filteredRkbmdData || []).filter(r => {
      if (userRole === 'admin' || userRole === 'admin_upt') return true;
      if (userRole === 'pph') return r.bidang === "Bidang Produksi dan Pemasaran Hasil (PPH)";
      if (userRole === 'perlinbun') return r.bidang === "Bidang Perlindungan";
      if (userRole === 'semusim') return r.bidang === "Bidang Tanaman Semusim";
      if (userRole === 'tahunan') return r.bidang === "Bidang Proteksi Tanaman Tahunan";
      return false;
  });

  const displayedRkbmdData = visibleRkbmdData.filter(r => {
      const matchBidang = rkbmdFilters.length === 0 || rkbmdFilters.includes(r.bidang);
      const matchJenis = rkbmdSelectedJenis === 'Semua' || r.jenis_usulan === rkbmdSelectedJenis;
      const matchTahun = rkbmdSelectedYear === 'Semua' || safeString(r.tahun_usulan) === rkbmdSelectedYear;
      return matchBidang && matchJenis && matchTahun;
  });

  const customAlert = (title, message) => setConfirmModal({ show: true, title: safeString(title), message: safeString(message), type: 'info', isAlert: true });
  const customConfirm = (title, message, type, onConfirm) => setConfirmModal({ show: true, title: safeString(title), message: safeString(message), type: safeString(type), isAlert: false, onConfirm });
  
  const generateBAST = (item, sender, receiver) => {
      const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head><body>
      <h3 style="text-align:center">BERITA ACARA SERAH TERIMA BARANG (MUTASI INTERNAL)</h3>
      <p>Pada hari ini, tanggal ${new Date().toLocaleDateString('id-ID')}, telah diserahkan barang inventaris dengan rincian:</p>
      <ul>
          <li><b>Nama Barang:</b> ${safeString(item.nama)}</li>
          <li><b>No Kartu:</b> ${safeString(item.no_kartu)}</li>
      </ul>
      <p>Dari Pihak Pertama:</p>
      <p><b>Nama:</b> ${safeString(sender.nama)}<br/><b>NIP:</b> ${safeString(sender.nip)}</p>
      <p>Kepada Pihak Kedua:</p>
      <p><b>Nama:</b> ${safeString(receiver.nama)}<br/><b>NIP:</b> ${safeString(receiver.nip)}</p>
      <br><br>
      <table style="width:100%; border:none; text-align:center;">
        <tr>
          <td style="width:50%">Yang Menerima,<br><br><br><br><b>${safeString(receiver.nama)}</b></td>
          <td style="width:50%">Yang Menyerahkan,<br><br><br><br><b>${safeString(sender.nama)}</b></td>
        </tr>
      </table>
      </body></html>
      `;
      const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
      if (window.saveAs) window.saveAs(blob, `BAST_Internal_${safeString(item.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_')}.doc`);
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `BAST_Internal_${safeString(item.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_')}.doc`; a.click(); }
  };

  const generateBASTAntarUnit = (item, sourceUnit, targetUnit, senderPegawai) => {
      const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head><body>
      <h3 style="text-align:center">BERITA ACARA MUTASI BARANG ANTAR UNIT</h3>
      <p>Pada hari ini, tanggal ${new Date().toLocaleDateString('id-ID')}, diajukan mutasi aset antar unit untuk barang berikut:</p>
      <ul>
          <li><b>Nama Barang:</b> ${safeString(item.nama)}</li>
          <li><b>No Kartu:</b> ${safeString(item.no_kartu)}</li>
      </ul>
      <p><b>Dari Unit Asal:</b> ${UNIT_LABELS[sourceUnit]}</p>
      <p><b>Ke Unit Tujuan:</b> ${UNIT_LABELS[targetUnit]}</p>
      <p><b>Diajukan Oleh:</b> ${senderPegawai ? senderPegawai.nama : UNIT_LABELS[sourceUnit]}</p>
      <br><br>
      <p style="text-align:center">Dokumen ini merupakan bukti pengajuan mutasi dan menunggu verifikasi admin unit tujuan.</p>
      </body></html>
      `;
      const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
      if (window.saveAs) window.saveAs(blob, `BAST_AntarUnit_${safeString(item.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_')}.doc`);
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `BAST_AntarUnit_${safeString(item.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_')}.doc`; a.click(); }
  };

  const handleExportBulkLabel = (items, defaultLocation = 'Kumpulan Aset') => {
      if (!items || items.length === 0) return customAlert("Kosong", "Tidak ada aset untuk dicetak labelnya.");
      
      let rowsHtml = '';
      items.forEach((it, index) => {
          let pItem = Object.values(priceData || {}).find(x => safeString(x.no_kartu) === safeString(it.no_kartu) && safeString(it.no_kartu) !== '');
          if (!pItem) pItem = Object.values(priceData || {}).find(x => safeString(x.nama).toLowerCase() === safeString(it.nama).toLowerCase() && (safeString(x.lokasi).toLowerCase() === safeString(it.pemegang).toLowerCase() || safeString(x.lokasi).toLowerCase() === safeString(it.ruangan).toLowerCase()));
          
          let finalNoKartu = safeString(it.no_kartu); 
          let finalMerk = safeString(it.merk);
          if (!finalNoKartu || finalNoKartu === '-') if (pItem) finalNoKartu = pItem.no_kartu;
          if (!finalMerk || finalMerk === '-' || finalMerk.toLowerCase() === 'n/a') finalMerk = (pItem && pItem.merk) ? pItem.merk : '-';
          const finalTahun = safeString(it.tahun) || safeString(it.tgl_pengadaan) || (pItem ? safeString(pItem.tgl_pengadaan) : '-');
          
          let itemLoc = it.ruangan && it.ruangan !== '-' ? it.ruangan : (it.pemegang && it.pemegang !== '-' ? it.pemegang : defaultLocation);
          let namaSkpd = safeString(it.skpd || ''); 
          if (!namaSkpd || namaSkpd === '-') {
              const holder = (data||[]).find(p => safeString(p.nama).toLowerCase() === safeString(itemLoc).toLowerCase());
              if (holder && holder.skpd && holder.skpd !== '-') namaSkpd = holder.skpd; 
              else if (holder && holder.bidang && holder.bidang !== '-') namaSkpd = holder.bidang; 
              else namaSkpd = '-';
          }
          const namaDinas = "DINAS PERKEBUNAN PROV. JATIM";

          let labelContent = templates.label ? templates.label
              .replace(/\{\{NAMA_BARANG\}\}/g, safeString(it.nama) || 'N/A')
              .replace(/\{\{MERK\}\}/g, finalMerk)
              .replace(/\{\{NO_KARTU\}\}/g, finalNoKartu || '-')
              .replace(/\{\{TAHUN\}\}/g, finalTahun)
              .replace(/\{\{SISTEM_ID\}\}/g, finalNoKartu ? finalNoKartu.replace(/[^a-zA-Z0-9.-]/g, '_') : 'Generated')
              .replace(/\{\{LOKASI\}\}/g, safeString(itemLoc) || '-')
              .replace(/\{\{NAMA_DINAS\}\}/g, namaDinas)
              .replace(/\{\{NAMA_SKPD\}\}/g, namaSkpd)
              : `
              <table style="width: 320px; border-collapse: collapse; border: 2px solid #047857; font-family: 'Arial', sans-serif; margin-bottom: 10px;">
                  <tr><td style="background-color: #047857; color: white; text-align: center; font-weight: bold; font-size: 14px; padding: 6px;">${namaDinas}</td></tr>
                  <tr><td style="background-color: #047857; color: white; text-align: center; font-size: 10px; padding-bottom: 6px; border-bottom: 1px solid #047857;">${namaSkpd}</td></tr>
                  <tr><td style="padding: 10px;"><table style="width: 100%; border-collapse: collapse; font-size: 12px; line-height: 1.5;">
                      <tr><td style="width: 80px; font-weight: bold;">No. Kartu</td><td style="width: 10px;">:</td><td style="font-weight: bold;">${finalNoKartu || '-'}</td></tr>
                      <tr><td style="font-weight: bold;">Nama Barang</td><td>:</td><td style="font-weight: bold;">${safeString(it.nama) || 'N/A'}</td></tr>
                      <tr><td style="font-weight: bold; color: #555;">Merk / Tipe</td><td>:</td><td style="color: #555;">${finalMerk}</td></tr>
                      <tr><td style="font-weight: bold;">Tahun</td><td>:</td><td>${finalTahun}</td></tr>
                      <tr><td style="font-weight: bold; padding-top: 5px;">Lokasi/User</td><td style="padding-top: 5px;">:</td><td style="padding-top: 5px;">${safeString(itemLoc) || '-'}</td></tr>
                  </table></td></tr>
              </table>`;

          if (index % 2 === 0) rowsHtml += '<tr>';
          rowsHtml += `<td style="padding: 15px; vertical-align: top;">${labelContent}</td>`;
          if (index % 2 === 1 || index === items.length - 1) rowsHtml += '</tr>';
      });

      const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body><table style="width: 100%; border-collapse: collapse;">${rowsHtml}</table></body></html>`;
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      if (window.saveAs) window.saveAs(blob, `Label_Massal_${safeString(defaultLocation).replace(/[^a-zA-Z0-9.-]/g, '_')}.doc`); 
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Label_Massal_${safeString(defaultLocation).replace(/[^a-zA-Z0-9.-]/g, '_')}.doc`; a.click(); }
  };

  const monitoringDataFiltered = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const assetMap = {}; 
    Object.values(filteredPriceData || {}).forEach(item => {
       const cleanNo = safeString(item.no_kartu).trim().toLowerCase();
       const key = cleanNo || `price_${Math.random()}`;
       
       const { masa_manfaat } = parseKodeBarangData(item.no_kartu, kodeBarangData);
       let dynTglHabis = item.tgl_habis;
       const dPengadaan = parseDateRobust(item.tgl_pengadaan);
       if (dPengadaan) {
           const dh = new Date(dPengadaan);
           dh.setFullYear(dh.getFullYear() + masa_manfaat);
           dynTglHabis = dh.toISOString();
       }
       
       const expDate = parseDateRobust(dynTglHabis);
       let diff = 0, expired = false;
       if (expDate && !isNaN(expDate)) { expDate.setHours(0,0,0,0); diff = Math.ceil((expDate - today)/(86400000)); expired = diff <= 0; }
       
       let pemegang = '-', ruangan = '-';
       const loc = safeString(item.lokasi).trim();
       if (loc && loc !== '-' && loc !== 'N/A' && loc !== 'Manual') { if (dynamicRooms.includes(loc)) ruangan = loc; else pemegang = loc; }
       
       const liveNilaiBuku = item.manual_active ? item.nilai_buku : calculateNilaiBuku(item.nilai_perolehan, item.tgl_pengadaan, masa_manfaat);
       
       assetMap[key] = { ...item, nilai_buku: liveNilaiBuku, tgl_habis: dynTglHabis, diffDays: diff, isExpired: expired, pemegang, ruangan, skpd: '-' };
    });

    (filteredPegawaiData || []).forEach(p => {
       (p.items || []).forEach((it, idx) => {
           let cleanNo = safeString(it.no_kartu).trim().toLowerCase();
           const existsInAny = Object.values(priceData).find(x => x.no_kartu?.toLowerCase() === cleanNo);
           if (existsInAny) { if ((existsInAny.unitId || UNIT_CODES.PUSAT) !== activeUnitView) return; } 
           else { if (activeUnitView !== UNIT_CODES.PUSAT) return; }
           
           if (!cleanNo) {
               const matchedKey = Object.keys(assetMap).find(k => safeString(assetMap[k].nama).toLowerCase() === safeString(it.nama).trim().toLowerCase() && (safeString(assetMap[k].pemegang).toLowerCase() === safeString(p.nama).toLowerCase() || safeString(assetMap[k].lokasi).toLowerCase() === safeString(p.nama).toLowerCase()));
               if (matchedKey) cleanNo = matchedKey;
           }
           if (cleanNo && assetMap[cleanNo]) {
               assetMap[cleanNo].pemegang = p.nama;
               assetMap[cleanNo].skpd = p.skpd || p.bidang || '-';
           } else {
               const { masa_manfaat } = parseKodeBarangData(it.no_kartu, kodeBarangData);
               let dynTglHabis = null;
               const dPengadaan = parseDateRobust(it.tahun);
               if (dPengadaan) { const dHabis = new Date(dPengadaan); dHabis.setFullYear(dHabis.getFullYear() + masa_manfaat); dynTglHabis = dHabis.toISOString(); }
               
               const expDate = parseDateRobust(dynTglHabis);
               let diff = 0, expired = false;
               if (expDate && !isNaN(expDate)) { expDate.setHours(0,0,0,0); diff = Math.ceil((expDate - today)/(86400000)); expired = diff <= 0; }
               
               assetMap[cleanNo || `pegawai_${p.nip}_${idx}_${Math.random()}`] = { ...it, pemegang: p.nama, ruangan: '-', skpd: p.skpd || p.bidang || '-', tgl_pengadaan: it.tahun, tgl_habis: dynTglHabis, nilai_perolehan: 0, nilai_buku: 0, diffDays: diff, isExpired: expired, no_kartu: it.no_kartu || '-' };
           }
       });
    });
    (filteredRuanganData || []).forEach(r => {
       (r.items || []).forEach((it, idx) => {
           let cleanNo = safeString(it.no_kartu).trim().toLowerCase();
           if (!cleanNo) {
               const matchedKey = Object.keys(assetMap).find(k => safeString(assetMap[k].nama).toLowerCase() === safeString(it.nama).trim().toLowerCase() && (safeString(assetMap[k].ruangan).toLowerCase() === safeString(r.nama_ruangan).toLowerCase() || safeString(assetMap[k].lokasi).toLowerCase() === safeString(r.nama_ruangan).toLowerCase()));
               if (matchedKey) cleanNo = matchedKey;
           }
           if (cleanNo && assetMap[cleanNo]) {
               assetMap[cleanNo].ruangan = r.nama_ruangan;
           } else {
               const { masa_manfaat } = parseKodeBarangData(it.no_kartu, kodeBarangData);
               let dynTglHabis = null;
               const dPengadaan = parseDateRobust(it.tahun);
               if (dPengadaan) { const dHabis = new Date(dPengadaan); dHabis.setFullYear(dHabis.getFullYear() + masa_manfaat); dynTglHabis = dHabis.toISOString(); }
               
               const expDate = parseDateRobust(dynTglHabis);
               let diff = 0, expired = false;
               if (expDate && !isNaN(expDate)) { expDate.setHours(0,0,0,0); diff = Math.ceil((expDate - today)/(86400000)); expired = diff <= 0; }
               
               assetMap[cleanNo || `ruangan_${r.nama_ruangan}_${idx}_${Math.random()}`] = { ...it, pemegang: '-', ruangan: r.nama_ruangan, skpd: '-', tgl_pengadaan: it.tahun, tgl_habis: dynTglHabis, nilai_perolehan: 0, nilai_buku: 0, diffDays: diff, isExpired: expired, no_kartu: it.no_kartu || '-' };
           }
       });
    });
    return Object.values(assetMap).map(i => {
        const isManuallyDisposed = i.manual_disposal === true;
        const isNaturallyExpired = i.isExpired || i.nilai_buku <= 0;
        const active = isManuallyDisposed ? false : (i.manual_active ? true : !isNaturallyExpired);
        const _disposal = isManuallyDisposed ? true : (!active && isNaturallyExpired);
        return { ...i, _active: active, _disposal, isManuallyDisposed, isNaturallyExpired, alasan_hapus: i.alasan_hapus || '' };
    }).filter(i => {
       if (monitoringSelectedYear !== 'Semua') {
          const thn = parseDateRobust(getSafeDateString(i.tgl_pengadaan))?.getFullYear()?.toString() || safeString(i.tgl_pengadaan || i.tahun || '');
          if (thn && !thn.includes(monitoringSelectedYear)) return false;
       }
       if (monitoringSearch) return safeString(i.nama).toLowerCase().includes(monitoringSearch.toLowerCase()) || safeString(i.no_kartu).toLowerCase().includes(monitoringSearch.toLowerCase());
       return true;
    }).sort((a,b) => a.diffDays - b.diffDays);
  }, [filteredPriceData, priceData, filteredPegawaiData, filteredRuanganData, monitoringSelectedYear, monitoringSearch, dynamicRooms, activeUnitView, kodeBarangData]);

  const activeMonitoringData = monitoringDataFiltered.filter(x => !x._disposal || x.manual_active);
  const disposalData = monitoringDataFiltered.filter(x => x._disposal && !x.manual_active);
  const currentRoomData = filteredRuanganData.find(doc => doc.nama_ruangan === selectedRoomName) || { items: [] };
  const totalInventaris = (filteredPegawaiData || []).reduce((acc, p) => acc + (p.items?.length || 0), 0) + (filteredRuanganData || []).reduce((acc, r) => acc + (r.items?.length || 0), 0);
  
  const vehicleItems = monitoringDataFiltered.filter(i => {
      const n = safeString(i.nama).toLowerCase();
      const isVehicle = (n.includes('motor') || n.includes('mobil') || n.includes('kendaraan') || n.includes('truk') || n.includes('jeep') || n.includes('pick up')) && !n.includes('kursi roda') && !n.includes('roda dorong');
      return isVehicle || i.tgl_pajak;
  });
  const filteredTanahDataFinal = filteredTanahDataForView.filter(t => safeString(t.kib).toLowerCase().includes(tanahSearch.toLowerCase()) || safeString(t.deskripsi).toLowerCase().includes(tanahSearch.toLowerCase()) || safeString(t.alamat).toLowerCase().includes(tanahSearch.toLowerCase()));

  const statsAsetAktif = activeMonitoringData.filter(x => !x.manual_active).length;
  const statsReAktif = activeMonitoringData.filter(x => x.manual_active).length;
  const statsPenghapusan = disposalData.length;
  const totalStat = (statsAsetAktif + statsReAktif + statsPenghapusan) || 1;

  const pengurusOptions = useMemo(() => {
      const opts = (filteredPegawaiData || []).filter(p => {
          const n = safeString(p.nama).toLowerCase();
          return n.includes('sugeng riyanto') || n.includes('achmar adrian');
      });
      if (!opts.some(o => safeString(o.nama).toLowerCase().includes('sugeng'))) opts.push({ nama: 'SUGENG RIYANTO, S.E.', nip: '19740204 200701 1 008' });
      if (!opts.some(o => safeString(o.nama).toLowerCase().includes('achmar'))) opts.push({ nama: 'ACHMAR ADRIAN RAMADHAN, A.Md.M.', nip: '19980126 202012 1 003' });
      return opts;
  }, [filteredPegawaiData]);

  const suratJalanHistory = filteredHistoryData.filter(h => h.type === 'SURAT JALAN' && (!suratJalanForm.kendaraanId || h.no_kartu === suratJalanForm.kendaraanId));

  const availableVehicles = vehicleItems.filter(v => {
      const isBooked = filteredHistoryData.some(h => 
          h.type === 'SURAT JALAN' && 
          h.no_kartu === v.no_kartu && 
          (h.tglBerangkatRaw === suratJalanForm.tglBerangkat || h.tglBerangkat === new Date(suratJalanForm.tglBerangkat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }))
      );
      return !isBooked;
  });

  const todayBookings = filteredHistoryData.filter(h => {
      if (h.type !== 'SURAT JALAN') return false;
      if (!h.timestamp) return false;
      const diffHours = (new Date() - new Date(h.timestamp.seconds * 1000)) / (1000 * 60 * 60);
      return diffHours <= 24;
  });

  useEffect(() => {
      if (isLoggedIn && (userRole === 'admin' || userRole === 'admin_upt') && !taxAlertShown && Object.keys(filteredPriceData).length > 0) {
          const expiringTaxes = Object.values(filteredPriceData).filter(item => {
              const n = safeString(item.nama).toLowerCase();
              const isVehicle = (n.includes('motor') || n.includes('mobil') || n.includes('kendaraan') || n.includes('truk') || n.includes('jeep') || n.includes('pick up')) && !n.includes('kursi roda') && !n.includes('roda dorong');
              if (!isVehicle && !item.tgl_pajak) return false;
              const d = getSafeDateString(item.tgl_pajak) || getSafeDateString(item.tgl_pengadaan);
              if (!d) return false;
              const tMasa = parseDateRobust(d);
              if (!tMasa) return false;
              return Math.ceil((tMasa - new Date()) / 86400000) <= 30;
          });
          if (expiringTaxes.length > 0) customAlert("Peringatan Pajak Kendaraan", `Terdapat ${expiringTaxes.length} kendaraan dinas yang masa pajaknya akan habis di unit ini.`);
          setTaxAlertShown(true);
      }
  }, [isLoggedIn, userRole, filteredPriceData, taxAlertShown]);

  useEffect(() => {
    loadScripts(); 
    const initAuth = async () => { 
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token); 
        } else {
            await signInAnonymously(auth); 
        }
    }; 
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser); 
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubP = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'pegawai'), 
        s => { const t=[]; s.forEach(d=>t.push(d.data())); setData(t); setStatus(x=>({...x, synced: true})); if(selectedUser) setSelectedUser(t.find(p=>p.nip===selectedUser.nip)); },
        err => console.error("Error fetching pegawai:", err)
    );
    const unsubR = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'ruangan'), 
        s => { const t=[]; s.forEach(d=>t.push({id:d.id, ...d.data()})); setRuanganData(t); },
        err => console.error("Error fetching ruangan:", err)
    );
    const unsubPr = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'prices'), 
        s => { const t={}; s.forEach(d=>t[d.id]={id:d.id, ...d.data()}); setPriceData(t); },
        err => console.error("Error fetching prices:", err)
    );
    const unsubKB = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'kode_barang'), 
        s => { 
            const t=[]; 
            s.forEach(d=>t.push({id:d.id, ...d.data()})); 
            setKodeBarangData(t.sort((a,b) => b.kode.length - a.kode.length)); 
        },
        err => console.error("Error fetching kode_barang:", err)
    );
    const unsubH = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'histori'), 
        s => { const t=[]; s.forEach(d=>t.push({id:d.id, ...d.data()})); setHistoryData(t.sort((a,b)=>(b.timestamp?.seconds||0)-(a.timestamp?.seconds||0))); },
        err => console.error("Error fetching histori:", err)
    );
    const unsubMutasi = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'mutasi_pending'), 
        s => { const t=[]; s.forEach(d=>t.push({id:d.id, ...d.data()})); setMutasiPendingData(t); },
        err => console.error("Error fetching mutasi:", err)
    );
    const unsubK = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'rkbmd'), 
        s => { const t=[]; s.forEach(d=>{ const x=d.data(); if(x.status!=='deleted') t.push({id:d.id, ...x}); }); setRkbmdData(t.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))); },
        err => console.error("Error fetching rkbmd:", err)
    );
    const unsubT = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'tanah'), 
        s => { const t=[]; s.forEach(d=>t.push({id:d.id, ...d.data()})); setTanahData(t); },
        err => console.error("Error fetching tanah:", err)
    );
    const unsubTemplates = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'templates_doc', activeUnitView), 
        s => { if(s.exists()) setTemplates(s.data()); else setTemplates({ sppbi: '', kir: '', label: '' }); },
        err => console.error("Error fetching templates:", err)
    );
    const unsubRkbmdArsip = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'rkbmd_arsip'), 
        s => { const t={}; s.forEach(d => t[d.id] = d.data().fileUrl); setRkbmdArsip(t); },
        err => console.error("Error fetching rkbmd_arsip:", err)
    );
    const unsubFeedbacks = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'feedbacks'), 
        s => { const t=[]; s.forEach(d=>t.push({id:d.id, ...d.data()})); setFeedbacks(t.sort((a,b)=>(b.timestamp?.seconds||0)-(a.timestamp?.seconds||0))); },
        err => console.error("Error fetching feedbacks:", err)
    );

    return () => { unsubP(); unsubR(); unsubPr(); unsubKB(); unsubH(); unsubMutasi(); unsubK(); unsubT(); unsubTemplates(); unsubRkbmdArsip(); unsubFeedbacks(); };
  }, [user, selectedUser?.nip, activeUnitView]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginCreds.username === 'admin' && loginCreds.password === 'Asetdisbun123') { setUserRole('admin'); setUserUnit(UNIT_CODES.PUSAT); setActiveUnitView(UNIT_CODES.PUSAT); setIsLoggedIn(true); setLoginError(''); setShowDashboardAlert(true); } 
    else if (loginCreds.username === 'admin' && loginCreds.password === 'Asetp2btp') { setUserRole('admin_upt'); setUserUnit(UNIT_CODES.P2BTP); setActiveUnitView(UNIT_CODES.P2BTP); setIsLoggedIn(true); setLoginError(''); setShowDashboardAlert(true); }
    else if (loginCreds.username === 'admin' && loginCreds.password === 'Asetpsbp') { setUserRole('admin_upt'); setUserUnit(UNIT_CODES.PSBP); setActiveUnitView(UNIT_CODES.PSBP); setIsLoggedIn(true); setLoginError(''); setShowDashboardAlert(true); }
    else if (loginCreds.username === 'Disbun1') {
      setUserUnit(UNIT_CODES.PUSAT); setActiveUnitView(UNIT_CODES.PUSAT);
      if (loginCreds.password === 'adminpph') { setUserRole('pph'); setIsLoggedIn(true); setLoginError(''); setShowDashboardAlert(true); }
      else if (loginCreds.password === 'adminperlinbun') { setUserRole('perlinbun'); setIsLoggedIn(true); setLoginError(''); setShowDashboardAlert(true); }
      else if (loginCreds.password === 'adminsemusim') { setUserRole('semusim'); setIsLoggedIn(true); setLoginError(''); setShowDashboardAlert(true); }
      else if (loginCreds.password === 'admintahunan') { setUserRole('tahunan'); setIsLoggedIn(true); setLoginError(''); setShowDashboardAlert(true); }
      else setLoginError('Password tidak valid untuk user Disbun1.');
    } else { 
      const staffUser = data.find(p => safeString(p.nip).replace(/\s/g, '') === loginCreds.username.replace(/\s/g, ''));
      if (staffUser && loginCreds.password === 'disbun') {
          setUserRole('staff');
          const str = JSON.stringify(staffUser).toUpperCase();
          if (str.includes('PENGAWASAN DAN SERTIFIKASI') || str.includes('PSBP')) {
              setUserUnit(UNIT_CODES.PSBP); setActiveUnitView(UNIT_CODES.PSBP);
          } else if (str.includes('PENGEMBANGAN DAN PRODUKSI') || str.includes('P2BTP')) {
              setUserUnit(UNIT_CODES.P2BTP); setActiveUnitView(UNIT_CODES.P2BTP);
          } else {
              setUserUnit(UNIT_CODES.PUSAT); setActiveUnitView(UNIT_CODES.PUSAT);
          }
          setIsLoggedIn(true); setLoginError(''); setShowDashboardAlert(true);
      } else {
          setLoginError('Kredensial atau NIP Pegawai tidak ditemukan.'); 
      }
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value; setSearchTerm(val); if (activeTab !== 'data') setActiveTab('data');
    if (val.length > 2) { 
        const clean = val.replace(/\s/g, '').toLowerCase(); 
        const found = filteredPegawaiData.find(p => safeString(p.nip).replace(/\s/g, '').includes(clean) || safeString(p.nama).toLowerCase().includes(val.toLowerCase())); 
        if (found) setSelectedUser(found); 
    } 
    else if (val.length === 0) setSelectedUser(null);
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0]; if (!file || !window.XLSX || !user) return; setStatus({ ...status, loading: true, progress: 0 });
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const arrayData = new Uint8Array(ev.target.result); const wb = window.XLSX.read(arrayData, { type: 'array' }); const ws = wb.Sheets[wb.SheetNames[0]]; const jsonData = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
        let count = 0; let batch = writeBatch(db);
        const injectUnit = { unitId: activeUnitView };
        const isAppend = status.uploadAppend;

        if (status.uploadType === 'prices') {
          for (let i = 1; i < jsonData.length; i++) {
             const row = jsonData[i]; if (!row || row.length < 9) continue;
             const noKartu = safeString(row[0]).trim(); if (!noKartu) continue;
             
             const tglPengadaanVal = row[1] instanceof Date ? row[1].toISOString() : safeString(row[1]);
             const perolehanVal = typeof row[3] === 'number' ? row[3] : parseFloat(safeString(row[3]).replace(/,/g, '')) || 0;
             
             const { masa_manfaat } = parseKodeBarangData(noKartu, kodeBarangData);
             const calculatedNilaiBuku = calculateNilaiBuku(perolehanVal, tglPengadaanVal, masa_manfaat);

             let calculatedTglHabis = row[2] instanceof Date ? row[2].toISOString() : safeString(row[2]);
             const dPengadaan = parseDateRobust(tglPengadaanVal);
             if (dPengadaan && (!calculatedTglHabis || calculatedTglHabis.trim() === '' || calculatedTglHabis === 'undefined')) {
                 const dHabis = new Date(dPengadaan);
                 dHabis.setFullYear(dHabis.getFullYear() + masa_manfaat);
                 calculatedTglHabis = dHabis.toISOString();
             }

             const payload = { ...injectUnit, nama: safeString(row[8]).trim().toUpperCase(), no_kartu: noKartu, tgl_pengadaan: tglPengadaanVal, tgl_habis: calculatedTglHabis, nilai_perolehan: perolehanVal, nilai_buku: calculatedNilaiBuku, updatedAt: serverTimestamp() };
             const safeId = noKartu.replace(/[^a-zA-Z0-9.-]/g, '_'); batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), payload, {merge: true}); count++; if (count % 400 === 0) { await batch.commit(); batch = writeBatch(db); setStatus(prev => ({...prev, progress: Math.round((i/jsonData.length)*100)})); }
          }
        } else if (status.uploadType === 'kode_barang') {
          for (let i = 1; i < jsonData.length; i++) {
             const row = jsonData[i]; if (!row || !row[0]) continue;
             const kode = safeString(row[0]).trim();
             const nama = safeString(row[1]).trim();
             const masa_manfaat = parseInt(row[2]) || 4;

             const safeId = kode.replace(/[^a-zA-Z0-9.-]/g, '_');
             batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'kode_barang', safeId), {
                 kode, nama, masa_manfaat, updatedAt: serverTimestamp()
             }, { merge: true }); 
             count++; if (count % 400 === 0) { await batch.commit(); batch = writeBatch(db); setStatus(prev => ({...prev, progress: Math.round((i/jsonData.length)*100)})); }
          }
        } else if (status.uploadType === 'pajak') {
          for (let i = 0; i < jsonData.length; i++) {
             const row = jsonData[i]; if (!row) continue;
             const jenisKendaraan = safeString(row[1]).trim(); const noPolisi = safeString(row[3]).trim();
             if (!noPolisi || noPolisi.toLowerCase() === 'nomor polisi' || noPolisi.includes('NOMOR POLISI')) continue;
             if (!jenisKendaraan || jenisKendaraan.toLowerCase().includes('roda')) continue;
             let tglPajakRaw = row[6]; let tglPajakIso = null;
             if (tglPajakRaw) { const parsedDate = parseDateRobust(tglPajakRaw); if (parsedDate) tglPajakIso = parsedDate.toISOString(); }
             const safeId = noPolisi.replace(/[^a-zA-Z0-9.-]/g, '_'); batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), { ...injectUnit, nama: jenisKendaraan.toUpperCase(), no_kartu: noPolisi, lokasi: safeString(row[5]).trim() || 'N/A', tgl_pajak: tglPajakIso || safeString(tglPajakRaw), updatedAt: serverTimestamp() }, { merge: true }); count++; if (count % 400 === 0) { await batch.commit(); batch = writeBatch(db); setStatus(prev => ({...prev, progress: Math.round((i/jsonData.length)*100)})); }
          }
        } else if (status.uploadType === 'tanah') {
            let headers = [], startRow = 0;
            for(let r = 0; r < Math.min(5, jsonData.length); r++) { const rowStr = (jsonData[r]||[]).map(c=>safeString(c).toLowerCase()).join(' '); if(rowStr.includes('kib') || rowStr.includes('kode') || rowStr.includes('luas') || rowStr.includes('alamat')) { headers = (jsonData[r]||[]).map(c=>safeString(c).toLowerCase()); startRow = r + 1; break; } }
            const getCol = (k, d) => { if(headers.length === 0) return d; const idx = headers.findIndex(h => k.some(x => h.includes(x))); return idx >= 0 ? idx : d; };
            const colKib = getCol(['kib', 'kode', 'register'], 0), colNama = getCol(['nama', 'jenis', 'deskripsi'], 1), colTahun = getCol(['tahun', 'peroleh', 'pengadaan'], 2), colLuas = getCol(['luas'], 4), colAlamat = getCol(['alamat', 'letak', 'lokasi'], 5), colHak = getCol(['hak', 'status'], 6), colPenggunaan = getCol(['penggunaan', 'guna'], 7), colPetugas = getCol(['petugas', 'pic'], 8), colTlp = getCol(['tlp', 'telepon', 'hp'], 9), colGmaps = getCol(['maps', 'gmaps', 'koordinat'], 10);
            
            const colBiaya = getCol(['biaya', 'pengurusan'], 11);
            const colPAD = getCol(['pad', 'penerimaan'], 12);
            const colTarif = getCol(['tarif', 'retribusi'], 13);
            const colTotal = getCol(['total', 'disewakan'], 14);
            const colSatuan = getCol(['satuan'], 15);

            for (let i = startRow; i < jsonData.length; i++) {
                 const row = jsonData[i]; if (!row) continue;
                 const kib = safeString(row[colKib]).trim(); if (!kib || kib.toLowerCase().includes('kib') || kib.toLowerCase().includes('nomor')) continue;
                 const safeId = kib.replace(/[^a-zA-Z0-9.-]/g, '_'); batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'tanah', safeId), { ...injectUnit, kib, deskripsi: safeString(row[colNama]), tgl_peroleh: row[colTahun] instanceof Date ? row[colTahun].toISOString() : safeString(row[colTahun]), luas: safeString(row[colLuas]), alamat: safeString(row[colAlamat]), status_hak: safeString(row[colHak]), penggunaan: safeString(row[colPenggunaan]), petugas: safeString(row[colPetugas]), tlp_petugas: safeString(row[colTlp]), gmaps: safeString(row[colGmaps]), biaya_pengurusan: safeString(row[colBiaya]), penerimaan_pad: safeString(row[colPAD]), tarif_retribusi: safeString(row[colTarif]), total_tarif: safeString(row[colTotal]), satuan_tarif: safeString(row[colSatuan]), updatedAt: serverTimestamp() }, { merge: true }); count++; if (count % 400 === 0) { await batch.commit(); batch = writeBatch(db); setStatus(prev => ({...prev, progress: Math.round((i/jsonData.length)*100)})); }
            }
        } else {
          for (let i = 1; i < jsonData.length; i++) {
             const row = jsonData[i]; if (!row || !row[2]) continue;
             if (safeString(row[1]).toUpperCase().includes("DINAS PERKEBUNAN")) continue;
             const items = [];
             for (let k = 0; k < 6; k++) { 
                 const bNama = safeString(row[6 + k]).trim(); 
                 if (bNama && bNama !== '-' && !bNama.toUpperCase().includes("DINAS PERKEBUNAN")) {
                     items.push({ nama: bNama.toUpperCase(), merk: safeString(row[12 + k] || '-').trim().toUpperCase(), tahun: safeString(row[18 + k] || '-').trim(), no_kartu: row[24 + k] ? safeString(row[24 + k]).trim() : '' }); 
                 }
             }
             const payload = { 
                 nama: safeString(row[1] || 'N/A').trim().toUpperCase(), 
                 nip: safeString(row[2]).trim(), 
                 skpd: safeString(row[5] || '').trim().toUpperCase(), 
                 jabatan: safeString(row[4] || '-').trim().toUpperCase(), 
                 bidang: safeString(row[5] || '-').trim().toUpperCase(), 
                 lastSync: serverTimestamp() 
             };
             
             if (items.length > 0) {
                 if (isAppend) {
                     payload.items = arrayUnion(...items);
                 } else {
                     payload.items = items;
                 }
             } else if (!isAppend) {
                 payload.items = [];
             }

             batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'pegawai', safeString(row[2]).trim().replace(/\s/g, '')), payload, { merge: true }); count++; if (count % 400 === 0) { await batch.commit(); batch = writeBatch(db); setStatus(prev => ({...prev, progress: Math.round((i/jsonData.length)*100)})); }
          }
        }
        await batch.commit(); setModals(prev => ({ ...prev, upload: false })); if(document.getElementById('portalSync')) document.getElementById('portalSync').value = ''; customAlert("Berhasil", `Sinkronisasi selesai: ${count} baris data diproses.`);
      } catch (e) { customAlert("Gagal", "Format tidak valid."); if(document.getElementById('portalSync')) document.getElementById('portalSync').value = ''; }
      setStatus(prev => ({ ...prev, loading: false, progress: 0 }));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAddItem = async (form) => {
    if (!form.nama || !selectedUser || !user) return; setStatus({ ...status, loading: true });
    try {
      const formNoKartu = safeString(form.no_kartu).trim(); const idToUse = formNoKartu ? formNoKartu.replace(/[^a-zA-Z0-9.-]/g, '_') : 'MANUAL_' + Date.now();
      const isLocalOnly = form.saveToMaster === false; // Cek flag lokal
      const itemToSave = { nama: safeString(form.nama).toUpperCase(), merk: safeString(form.merk).toUpperCase(), tahun: safeString(form.tgl_pengadaan).split('-')[0], tgl_pengadaan: safeString(form.tgl_pengadaan), no_kartu: formNoKartu || idToUse, isLocalOnly };
      
      const { masa_manfaat } = parseKodeBarangData(formNoKartu, kodeBarangData);
      const nilaiBukuVal = calculateNilaiBuku(form.nilai_perolehan, form.tgl_pengadaan, masa_manfaat);
      
      let tglHabisVal = null;
      const dPengadaan = parseDateRobust(form.tgl_pengadaan);
      if (dPengadaan) {
          const dHabis = new Date(dPengadaan);
          dHabis.setFullYear(dHabis.getFullYear() + masa_manfaat);
          tglHabisVal = dHabis.toISOString();
      }

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pegawai', safeString(selectedUser.nip).replace(/\s/g, '')), { items: arrayUnion(itemToSave) });
      
      if (!isLocalOnly) {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'prices', idToUse), { unitId: activeUnitView, nama: safeString(form.nama).toUpperCase(), merk: safeString(form.merk).toUpperCase(), no_kartu: itemToSave.no_kartu, nilai_perolehan: parseFloat(form.nilai_perolehan) || 0, nilai_buku: nilaiBukuVal, tgl_pengadaan: safeString(form.tgl_pengadaan), tgl_habis: tglHabisVal, lokasi: selectedUser.nama, updatedAt: serverTimestamp() }, { merge: true });
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'histori'), { unitId: activeUnitView, itemName: safeString(form.nama), receiverName: selectedUser.nama, type: 'INPUT BARU', timestamp: serverTimestamp() });
      } else {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'histori'), { unitId: activeUnitView, itemName: safeString(form.nama), receiverName: selectedUser.nama, type: 'INPUT LOKAL KIB', timestamp: serverTimestamp() });
      }
      
      setModals({ ...modals, addItem: false }); exportLabelWord(itemToSave, selectedUser.nama, filteredPriceData, templates, data);
    } catch (e) {} setStatus({ ...status, loading: false });
  };

  const handleAddRoomItem = async (form) => {
    if (!form.nama || !selectedRoomName || !user) return; setStatus({ ...status, loading: true });
    try {
      const qty = parseInt(form.jumlah) || 1; const itemsToSave = []; const b = writeBatch(db); const timestamp = serverTimestamp(); let baseNoKartu = safeString(form.no_kartu).trim();

      const roomDoc = filteredRuanganData.find(r => r.nama_ruangan === selectedRoomName);
      const roomDocId = roomDoc && roomDoc.id ? roomDoc.id : `${activeUnitView}_${selectedRoomName.replace(/[^a-zA-Z0-9]/g, '_')}`;

      for (let i = 0; i < qty; i++) {
        let currentNoKartu = baseNoKartu;
        if (qty > 1 && baseNoKartu) { const match = baseNoKartu.match(/(.*?)(\d+)$/); if (match) currentNoKartu = match[1] + String(parseInt(match[2], 10) + i).padStart(match[2].length, '0'); else currentNoKartu = `${baseNoKartu}-${i + 1}`; }
        const idToUse = currentNoKartu ? currentNoKartu.replace(/[^a-zA-Z0-9.-]/g, '_') : `RUANG_${Date.now()}_${i}`;
        const isLocalOnly = form.saveToMaster === false;
        const itemToSave = { nama: safeString(form.nama).toUpperCase(), merk: safeString(form.merk).toUpperCase(), tahun: safeString(form.tgl_pengadaan).split('-')[0], tgl_pengadaan: safeString(form.tgl_pengadaan), no_kartu: currentNoKartu || idToUse, isLocalOnly };
        itemsToSave.push(itemToSave);
        
        const { masa_manfaat } = parseKodeBarangData(currentNoKartu, kodeBarangData);
        const nilaiBukuVal = calculateNilaiBuku(form.nilai_perolehan, form.tgl_pengadaan, masa_manfaat);
        
        let tglHabisVal = null;
        const dPengadaan = parseDateRobust(form.tgl_pengadaan);
        if (dPengadaan) {
            const dHabis = new Date(dPengadaan);
            dHabis.setFullYear(dHabis.getFullYear() + masa_manfaat);
            tglHabisVal = dHabis.toISOString();
        }

        if (!isLocalOnly) {
            b.set(doc(db, 'artifacts', appId, 'public', 'data', 'prices', idToUse), { unitId: activeUnitView, nama: safeString(form.nama).toUpperCase(), merk: safeString(form.merk).toUpperCase(), no_kartu: itemToSave.no_kartu, nilai_perolehan: parseFloat(form.nilai_perolehan) || 0, nilai_buku: nilaiBukuVal, tgl_pengadaan: safeString(form.tgl_pengadaan), tgl_habis: tglHabisVal, lokasi: selectedRoomName, updatedAt: timestamp }, { merge: true });
        }
      }
      b.set(doc(db, 'artifacts', appId, 'public', 'data', 'ruangan', roomDocId), { unitId: activeUnitView, nama_ruangan: selectedRoomName, items: arrayUnion(...itemsToSave), updatedAt: timestamp }, { merge: true });
      await b.commit(); setModals({ ...modals, addRoomItem: false }); 
    } catch (e) {} setStatus({ ...status, loading: false });
  };

  const handleAddRoom = async () => {
     if (!newRoomName || !user) return; setStatus({ ...status, loading: true });
     try {
         const safeName = `${activeUnitView}_${newRoomName.replace(/[^a-zA-Z0-9]/g, '_')}`;
         await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ruangan', safeName), { unitId: activeUnitView, nama_ruangan: newRoomName, items: [], updatedAt: serverTimestamp() }, {merge: true});
         setNewRoomName(''); setSelectedRoomName(newRoomName); customAlert("Berhasil", "Ruangan ditambahkan.");
     } catch (e) {} setStatus({ ...status, loading: false });
  };

  const handleDeleteRoom = (roomName) => {
    const roomDoc = filteredRuanganData.find(r => r.nama_ruangan === roomName);
    if (!roomDoc) return;
    customConfirm("Hapus Ruangan?", `Yakin hapus ruangan "${roomName}"?`, "danger", async () => {
       setStatus({ ...status, loading: true });
       try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ruangan', roomDoc.id)); setSelectedRoomName(dynamicRooms[0] || 'Default'); customAlert("Berhasil", "Terhapus."); } catch (e) {}
       setStatus({ ...status, loading: false });
    });
  };

  const handleAddRoomName = async () => {
      if(!editRoom.newName || editRoom.newName === editRoom.oldName) return; setStatus({ ...status, loading: true });
      try {
          const roomDoc = (filteredRuanganData || []).find(r => r.nama_ruangan === editRoom.oldName); 
          const items = roomDoc ? roomDoc.items : [];
          const b = writeBatch(db);
          const newDocId = `${activeUnitView}_${editRoom.newName.replace(/[^a-zA-Z0-9]/g, '_')}`;
          b.set(doc(db, 'artifacts', appId, 'public', 'data', 'ruangan', newDocId), { unitId: activeUnitView, nama_ruangan: editRoom.newName, items, updatedAt: serverTimestamp() }, { merge: true });
          if (roomDoc && roomDoc.id) {
              b.delete(doc(db, 'artifacts', appId, 'public', 'data', 'ruangan', roomDoc.id));
          }
          await b.commit(); setSelectedRoomName(editRoom.newName); setEditRoom({ show: false, oldName: '', newName: '' }); customAlert("Berhasil", "Nama diubah.");
      } catch(e){} setStatus({ ...status, loading: false });
  };

  const handleAddRkbmd = async (form) => {
     if (!user) return; setStatus({ ...status, loading: true });
     try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'rkbmd'), { unitId: activeUnitView, ...form, inputByRole: userRole, createdAt: serverTimestamp() }); setModals({ ...modals, rkbmd: false }); } catch(e) {} setStatus({ ...status, loading: false });
  };

  const deleteRkbmd = async (id) => {
    customConfirm("Hapus RKBMD?", "Yakin hapus usulan ini?", "danger", async () => { setStatus({ ...status, loading: true }); try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rkbmd', id), { status: 'deleted' }, { merge: true }); } catch(e){} setStatus({ ...status, loading: false }); });
  };

  const confirmDelete = (item, type) => {
    customConfirm("Hapus Barang?", `Hapus "${item.nama}"?`, "danger", async () => {
       setStatus({ ...status, loading: true });
       try {
         if (type === 'pegawai') {
             const userToUpdate = data.find(p => p.nip === selectedUser.nip);
             if (userToUpdate) {
                 const newItems = userToUpdate.items.filter(x => !(x.no_kartu === item.no_kartu && x.nama === item.nama));
                 await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pegawai', safeString(selectedUser.nip).replace(/\s/g, '')), { items: newItems });
             }
         } else if (type === 'ruangan') {
             const roomToUpdate = filteredRuanganData.find(r => r.nama_ruangan === selectedRoomName);
             if (roomToUpdate && roomToUpdate.id) {
                 const newItems = roomToUpdate.items.filter(x => !(x.no_kartu === item.no_kartu && x.nama === item.nama));
                 await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ruangan', roomToUpdate.id), { items: newItems });
             }
         }
       } catch (e) { customAlert("Gagal", "Error hapus barang."); } setStatus({ ...status, loading: false });
    });
  };

  const handleUnlinkFromMaster = async (item, type) => {
      customConfirm("Keluarkan dari Monitoring?", `Aset "${item.nama}" akan dihapus dari daftar Monitoring Aset (Master), namun akan TETAP DISIMPAN sebagai catatan lokal di sini. Lanjutkan?`, "danger", async () => {
          setStatus({ ...status, loading: true });
          try {
              const safeId = item.no_kartu ? safeString(item.no_kartu).trim().replace(/[^a-zA-Z0-9.-]/g, '_') : safeString(item.nama).toUpperCase().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
              const b = writeBatch(db);

              b.delete(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId));

              if (type === 'ruangan') {
                  const roomDoc = filteredRuanganData.find(r => r.nama_ruangan === selectedRoomName);
                  if (roomDoc && roomDoc.id) {
                      const updatedItems = roomDoc.items.map(it => {
                          if (it.no_kartu === item.no_kartu && it.nama === item.nama) {
                              return { ...it, isLocalOnly: true };
                          }
                          return it;
                      });
                      b.update(doc(db, 'artifacts', appId, 'public', 'data', 'ruangan', roomDoc.id), { items: updatedItems });
                  }
              } else if (type === 'pegawai') {
                  const userDoc = data.find(p => p.nip === selectedUser.nip);
                  if (userDoc) {
                      const updatedItems = userDoc.items.map(it => {
                          if (it.no_kartu === item.no_kartu && it.nama === item.nama) {
                              return { ...it, isLocalOnly: true };
                          }
                          return it;
                      });
                      b.update(doc(db, 'artifacts', appId, 'public', 'data', 'pegawai', safeString(selectedUser.nip).replace(/\s/g, '')), { items: updatedItems });
                  }
              }

              b.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'histori')), {
                  unitId: activeUnitView,
                  itemName: safeString(item.nama),
                  senderName: 'Sistem',
                  receiverName: type === 'ruangan' ? selectedRoomName : selectedUser.nama,
                  type: 'UBAH KE LOKAL',
                  timestamp: serverTimestamp(),
                  no_kartu: item.no_kartu
              });

              await b.commit();
              customAlert("Berhasil", "Aset berhasil dikeluarkan dari Monitoring dan sekarang menjadi Catatan Lokal.");
          } catch (e) {
              console.error(e);
              customAlert("Gagal", "Terjadi kesalahan saat memproses pemindahan data.");
          }
          setStatus({ ...status, loading: false });
      });
  };

  const processTransfer = async (targetNipParam) => {
     const target = data.find(p => p.nip === targetNipParam); 
     if (!target || !user || !transferItem) return; 
     setStatus({ ...status, loading: true });
     try {
        const safeTransferItem = {
            nama: safeString(transferItem.nama),
            merk: safeString(transferItem.merk || '-'),
            tahun: safeString(transferItem.tahun || transferItem.tgl_pengadaan),
            no_kartu: safeString(transferItem.no_kartu),
            isLocalOnly: transferItem.isLocalOnly || false
        };

        const b = writeBatch(db);
        
        if (selectedUser) {
            const senderUser = data.find(p => p.nip === selectedUser.nip);
            if (senderUser) {
                const newItems = senderUser.items.filter(x => !(x.no_kartu === safeTransferItem.no_kartu && x.nama === safeTransferItem.nama));
                b.update(doc(db, 'artifacts', appId, 'public', 'data', 'pegawai', safeString(selectedUser.nip).replace(/\s/g, '')), { items: newItems });
            }
        }
        
        b.update(doc(db, 'artifacts', appId, 'public', 'data', 'pegawai', safeString(target.nip).replace(/\s/g, '')), { items: arrayUnion(safeTransferItem) });
        b.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'histori')), { unitId: activeUnitView, itemName: safeString(safeTransferItem.nama), senderName: safeString(selectedUser.nama), receiverName: safeString(target.nama), timestamp: serverTimestamp(), type: 'MUTASI' });
        
        const safeId = safeTransferItem.no_kartu ? safeString(safeTransferItem.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_') : null;
        if(safeId && !safeTransferItem.isLocalOnly) b.set(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), { lokasi: target.nama, updatedAt: serverTimestamp() }, { merge: true });
        
        await b.commit(); setModals({...modals, transfer: false}); generateBAST(safeTransferItem, selectedUser, target);
     } catch(e){ customAlert("Gagal", "Error mutasi."); } setStatus({ ...status, loading: false });
  };

  const processTransferUnit = async (targetUnit, targetBidang) => {
      const { item, sourceType, sourceRef } = transferUnitModal;
      if (!targetUnit || !user || !item) return;
      setStatus({ ...status, loading: true });
      try {
          const safeTransferItem = {
              nama: safeString(item.nama),
              merk: safeString(item.merk || '-'),
              tahun: safeString(item.tahun || item.tgl_pengadaan),
              no_kartu: safeString(item.no_kartu),
              isLocalOnly: item.isLocalOnly || false
          };

          const b = writeBatch(db);
          let senderPegawai = null;
          
          if (sourceType === 'pegawai') {
              senderPegawai = data.find(p => p.nip === sourceRef);
              if (senderPegawai) {
                  const newItems = senderPegawai.items.filter(x => !(x.no_kartu === item.no_kartu && x.nama === item.nama));
                  b.update(doc(db, 'artifacts', appId, 'public', 'data', 'pegawai', safeString(sourceRef).replace(/\s/g, '')), { items: newItems });
              }
          } else if (sourceType === 'ruangan') {
              const roomDoc = filteredRuanganData.find(r => r.nama_ruangan === sourceRef);
              if (roomDoc && roomDoc.id) {
                  const newItems = roomDoc.items.filter(x => !(x.no_kartu === item.no_kartu && x.nama === item.nama));
                  b.update(doc(db, 'artifacts', appId, 'public', 'data', 'ruangan', roomDoc.id), { items: newItems });
              }
          }

          const pendingId = `mutasi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          b.set(doc(db, 'artifacts', appId, 'public', 'data', 'mutasi_pending', pendingId), {
              item: safeTransferItem,
              sourceUnit: activeUnitView,
              sourceType: sourceType,
              sourceRef: sourceRef,
              targetUnit: targetUnit,
              targetBidang: targetUnit === UNIT_CODES.PUSAT ? targetBidang : '',
              status: 'pending',
              senderName: senderPegawai ? senderPegawai.nama : sourceRef,
              senderPegawai: senderPegawai || null,
              createdAt: serverTimestamp()
          });

          b.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'histori')), { unitId: activeUnitView, itemName: safeString(item.nama), senderName: UNIT_LABELS[activeUnitView], receiverName: UNIT_LABELS[targetUnit] + ' (Menunggu Persetujuan)', timestamp: serverTimestamp(), type: 'PENGAJUAN MUTASI ANTAR UNIT' });
          
          const safeId = item.no_kartu ? safeString(item.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_') : null;
          if(safeId && !item.isLocalOnly) b.set(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), { lokasi: `Menunggu Persetujuan Mutasi ke ${UNIT_LABELS[targetUnit]}`, updatedAt: serverTimestamp() }, { merge: true });
          
          await b.commit();
          
          generateBASTAntarUnit(safeTransferItem, activeUnitView, targetUnit, senderPegawai);

          setTransferUnitModal({show: false, item: null, sourceRef: null, sourceType: ''});
          customAlert("Berhasil", `Pengajuan mutasi aset ke ${UNIT_LABELS[targetUnit]} telah dikirim dan menunggu persetujuan admin tujuan.`);
      } catch (e) {
          console.error(e);
          customAlert("Gagal", "Error mutasi antar unit.");
      }
      setStatus({ ...status, loading: false });
  };

  const handleApproveMutasi = async (mutasi) => {
      setStatus({ ...status, loading: true });
      try {
          const b = writeBatch(db);
          const safeId = mutasi.item.no_kartu ? safeString(mutasi.item.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_') : null;
          const newLokasi = mutasi.targetUnit === UNIT_CODES.PUSAT ? `Transit - ${mutasi.targetBidang}` : `Transit ${UNIT_LABELS[mutasi.targetUnit]}`;

          if (safeId) {
              const assetPayload = {
                  unitId: mutasi.targetUnit,
                  lokasi: newLokasi,
                  updatedAt: serverTimestamp()
              };
              if (mutasi.item.isLocalOnly) {
                  assetPayload.nama = mutasi.item.nama;
                  assetPayload.merk = mutasi.item.merk;
                  assetPayload.no_kartu = mutasi.item.no_kartu;
                  assetPayload.tgl_pengadaan = mutasi.item.tahun;
                  assetPayload.nilai_perolehan = 0;
                  assetPayload.nilai_buku = 0;
              }
              b.set(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), assetPayload, { merge: true });
          }

          b.delete(doc(db, 'artifacts', appId, 'public', 'data', 'mutasi_pending', mutasi.id));

          b.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'histori')), {
              unitId: mutasi.targetUnit,
              itemName: safeString(mutasi.item.nama),
              senderName: UNIT_LABELS[mutasi.sourceUnit],
              receiverName: UNIT_LABELS[mutasi.targetUnit],
              type: 'MUTASI ANTAR UNIT (DISETUJUI)',
              timestamp: serverTimestamp()
          });

          await b.commit();
          customAlert("Berhasil", "Mutasi diterima. Aset sekarang berada di " + newLokasi + " pada Master Data.");
      } catch (e) {
          customAlert("Gagal", "Terjadi kesalahan.");
      }
      setStatus({ ...status, loading: false });
  };

  const handleRejectMutasi = async (mutasi) => {
      setStatus({ ...status, loading: true });
      try {
          const b = writeBatch(db);
          const safeId = mutasi.item.no_kartu ? safeString(mutasi.item.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_') : null;

          if (mutasi.sourceType === 'pegawai') {
              b.update(doc(db, 'artifacts', appId, 'public', 'data', 'pegawai', safeString(mutasi.sourceRef).replace(/\s/g, '')), { items: arrayUnion(mutasi.item) });
          } else if (mutasi.sourceType === 'ruangan') {
              const roomDoc = ruanganData.find(r => r.nama_ruangan === mutasi.sourceRef && (r.unitId || UNIT_CODES.PUSAT) === mutasi.sourceUnit);
              const roomDocId = roomDoc && roomDoc.id ? roomDoc.id : `${mutasi.sourceUnit}_${mutasi.sourceRef.replace(/[^a-zA-Z0-9]/g, '_')}`;
              b.set(doc(db, 'artifacts', appId, 'public', 'data', 'ruangan', roomDocId), { unitId: mutasi.sourceUnit, nama_ruangan: mutasi.sourceRef, items: arrayUnion(mutasi.item), updatedAt: serverTimestamp() }, { merge: true });
          }

          if (safeId && !mutasi.item.isLocalOnly) {
              b.set(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), {
                  lokasi: mutasi.senderName,
                  updatedAt: serverTimestamp()
              }, { merge: true });
          }

          b.delete(doc(db, 'artifacts', appId, 'public', 'data', 'mutasi_pending', mutasi.id));

          b.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'histori')), {
              unitId: mutasi.sourceUnit,
              itemName: safeString(mutasi.item.nama),
              senderName: UNIT_LABELS[mutasi.targetUnit],
              receiverName: UNIT_LABELS[mutasi.sourceUnit],
              type: 'MUTASI ANTAR UNIT (DITOLAK)',
              timestamp: serverTimestamp()
          });

          await b.commit();
          customAlert("Berhasil", "Mutasi ditolak dan aset dikembalikan ke " + mutasi.senderName);
      } catch (e) {
          customAlert("Gagal", "Terjadi kesalahan.");
      }
      setStatus({ ...status, loading: false });
  };

  const handleRestoreItem = async (item) => {
     const isManual = item.isManuallyDisposed;
     const title = isManual ? "Batalkan Usulan Manual" : "Re-Aktifkan Aset";
     const msg = isManual ? "Aset akan dikembalikan ke Monitoring Aset sesuai status aslinya." : "Aksi ini menahan status aset tetap Aktif.";
     customConfirm(title, msg, "info", async () => {
         setStatus({ ...status, loading: true });
         try {
             const safeId = item.no_kartu ? safeString(item.no_kartu).trim().replace(/[^a-zA-Z0-9.-]/g, '_') : safeString(item.nama).toUpperCase().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
             const payload = isManual ? { manual_disposal: false, alasan_hapus: '', updatedAt: serverTimestamp() } : { manual_active: true, updatedAt: serverTimestamp() };
             await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), payload, { merge: true });
             customAlert("Berhasil", "Status aset berhasil diperbarui.");
         } catch(e){} setStatus({ ...status, loading: false });
     });
  };

  const processManualDisposal = async (item, alasan) => {
      if (!item || !user) return;
      setStatus({ ...status, loading: true });
      try {
          const safeId = item.no_kartu ? safeString(item.no_kartu).trim().replace(/[^a-zA-Z0-9.-]/g, '_') : safeString(item.nama).toUpperCase().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), { manual_disposal: true, alasan_hapus: safeString(alasan), updatedAt: serverTimestamp() }, { merge: true });
          customAlert("Berhasil", "Aset berhasil dipindahkan ke usulan penghapusan.");
          setModals({ ...modals, manualDisposal: false });
      } catch(e) {} setStatus({ ...status, loading: false });
  };

  const processPermanentDisposal = async (item, password) => {
      if (password !== 'SugengR' && password !== 'AchmarA') return customAlert("Gagal", "Password salah!");
      setStatus({ ...status, loading: true });
      try {
          const safeId = item.no_kartu ? safeString(item.no_kartu).trim().replace(/[^a-zA-Z0-9.-]/g, '_') : safeString(item.nama).toUpperCase().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
          const b = writeBatch(db);
          
          b.delete(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId));
          
          if (item.pemegang && item.pemegang !== '-') {
              const pUser = (data || []).find(p => p.nama === item.pemegang);
              if (pUser) {
                 const newItems = pUser.items.filter(x => x.no_kartu !== item.no_kartu);
                 b.update(doc(db, 'artifacts', appId, 'public', 'data', 'pegawai', safeString(pUser.nip).replace(/\s/g, '')), { items: newItems });
              }
          } else if (item.ruangan && item.ruangan !== '-') {
              const rData = (ruanganData || []).find(r => r.nama_ruangan === item.ruangan && (r.unitId || UNIT_CODES.PUSAT) === (item.unitId || activeUnitView));
              if (rData && rData.id) {
                 const newItems = rData.items.filter(x => x.no_kartu !== item.no_kartu);
                 b.update(doc(db, 'artifacts', appId, 'public', 'data', 'ruangan', rData.id), { items: newItems });
              }
          }

          const editorName = password === 'SugengR' ? 'Sugeng Riyanto' : 'Achmar Adrian';
          b.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'histori')), { unitId: activeUnitView, itemName: safeString(item.nama), senderName: `Sistem (Dihapus oleh ${editorName})`, receiverName: 'Dihapus Permanen', type: 'PENGHAPUSAN PERMANEN', timestamp: serverTimestamp(), no_kartu: item.no_kartu, alasan: item.alasan_hapus });
          
          await b.commit();
          customAlert("Berhasil", "Aset telah dihapus permanen dari sistem dan dari daftar ruangan/pegawai terkait.");
      } catch(e){
          customAlert("Gagal", "Terjadi kesalahan saat menghapus permanen.");
      }
      setStatus({ ...status, loading: false });
  };

  const handlePerpanjangPajak = async (item) => {
     customConfirm("Perpanjang Pajak", `Tambah masa aktif pajak 1 tahun untuk ${item.nama}?`, "info", async () => {
         setStatus({ ...status, loading: true });
         try {
           let d = new Date(item.tgl_pajak || item.tgl_pengadaan || Date.now()); d.setFullYear(d.getFullYear() + 1);
           const safeId = item.no_kartu ? safeString(item.no_kartu).trim().replace(/[^a-zA-Z0-9.-]/g, '_') : safeString(item.nama).toUpperCase().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
           await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), { tgl_pajak: d.toISOString(), updatedAt: serverTimestamp() }, { merge: true }); customAlert("Berhasil", "Pajak diperpanjang.");
         } catch(e){} setStatus({ ...status, loading: false });
     });
  };

  const processPajakOwner = async (targetIdParam) => {
      const { item } = editPajakModal; if (!item || !user) return; setStatus({ ...status, loading: true });
      try {
          const safeId = item.no_kartu ? safeString(item.no_kartu).trim().replace(/[^a-zA-Z0-9.-]/g, '_') : safeString(item.nama).toUpperCase().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
          let locName = targetIdParam; const isPegawai = (data || []).find(p => p.nip === targetIdParam); if (isPegawai) locName = isPegawai.nama;
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), { lokasi: locName, updatedAt: serverTimestamp() }, { merge: true });
          customAlert("Berhasil", "Pemegang kendaraan telah diperbarui."); setEditPajakModal({ show: false, item: null });
      } catch (e) {} setStatus({ ...status, loading: false });
  };

  const processLinkAset = async (linkType, targetValue, updateMaster) => {
      const { item } = linkAsetModal; if (!item || !user) return; setStatus({ ...status, loading: true });
      try {
          const safeId = item.no_kartu ? safeString(item.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_') : safeString(item.nama).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
          let locName = targetValue;
          if (linkType === 'pegawai') { const targetPegawai = (data || []).find(p => p.nip === targetValue); if (targetPegawai) locName = targetPegawai.nama; }
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), { lokasi: locName, updatedAt: serverTimestamp() }, { merge: true });

          if (updateMaster && linkType !== 'manual') {
              const itemToSave = { nama: safeString(item.nama), merk: safeString(item.merk || '-'), tahun: safeString(item.tgl_pengadaan || item.tahun || new Date().getFullYear().toString()), no_kartu: safeString(item.no_kartu || '') };
              if (linkType === 'pegawai') { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pegawai', targetValue.replace(/\s/g, '')), { items: arrayUnion(itemToSave) }); } 
              else if (linkType === 'ruangan') { 
                  const roomDoc = filteredRuanganData.find(r => r.nama_ruangan === targetValue);
                  const roomDocId = roomDoc && roomDoc.id ? roomDoc.id : `${activeUnitView}_${targetValue.replace(/[^a-zA-Z0-9]/g, '_')}`;
                  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ruangan', roomDocId), { unitId: activeUnitView, nama_ruangan: targetValue, items: arrayUnion(itemToSave), updatedAt: serverTimestamp() }, { merge: true }); 
              }
              customAlert("Berhasil", "Data dihubungkan & disimpan ke Master Data.");
          } else { customAlert("Berhasil", "Lokasi diupdate."); }
          setLinkAsetModal({ show: false, item: null });
      } catch (e) {} setStatus({ ...status, loading: false });
  };

  const processEditNilai = async (nilaiPerolehanBaru, tglPengadaanBaru, tglHabisBaru, nilaiBukuBaru, pass) => {
      if (pass !== 'SugengR' && pass !== 'AchmarA') return customAlert("Gagal", "Password salah!");
      const { item } = editNilaiModal; if (!item || !user) return; setStatus({ ...status, loading: true });
      try {
          const safeId = item.no_kartu ? safeString(item.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_') : safeString(item.nama).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), { 
              nilai_perolehan: parseFloat(nilaiPerolehanBaru) || 0,
              nilai_buku: parseFloat(nilaiBukuBaru) || 0, 
              tgl_pengadaan: tglPengadaanBaru ? new Date(tglPengadaanBaru).toISOString() : item.tgl_pengadaan,
              tgl_habis: tglHabisBaru ? new Date(tglHabisBaru).toISOString() : item.tgl_habis, 
              updatedAt: serverTimestamp() 
          }, { merge: true });
          customAlert("Berhasil", "Nilai pengadaan dan masa pakai telah diupdate."); setEditNilaiModal({ show: false, item: null });
      } catch (e) {} setStatus({ ...status, loading: false });
  };

  const handleSaveFeedback = async (rating, comment) => {
      if (!user) return;
      try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'feedbacks'), {
              rating,
              comment,
              userRole: userRole,
              unitId: activeUnitView,
              unitName: UNIT_LABELS[activeUnitView],
              timestamp: serverTimestamp()
          });
          customAlert("Terima Kasih!", "Ulasan dan masukan Anda telah terkirim. Kami sangat menghargainya.");
          setModals({...modals, feedback: false});
      } catch (e) {
          customAlert("Gagal", "Terjadi kesalahan saat mengirim ulasan.");
      }
  };

  const savePhotoToCloud = async () => {
    if (!photoModal.file || !user) return; 
    setStatus({ ...status, loading: true });
    try {
       const file = photoModal.file; 
       const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
       const safeNoKartu = safeString(photoModal.item?.no_kartu || photoModal.item?.kib).replace(/[^a-zA-Z0-9]/g, '_');
       const safeNip = safeString(selectedUser?.nip).replace(/[^a-zA-Z0-9]/g, '_');

       let pathStr = `artifacts/${appId}/public/data/media/${Date.now()}_${safeFileName}`;
       if (photoModal.isSPPBI) pathStr = `artifacts/${appId}/public/data/sppbi/${safeNip}_${Date.now()}_${safeFileName}`;
       else if (photoModal.isPajak) pathStr = `artifacts/${appId}/public/data/pajak/${safeNoKartu}_${photoModal.pajakYear}_${Date.now()}_${safeFileName}`;
       else if (photoModal.isPBB) pathStr = `artifacts/${appId}/public/data/pbb/${safeNoKartu}_${photoModal.pbbYear}_${Date.now()}_${safeFileName}`;
       else if (photoModal.isRkbmdArchive) pathStr = `artifacts/${appId}/public/data/rkbmd_arsip/${photoModal.rkbmdMeta.tahun}_${photoModal.rkbmdMeta.jenis.replace(/[^a-zA-Z0-9]/g,'')}_${photoModal.rkbmdMeta.bidang.replace(/[^a-zA-Z0-9]/g,'')}_${Date.now()}_${safeFileName}`;

       const storageRef = ref(storage, pathStr);
       
       const snapshot = await uploadBytes(storageRef, file);
       const downloadURL = await getDownloadURL(snapshot.ref);
       
       if (photoModal.isSPPBI) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pegawai', safeString(selectedUser?.nip).replace(/\s/g, '')), { sppbiPhoto: downloadURL, lastSync: serverTimestamp() }, { merge: true });
       else if (photoModal.isPajak) { const safeId = photoModal.item.no_kartu ? safeString(photoModal.item.no_kartu).trim().replace(/[^a-zA-Z0-9.-]/g, '_') : safeString(photoModal.item.nama).toUpperCase().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), { [`pajak_history.${photoModal.pajakYear}`]: downloadURL, updatedAt: serverTimestamp() }, { merge: true }); } 
       else if (photoModal.isPBB) { const safeId = photoModal.item.id || safeString(photoModal.item.kib).replace(/[^a-zA-Z0-9.-]/g, '_'); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tanah', safeId), { [`pbb_history.${photoModal.pbbYear}`]: downloadURL, updatedAt: serverTimestamp() }, { merge: true }); }
       else if (photoModal.isRkbmdArchive) { const safeId = `${photoModal.rkbmdMeta.tahun}_${photoModal.rkbmdMeta.jenis.replace(/[^a-zA-Z0-9]/g, '')}_${photoModal.rkbmdMeta.bidang.replace(/[^a-zA-Z0-9]/g, '')}`; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rkbmd_arsip', safeId), { fileUrl: downloadURL, updatedAt: serverTimestamp() }, { merge: true }); }
       else { const safeId = photoModal.item.no_kartu ? safeString(photoModal.item.no_kartu).trim().replace(/[^a-zA-Z0-9.-]/g, '_') : safeString(photoModal.item.nama).toUpperCase().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), { photoBase64: downloadURL, updatedAt: serverTimestamp() }, { merge: true }); }
       
       setPhotoModal({ show: false, item: null, preview: null, file: null, isSPPBI: false, isPajak: false, isPBB: false, isRkbmdArchive: false, rkbmdMeta: null, pajakYear: '', pbbYear: '', isPdf: false, isExcel: false, fileName: '' });
       setStatus({ ...status, loading: false }); 
       customAlert("Berhasil", "File dokumen berhasil diunggah ke server.");

    } catch(e) { 
       console.error(e); 
       setStatus({ ...status, loading: false }); 
       customAlert("Upload Gagal", `Pesan Error: ${e.message} \n\nPastikan Firebase Storage Rules sudah mengizinkan write & konfigurasi CORS sudah diatur pada bucket Anda.`);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type.includes('spreadsheet') || file.type.includes('excel'); const isPdf = file.type === 'application/pdf';
    if (isPdf || isExcel) { setPhotoModal(p => ({...p, file: file, preview: URL.createObjectURL(file), isPdf, isExcel, fileName: file.name}));
    } else { const reader = new FileReader(); reader.onload = (ev) => { const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); const max = 800; let w = img.width, h = img.height; if (w > h) { if (w > max) { h *= max/w; w = max; } } else { if (h > max) { w *= max/h; h = max; } } c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); setPhotoModal(p => ({...p, file: file, preview: c.toDataURL('image/jpeg', 0.6), isPdf: false, isExcel: false, fileName: file.name})); }; img.src = ev.target.result; }; reader.readAsDataURL(file); }
  };

  const handleMediaTanahChange = (e) => {
    const file = e.target.files[0]; if (!file) return; const isVideo = file.type.startsWith('video/');
    if (!isVideo) { const reader = new FileReader(); reader.onload = (ev) => { const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); const max = 800; let w = img.width, h = img.height; if (w > h) { if (w > max) { h *= max/w; w = max; } } else { if (h > max) { w *= max/h; h = max; } } c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); setMediaTanahModal(p => ({...p, file, preview: c.toDataURL('image/jpeg', 0.6), isVideo: false})); }; img.src = ev.target.result; }; reader.readAsDataURL(file);
    } else { setMediaTanahModal(p => ({...p, file, preview: URL.createObjectURL(file), isVideo: true})); }
  };

  const uploadMediaTanahToCloud = async () => {
      if (!mediaTanahModal.file || !mediaTanahModal.item) return; 
      const { file, item, isVideo } = mediaTanahModal;
      setStatus({ ...status, loading: true });
      try {
          setMediaTanahModal(p => ({...p, uploading: true, progress: 0})); 
          const safeId = item.id || item.kib.replace(/[^a-zA-Z0-9]/g, '_'); 
          const storageRef = ref(storage, `artifacts/${appId}/public/data/tanah/${safeId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`); 
          
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          
          const updateData = isVideo ? { videoUrl: downloadURL } : { photoUrl: downloadURL }; 
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tanah', safeId), { ...updateData, updatedAt: serverTimestamp() }, { merge: true }); 
          
          setMediaTanahModal({ show: false, item: null, file: null, preview: null, isVideo: false, uploading: false, progress: 0, viewOnlyUrl: '', viewOnlyType: '' }); 
          customAlert("Berhasil", "Media tanah berhasil disimpan."); 
      } catch (err) { 
          console.error(err);
          customAlert("Upload Gagal", `Pesan Error: ${err.message}. Pastikan Firebase Storage Rules & konfigurasi CORS sudah diatur.`);
          setMediaTanahModal(p => ({...p, uploading: false})); 
      }
      setStatus({ ...status, loading: false });
  };

  const handleUpdateTanahInfo = async (form, item) => {
      if (!item) return;
      let editorName = ''; 
      if (form.password === 'SugengR') editorName = 'Sugeng Riyanto'; 
      else if (form.password === 'AchmarA') editorName = 'Achmar Adrian'; 
      else { customAlert("Gagal", "Password salah."); return; }
      setStatus({ ...status, loading: true });
      try {
          const safeId = item.id || item.kib.replace(/[^a-zA-Z0-9]/g, '_');
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tanah', safeId), { 
              kib: safeString(form.kib), deskripsi: safeString(form.deskripsi), tgl_peroleh: safeString(form.tgl_peroleh), 
              luas: safeString(form.luas), alamat: safeString(form.alamat), status_hak: safeString(form.status_hak), 
              penggunaan: safeString(form.penggunaan), petugas: safeString(form.petugas), tlp_petugas: safeString(form.tlp), 
              gmaps: safeString(form.gmaps), biaya_pengurusan: safeString(form.biaya_pengurusan), penerimaan_pad: safeString(form.penerimaan_pad),
              tarif_retribusi: safeString(form.tarif_retribusi), total_tarif: safeString(form.total_tarif), satuan_tarif: safeString(form.satuan_tarif),
              lastEditedBy: editorName, lastEditedAt: serverTimestamp(), updatedAt: serverTimestamp() 
          }, { merge: true });
          setEditTanahModal({ show: false, item: null }); 
          customAlert("Berhasil", "Semua data berhasil tersimpan.");
      } catch (e) { customAlert("Gagal", "Kesalahan saat menyimpan."); } setStatus({ ...status, loading: false });
  };

  const handleTemplateUpload = (e, type) => {
      const file = e.target.files[0]; if(!file) return; const reader = new FileReader();
      reader.onload = async (ev) => { setStatus({...status, loading: true}); try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'templates_doc', activeUnitView), { [type]: ev.target.result, updatedAt: serverTimestamp() }, {merge: true}); customAlert("Berhasil", `Template diperbarui!`); } catch(err) {} setStatus({...status, loading: false}); e.target.value = ''; }; reader.readAsText(file);
  };

  const handleUploadRkbmdTemplate = (e) => {
      const file = e.target.files[0]; if(!file || !window.XLSX) return; const reader = new FileReader();
      reader.onload = (ev) => { const wb = window.XLSX.read(ev.target.result, {type: 'binary'}); const ws = wb.Sheets[wb.SheetNames[0]]; const headers = window.XLSX.utils.sheet_to_json(ws, {header: 1})[0]; setRkbmdTemplateHeaders(headers); customAlert("Template Aktif", "Format Excel dimuat."); }; reader.readAsBinaryString(file);
  };

  const handleExportSuratJalan = async () => {
      if (!suratJalanForm.kendaraanId || !suratJalanForm.tujuan || !suratJalanForm.pengemudi || !suratJalanForm.pengurusId) {
          return customAlert("Gagal", "Lengkapi data pengemudi, kendaraan, tujuan, dan pengurus barang.");
      }
      const kendaraan = vehicleItems.find(v => v.no_kartu === suratJalanForm.kendaraanId);
      if (!kendaraan) return;

      const kasubbag = (filteredPegawaiData || []).find(p => safeString(p.nama).toLowerCase().includes('indira dwigus')) || { nama: 'INDIRA DWIGUS KIRANA, S.E., M.A.', nip: '19830825 201001 2 015' };
      const pengurus = pengurusOptions.find(p => p.nip === suratJalanForm.pengurusId) || { nama: 'Pengurus Barang', nip: suratJalanForm.pengurusId };
      const tglCetak = new Date(suratJalanForm.tglBerangkat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><style>body{font-family:'Times New Roman';font-size:12pt;line-height:1.5} .text-center{text-align:center;} .bold{font-weight:bold;} table{width:100%; border-collapse:collapse; margin: 20px 0;} th,td{padding:8px;}</style></head>
      <body>
          <h3 class="text-center bold" style="text-decoration: underline;">SURAT TUGAS / IZIN PENGGUNAAN KENDARAAN DINAS</h3>
          <p class="text-center">Nomor : ....................................</p><br/>
          <p>Yang bertanda tangan di bawah ini:</p>
          <table style="border:none;">
              <tr><td style="width:150px;border:none;">Nama</td><td style="width:10px;border:none;">:</td><td style="border:none;"><b>${safeString(kasubbag.nama)}</b></td></tr>
              <tr><td style="border:none;">NIP</td><td style="border:none;">:</td><td style="border:none;">${safeString(kasubbag.nip)}</td></tr>
              <tr><td style="border:none;">Jabatan</td><td style="border:none;">:</td><td style="border:none;">Kepala Sub Bagian Umum dan Kepegawaian</td></tr>
          </table>
          <p>Memberikan izin penggunaan kendaraan dinas kepada:</p>
          <table style="border:none;">
              <tr><td style="width:150px;border:none;">Nama Pengemudi</td><td style="width:10px;border:none;">:</td><td style="border:none;"><b>${safeString(suratJalanForm.pengemudi)}</b></td></tr>
              <tr><td style="border:none;">Kendaraan / Merk</td><td style="border:none;">:</td><td style="border:none;">${safeString(kendaraan.nama)} / ${safeString(kendaraan.merk || '-')}</td></tr>
              <tr><td style="border:none;">Nomor Polisi</td><td style="border:none;">:</td><td style="border:none;">${safeString(kendaraan.no_kartu)}</td></tr>
          </table>
          <p>Untuk melaksanakan tugas kedinasan dengan rincian sebagai berikut:</p>
          <table style="border:none;">
              <tr><td style="width:150px;border:none;">Tujuan</td><td style="width:10px;border:none;">:</td><td style="border:none;">${safeString(suratJalanForm.tujuan)}</td></tr>
              <tr><td style="border:none;">Waktu Perjalanan</td><td style="border:none;">:</td><td style="border:none;">${safeString(suratJalanForm.waktu)}</td></tr>
              <tr><td style="border:none;">Tanggal Berangkat</td><td style="border:none;">:</td><td style="border:none;">${safeString(tglCetak)}</td></tr>
          </table>
          <p>Demikian surat tugas/izin ini dibuat untuk dilaksanakan dengan penuh tanggung jawab.</p>
          <br/><br/>
          <table style="border:none; width: 100%;">
              <tr>
                  <td style="border:none; text-align:center; width:50%; vertical-align:top;">
                      Yang Menerima,<br/>Pengemudi<br/><br/><br/><br/><br/>
                      <b><u>${safeString(suratJalanForm.pengemudi)}</u></b>
                  </td>
                  <td style="border:none; text-align:center; width:50%; vertical-align:top;">
                      Surabaya, ${tglCetak}<br/>Yang Menyerahkan,<br/>Pengurus Barang<br/><br/><br/><br/><br/>
                      <b><u>${safeString(pengurus.nama)}</u></b><br/>NIP. ${safeString(pengurus.nip)}
                  </td>
              </tr>
              <tr>
                  <td colspan="2" style="border:none; text-align:center; vertical-align:top; padding-top: 40px;">
                      Mengetahui,<br/>Kepala Sub Bagian Umum dan Kepegawaian<br/><br/><br/><br/><br/>
                      <b><u>${safeString(kasubbag.nama)}</u></b><br/>NIP. ${safeString(kasubbag.nip)}
                  </td>
              </tr>
          </table>
      </body></html>`;
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      if (window.saveAs) window.saveAs(blob, `Surat_Jalan_${safeString(kendaraan.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_')}.doc`); 
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Surat_Jalan_${safeString(kendaraan.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_')}.doc`; a.click(); }

      setStatus({ ...status, loading: true });
      try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'histori'), {
              unitId: activeUnitView,
              type: 'SURAT JALAN',
              itemName: safeString(kendaraan.nama),
              no_kartu: safeString(kendaraan.no_kartu),
              senderName: pengurus.nama,
              receiverName: suratJalanForm.pengemudi,
              tujuan: suratJalanForm.tujuan,
              waktu: suratJalanForm.waktu,
              tglBerangkat: tglCetak,
              tglBerangkatRaw: suratJalanForm.tglBerangkat,
              timestamp: serverTimestamp()
          });
          customAlert("Berhasil", "Surat jalan berhasil dicetak dan dicatat di riwayat pemakaian.");
      } catch(e) {
          console.error(e);
      }
      setStatus({ ...status, loading: false });
  };

  const handleExportTanah = () => {
      if (!window.XLSX) return customAlert("Tunggu", "Loading Excel...");
      const rows = filteredTanahDataForView.map(t => ({ 
          "KIB / Nomor": safeString(t.kib), "Deskripsi / Jenis": safeString(t.deskripsi), "Tgl Peroleh": getSafeDateString(t.tgl_peroleh).split('T')[0], 
          "Luas (m2)": safeString(t.luas), "Alamat Lengkap": safeString(t.alamat), "Status Hak": safeString(t.status_hak), 
          "Penggunaan": safeString(t.penggunaan), "Petugas PIC": safeString(t.petugas), "Telp": safeString(t.tlp_petugas),
          "Biaya Pengurusan/Thn": safeString(t.biaya_pengurusan), "Penerimaan PAD/Thn": safeString(t.penerimaan_pad),
          "Tarif Retribusi": safeString(t.tarif_retribusi), "Satuan Tarif": safeString(t.satuan_tarif), "Total Tarif Jika Disewakan": safeString(t.total_tarif)
      }));
      const ws = window.XLSX.utils.json_to_sheet(rows); const wb = window.XLSX.utils.book_new(); window.XLSX.utils.book_append_sheet(wb, ws, "Tanah"); window.XLSX.writeFile(wb, `Inventaris_Tanah_${UNIT_LABELS[activeUnitView].replace(/ /g, '_')}.xlsx`);
  };

  const handleExportWordSPPBI = (single) => {
      let targets = single ? [single] : (filteredPegawaiData || []).filter(p => p.items && p.items.length > 0);
      if (targets.length === 0) return customAlert("Kosong", "Data kosong.");
      let html = '';
      if (!templates.sppbi) { html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>body{font-family:'Times New Roman';font-size:12pt}table{border-collapse:collapse;width:100%;margin-bottom:20px}th,td{border:1px solid #000;padding:5px}</style></head><body>`; }
      targets.forEach((p, i) => {
         let userItemsToShow = p.items || [];
         userItemsToShow = userItemsToShow.filter(it => !safeString(it.nama).toUpperCase().includes("DINAS PERKEBUNAN"));

         if (userItemsToShow.length === 0) return;

         let tableRows = userItemsToShow.map((it,idx) => {
             let pItem = Object.values(priceData || {}).find(x => safeString(x.no_kartu) === safeString(it.no_kartu) && safeString(it.no_kartu) !== '');
             if (!pItem) pItem = Object.values(priceData || {}).find(x => safeString(x.nama).toLowerCase() === safeString(it.nama).toLowerCase() && safeString(x.lokasi).toLowerCase() === safeString(p.nama).toLowerCase());
             const mergedNoKartu = it.no_kartu || pItem?.no_kartu || '-'; const mergedTahun = it.tahun || pItem?.tgl_pengadaan || pItem?.tahun || '-'; const mergedMerk = (it.merk && it.merk !== '-') ? it.merk : (pItem?.merk || '-');
             return `<tr><td style="text-align:center">${idx+1}</td><td>${safeString(mergedNoKartu)}</td><td>${safeString(it.nama)}</td><td>${safeString(mergedMerk)}</td><td style="text-align:center">${safeString(mergedTahun)}</td></tr>`;
         }).join('');
         if (templates.sppbi) {
             if (i > 0) html += `<br style="page-break-before:always">`;
             html += templates.sppbi.replace(/\{\{NAMA\}\}/g, safeString(p.nama)).replace(/\{\{NIP\}\}/g, safeString(p.nip)).replace(/\{\{JABATAN\}\}/g, safeString(p.jabatan)).replace(/\{\{TABLE_ROWS\}\}/g, tableRows).replace(/\{\{TANGGAL\}\}/g, new Date().toLocaleDateString('id-ID'));
         } else {
             if (i > 0) html += `<br style="page-break-before:always">`;
             html += `<h3 style="text-align:center">SURAT PERNYATAAN PENGUASAAN BARANG INVENTARIS (SPPBI)</h3><p>Nama: ${safeString(p.nama)}<br>NIP: ${safeString(p.nip)}<br>Jabatan: ${safeString(p.jabatan)}</p><p>Bertanggung jawab penuh atas barang-barang berikut:</p><table><thead><tr><th>No</th><th>No Kartu</th><th>Nama Barang</th><th>Merk</th><th>Tahun</th></tr></thead><tbody>${tableRows}</tbody></table><br><br><p style="text-align:right">Surabaya, ${new Date().toLocaleDateString('id-ID')}<br><br><br><b>${safeString(p.nama)}</b></p>`;
         }
      });
      if (!templates.sppbi) html += `</body></html>`;
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      if (window.saveAs) window.saveAs(blob, "SPPBI.doc"); else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "SPPBI.doc"; a.click(); }
  };

  const handleExportKIRWord = (roomName) => {
       const roomData = (filteredRuanganData || []).find(r => r.nama_ruangan === roomName);
       if (!roomData || !roomData.items || roomData.items.length === 0) return customAlert("Kosong", "Data kosong.");
       const groupedItems = {};
       roomData.items.forEach(it => { const key = `${it.nama}_${it.merk}`; if (!groupedItems[key]) groupedItems[key] = { ...it, volume: 0 }; groupedItems[key].volume += 1; });
       const itemsToPrint = Object.values(groupedItems);
       const kasubag = (filteredPegawaiData || []).find(p => p.nama && safeString(p.nama).toLowerCase().includes('indira dwigus')) || { nama: 'INDIRA DWIGUS KIRANA', nip: '............................' };
       const pengurus = (filteredPegawaiData || []).find(p => p.nama && safeString(p.nama).toLowerCase().includes('sugeng riyanto')) || { nama: 'SUGENG RIYANTO', nip: '............................' };
       const tglCetak = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
       let tableRows = itemsToPrint.map((it, idx) => `<tr><td class="text-center">${idx + 1}</td><td>${safeString(it.nama)}</td><td>${safeString(it.merk || '-')}</td><td class="text-center">${safeString(it.volume)}</td><td></td><td></td></tr>`).join('');
       let html = '';
       if (templates.kir) { html = templates.kir.replace(/\{\{ROOM_NAME\}\}/g, safeString(roomName)).replace(/\{\{KASUBAG_NAMA\}\}/g, safeString(kasubag.nama)).replace(/\{\{KASUBAG_NIP\}\}/g, safeString(kasubag.nip)).replace(/\{\{PENGURUS_NAMA\}\}/g, safeString(pengurus.nama)).replace(/\{\{PENGURUS_NIP\}\}/g, safeString(pengurus.nip)).replace(/\{\{TABLE_ROWS\}\}/g, tableRows).replace(/\{\{TANGGAL\}\}/g, tglCetak); } 
       else { html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>body{font-family:'Arial', sans-serif; font-size: 11pt;} .header-table{width: 100%; border-collapse: collapse; margin-bottom: 20px;} .header-table th, .header-table td{border: 1px solid black; padding: 5px; text-align: left; vertical-align: middle;} .text-center{text-align: center;} .bold{font-weight: bold;} .main-table{width: 100%; border-collapse: collapse;} .main-table th, .main-table td{border: 1px solid black; padding: 5px;} .title{font-size: 14pt; font-weight: bold; text-align: center; margin: 20px 0; text-transform: uppercase;}</style></head><body><table class="header-table"><tr><td rowspan="4" width="15%" class="text-center"><b>[LOGO]</b></td><td rowspan="1" colspan="2" class="text-center bold">DINAS PERKEBUNAN PROVINSI JAWA TIMUR</td><td width="15%">No. Dokumen</td><td width="20%">: </td></tr><tr><td rowspan="3" width="15%" class="text-center bold">FORM</td><td rowspan="3" class="text-center bold">Kartu Inventaris Ruangan</td><td>Terbitan/Revisi</td><td>: </td></tr><tr><td>Tanggal Terbit</td><td>: </td></tr><tr><td>Halaman</td><td>: -</td></tr></table><div class="title">${safeString(roomName)}</div><table class="main-table"><thead><tr><th rowspan="2" width="5%" class="text-center">No</th><th rowspan="2" width="30%" class="text-center">Nama Barang/Jasa</th><th rowspan="2" width="35%" class="text-center">Spesifikasi Teknis</th><th rowspan="2" width="10%" class="text-center">Volume</th><th colspan="2" width="20%" class="text-center">Kondisi</th></tr><tr><th class="text-center">Layak</th><th class="text-center">Tidak Layak</th></tr></thead><tbody>${tableRows}${Array.from({length: Math.max(0, 15 - itemsToPrint.length)}).map((_, i) => `<tr><td class="text-center">${itemsToPrint.length + i + 1}</td><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>`).join('')}</tbody></table><br/><br/><table style="border:none; width: 100%;"><tr><td style="border:none; text-align:center; width:50%; vertical-align:top;">Mengetahui,<br/>Kepala Sub Bagian Umum dan Kepegawaian<br/><br/><br/><br/><br/><b><u>${safeString(kasubag.nama)}</u></b><br/>NIP. ${safeString(kasubag.nip)}</td><td style="border:none; text-align:center; width:50%; vertical-align:top;">Surabaya, ${tglCetak}<br/>Pengurus Barang<br/><br/><br/><br/><br/><b><u>${safeString(pengurus.nama)}</u></b><br/>NIP. ${safeString(pengurus.nip)}</td></tr></table></body></html>`; }
       const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
       if (window.saveAs) window.saveAs(blob, `KIR.doc`); else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `KIR.doc`; a.click(); }
  };

  const handleExportExcel = (type) => {
       if (!window.XLSX) return customAlert("Tunggu", "Loading Excel...");
       const rows = monitoringDataFiltered.map(item => ({ _active: item._active, _disposal: item._disposal, "No Kartu": item.no_kartu || '-', "Nama Barang": item.nama, "Lokasi/Pemegang": item.ruangan !== '-' ? `Ruang: ${item.ruangan}` : (item.pemegang !== '-' ? `Pegawai: ${item.pemegang}` : (item.lokasi || '-')), "Tgl Pengadaan": formatDisplayDate(getSafeDateString(item.tgl_pengadaan)), "Nilai Perolehan": item.nilai_perolehan, "Nilai Buku": item._active ? item.nilai_buku : 0, "Tgl Expired": formatDisplayDate(getSafeDateString(item.tgl_habis)), "Status": item.manual_active ? "DIPERPANJANG" : (item.isExpired ? "HABIS" : "AKTIF"), "Foto": item.photoBase64 ? "ADA" : "TIDAK" }));
       let final = []; if (type === 'all') final = rows; if (type === 'active') final = rows.filter(r => r._active); if (type === 'disposal') final = rows.filter(r => r._disposal);
       if (final.length === 0) return customAlert("Kosong", "Data kosong.");
       const ws = window.XLSX.utils.json_to_sheet(final.map(({_active,_disposal,...r})=>r)); const wb = window.XLSX.utils.book_new(); window.XLSX.utils.book_append_sheet(wb, ws, `Data Aset`); window.XLSX.writeFile(wb, `Laporan_${type}_${UNIT_LABELS[activeUnitView].replace(/ /g, '_')}.xlsx`);
  };

  const handleExportRkbmd = (bidang) => {
      if (displayedRkbmdData.length === 0) return customAlert("Kosong", "Data kosong.");
      
      const targetYear = rkbmdSelectedYear !== 'Semua' ? rkbmdSelectedYear : new Date().getFullYear();

      let tableRows = displayedRkbmdData.map((r, i) => `
          <tr>
              <td class="text-center">${i + 1}</td>
              <td class="text-left">${safeString(r.program)}</td>
              <td class="text-left" style="mso-number-format:'\\@'">${safeString(r.usulan_kode || r.kode_barang)}</td>
              <td class="text-left">${safeString(r.usulan_nama || r.nama_barang)}</td>
              <td class="text-center">${safeString(r.usulan_jumlah || r.jumlah)}</td>
              <td class="text-center">${safeString(r.usulan_satuan || r.satuan)}</td>
              <td class="text-center">${safeString(r.max_jumlah)}</td>
              <td class="text-center">${safeString(r.max_satuan)}</td>
              <td class="text-left" style="mso-number-format:'\\@'">${safeString(r.opt_kode)}</td>
              <td class="text-left">${safeString(r.opt_nama)}</td>
              <td class="text-center">${safeString(r.opt_jumlah)}</td>
              <td class="text-center">${safeString(r.opt_satuan)}</td>
              <td class="text-center">${safeString(r.riil_jumlah)}</td>
              <td class="text-center">${safeString(r.riil_satuan)}</td>
              <td class="text-left">${safeString(r.keterangan || r.alasan)}</td>
          </tr>
      `).join('');

      const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
          <meta charset="utf-8">
          <style>
              body { font-family: 'Arial', sans-serif; font-size: 10pt; }
              .text-center { text-align: center; }
              .text-left { text-align: left; }
              .bold { font-weight: bold; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid black; padding: 4px; vertical-align: top; }
              th { text-align: center; font-weight: bold; background-color: #f3f4f6; vertical-align: middle; }
              .no-border { border: none !important; }
          </style>
      </head>
      <body>
          <table class="no-border" style="margin-bottom: 20px; border: none;">
              <tr><td class="no-border bold" colspan="2">PEMERINTAH PROVINSI</td><td class="no-border bold" colspan="13">: JAWA TIMUR</td></tr>
              <tr><td class="no-border bold" colspan="2">KABUPATEN/KOTA</td><td class="no-border bold" colspan="13">: SURABAYA</td></tr>
              <tr><td class="no-border"></td></tr>
              <tr><td class="no-border text-center bold" colspan="15" style="font-size: 14pt;">USULAN RENCANA KEBUTUHAN PENGADAAN BARANG MILIK DAERAH</td></tr>
              <tr><td class="no-border text-center bold" colspan="15" style="font-size: 12pt;">DINAS PERKEBUNAN PROVINSI JAWA TIMUR</td></tr>
              <tr><td class="no-border text-center bold" colspan="15" style="font-size: 12pt;">TAHUN ${targetYear}</td></tr>
              <tr><td class="no-border" colspan="15"></td></tr>
          </table>

          <table>
              <thead>
                  <tr>
                      <th rowspan="2" style="width: 40px;">No.</th>
                      <th rowspan="2" style="width: 250px;">Program/Kegiatan<br/>/OutPut</th>
                      <th colspan="4">Usulan BMD</th>
                      <th colspan="2">Kebutuhan Maksimum</th>
                      <th colspan="4">Data Daftar Barang yang dapat dioptimalkan</th>
                      <th colspan="2">Kebutuhan Riil</th>
                      <th rowspan="2" style="width: 200px;">Keterangan</th>
                  </tr>
                  <tr>
                      <th style="width: 150px;">Kode Barang</th>
                      <th style="width: 200px;">Nama Barang</th>
                      <th style="width: 70px;">Jumlah</th>
                      <th style="width: 80px;">Satuan</th>
                      <th style="width: 70px;">Jumlah</th>
                      <th style="width: 80px;">Satuan</th>
                      <th style="width: 150px;">Kode Barang</th>
                      <th style="width: 200px;">Nama Barang</th>
                      <th style="width: 70px;">Jumlah</th>
                      <th style="width: 80px;">Satuan</th>
                      <th style="width: 70px;">Jumlah</th>
                      <th style="width: 80px;">Satuan</th>
                  </tr>
                  <tr style="background-color: #e5e7eb;">
                      <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th><th>13</th><th>14</th><th>15</th>
                  </tr>
              </thead>
              <tbody>
                  ${tableRows}
              </tbody>
          </table>
      </body>
      </html>
      `;

      const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' });
      const fileName = `RKBMD_${bidang}_${targetYear}.xls`;
      
      if (window.saveAs) {
          window.saveAs(blob, fileName);
      } else {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = fileName;
          a.click();
      }
  };

  const handleExportPajak = () => {
      if (!window.XLSX) return customAlert("Tunggu", "Loading Excel...");
      if (vehicleItems.length === 0) return customAlert("Kosong", "Data kendaraan kosong.");
      
      const rows = vehicleItems.map((it, i) => {
          const tglMasa = parseDateRobust(getSafeDateString(it.tgl_pajak) || getSafeDateString(it.tgl_pengadaan));
          let diffDays = 0, status = 'AMAN';
          if (tglMasa) {
              diffDays = Math.ceil((tglMasa - new Date()) / 86400000);
              if (diffDays < 0) status = 'LEWAT WAKTU';
              else if (diffDays <= 30) status = `H-${diffDays} (WARNING)`;
          }
          return {
              "No": i + 1,
              "Nama Kendaraan": safeString(it.nama),
              "Nomor Polisi": safeString(it.no_kartu),
              "Pemegang / Lokasi": it.pemegang !== '-' ? safeString(it.pemegang) : (it.ruangan !== '-' ? safeString(it.ruangan) : safeString(it.lokasi || 'N/A')),
              "Tgl Pajak (Masa Berlaku)": tglMasa ? tglMasa.toLocaleDateString('id-ID') : '-',
              "Status": status,
              "Ada Foto Kendaraan": it.photoBase64 ? 'Ya' : 'Tidak',
              "Ada Bukti Bayar (Tahun Dipilih)": it.pajak_history?.[pajakSelectedYear] ? 'Ya' : 'Tidak'
          };
      });

      const ws = window.XLSX.utils.json_to_sheet(rows);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "Data Pajak Kendaraan");
      window.XLSX.writeFile(wb, `Laporan_Pajak_Kendaraan_${UNIT_LABELS[activeUnitView].replace(/ /g, '_')}.xlsx`);
  };

  const handleExportWordSPPBIVehicle = (item) => {
      const locStr = item.pemegang !== '-' ? item.pemegang : (item.ruangan !== '-' ? item.ruangan : item.lokasi);
      const ownerPegawai = (data || []).find(p => safeString(p.nama).toLowerCase() === safeString(locStr).toLowerCase()) || { nama: locStr, nip: '............................', jabatan: '............................' };
      
      let html = '';
      if (!templates.sppbi) { 
          html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>body{font-family:'Times New Roman';font-size:12pt}table{border-collapse:collapse;width:100%;margin-bottom:20px}th,td{border:1px solid #000;padding:5px}</style></head><body>`; 
      }
      
      const mergedNoKartu = safeString(item.no_kartu) || '-'; 
      const mergedTahun = safeString(item.tahun || item.tgl_pengadaan) || '-'; 
      const mergedMerk = safeString(item.merk) || '-';
      
      const tableRows = `<tr><td style="text-align:center">1</td><td>${mergedNoKartu}</td><td>${safeString(item.nama)}</td><td>${mergedMerk}</td><td style="text-align:center">${mergedTahun}</td></tr>`;
      
      if (templates.sppbi) {
          html += templates.sppbi.replace(/\{\{NAMA\}\}/g, safeString(ownerPegawai.nama)).replace(/\{\{NIP\}\}/g, safeString(ownerPegawai.nip)).replace(/\{\{JABATAN\}\}/g, safeString(ownerPegawai.jabatan)).replace(/\{\{TABLE_ROWS\}\}/g, tableRows).replace(/\{\{TANGGAL\}\}/g, new Date().toLocaleDateString('id-ID'));
      } else {
          html += `<h3 style="text-align:center">SURAT PERNYATAAN PENGUASAAN BARANG INVENTARIS (SPPBI)<br/>KENDARAAN DINAS</h3><p>Nama: ${safeString(ownerPegawai.nama)}<br>NIP: ${safeString(ownerPegawai.nip)}<br>Jabatan: ${safeString(ownerPegawai.jabatan)}</p><p>Bertanggung jawab penuh atas kendaraan dinas berikut:</p><table><thead><tr><th>No</th><th>No Polisi / Kartu</th><th>Nama Kendaraan</th><th>Merk</th><th>Tahun</th></tr></thead><tbody>${tableRows}</tbody></table><br><br><p style="text-align:right">Surabaya, ${new Date().toLocaleDateString('id-ID')}<br><br><br><b>${safeString(ownerPegawai.nama)}</b></p>`;
      }
      
      if (!templates.sppbi) html += `</body></html>`;
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      if (window.saveAs) window.saveAs(blob, `SPPBI_Kendaraan_${safeString(item.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_')}.doc`); else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `SPPBI_Kendaraan_${safeString(item.no_kartu).replace(/[^a-zA-Z0-9.-]/g, '_')}.doc`; a.click(); }
  };

  const handleExportRekapPengguna = () => {
       if (!window.XLSX) return customAlert("Tunggu", "Loading Excel...");

       const getYear = (it) => {
           const y = parseDateRobust(getSafeDateString(it.tgl_pengadaan))?.getFullYear()?.toString() || safeString(it.tgl_pengadaan || it.tahun || '');
           return y.length > 4 ? y.substring(0, 4) : y;
       };

       let filteredData = activeMonitoringData;
       if (monitoringSelectedYear !== 'Semua') {
           filteredData = filteredData.filter(it => getYear(it) === monitoringSelectedYear);
       }

       if (filteredData.length === 0) return customAlert("Kosong", "Data kosong pada filter tahun tersebut.");

       const asetKendaraan = [];
       const asetBarang = [];

       filteredData.forEach(it => {
           const n = safeString(it.nama).toLowerCase();
           const isVehicle = (n.includes('motor') || n.includes('mobil') || n.includes('kendaraan') || n.includes('truk') || n.includes('jeep') || n.includes('pick up')) && !n.includes('kursi roda') && !n.includes('roda dorong');
           
           const baseObj = {
               "BIDANG PENGADAAN": it.ruangan !== '-' ? UNIT_LABELS[activeUnitView] : safeString(it.skpd),
               "TAHUN": getYear(it),
               "MERK": safeString(it.merk || '-'),
               "TYPE/MODEL": safeString(it.nama),
               "KONDISI": "BAIK",
               "PENGGUNA / LOKASI": it.ruangan !== '-' ? safeString(it.ruangan) : safeString(it.pemegang)
           };

           if (isVehicle || it.tgl_pajak) {
               asetKendaraan.push({
                   ...baseObj,
                   "NOMOR POLISI": safeString(it.no_kartu),
                   "TGL PAJAK": formatDisplayDate(getSafeDateString(it.tgl_pajak) || getSafeDateString(it.tgl_pengadaan))
               });
           } else {
               asetBarang.push({
                   ...baseObj,
                   "NO KARTU / KODE": safeString(it.no_kartu)
               });
           }
       });

       const sortAndMap = (arr) => {
           arr.sort((a,b) => {
               if (a["BIDANG PENGADAAN"] < b["BIDANG PENGADAAN"]) return -1;
               if (a["BIDANG PENGADAAN"] > b["BIDANG PENGADAAN"]) return 1;
               if (a["PENGGUNA / LOKASI"] < b["PENGGUNA / LOKASI"]) return -1;
               if (a["PENGGUNA / LOKASI"] > b["PENGGUNA / LOKASI"]) return 1;
               return 0;
           });
           return arr.map((x, i) => ({"NO": i + 1, ...x}));
       };

       const finalKendaraan = sortAndMap(asetKendaraan);
       const finalBarang = sortAndMap(asetBarang);

       const wb = window.XLSX.utils.book_new();
       if (finalBarang.length > 0) window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(finalBarang), "Rekap Barang Inventaris");
       if (finalKendaraan.length > 0) window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(finalKendaraan), "Rekap Kendaraan Dinas");

       const yearLabel = monitoringSelectedYear !== 'Semua' ? monitoringSelectedYear : 'Semua_Tahun';
       window.XLSX.writeFile(wb, `Rekap_Aset_${yearLabel}_${UNIT_LABELS[activeUnitView].replace(/ /g, '_')}.xlsx`);
  };

  const menuItems = [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true }, 
      { id: 'data', icon: Users, label: 'Database Pegawai', show: true }, 
      { id: 'ruangan', icon: Building2, label: 'Inventaris Ruangan', show: true }, 
      { id: 'pajak', icon: Car, label: 'Pajak Kendaraan', show: userRole !== 'staff' }, 
      { id: 'rkbmd', icon: FilePlus, label: 'Usulan RKBMD', show: userRole !== 'staff' }, 
      { id: 'tanah', icon: MapIcon, label: 'Inventaris Tanah', show: userRole === 'admin' || (userRole === 'admin_upt' && userUnit === UNIT_CODES.P2BTP) }, 
      { id: 'surat-kendaraan', icon: FileKey, label: 'Surat Perjalanan Dinas', show: (userRole === 'admin' && activeUnitView === UNIT_CODES.PUSAT) || userRole === 'staff' },
      { id: 'history', icon: HistoryIcon, label: 'Riwayat Mutasi', show: true }, 
      { id: 'monitoring', icon: Search, label: 'Monitoring Aset', show: true }, 
      { id: 'penghapusan', icon: Trash2, label: 'Usulan Penghapusan', show: userRole === 'admin' || userRole === 'admin_upt' }, 
      { id: 'laporan', icon: FileDown, label: 'Laporan & Ekspor', show: userRole !== 'staff' },
      { id: 'ulasan', icon: Star, label: 'Ulasan Aplikasi', show: userRole === 'admin' }
  ];

  // --- RENDERING ---
  if (!isLoggedIn) {
      return (
        <div className={`min-h-screen flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-900 text-white' : 'bg-slate-100'}`}>
          <div className={`w-full max-w-5xl rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px] ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
             <div className="w-full md:w-1/2 bg-emerald-700 p-8 md:p-12 text-white flex flex-col justify-center relative">
                <div className="relative z-10"><div className="flex items-center mb-6 text-white"><Globe size={48} /><Leaf size={40} className="-ml-3 mt-4 text-emerald-300" /></div><h1 className="text-4xl md:text-5xl font-black mb-4">INVEN<br/>SBUN.ID</h1><p className="opacity-80">Sistem Manajemen Aset Terintegrasi</p></div>
             </div>
             <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative">
                <button onClick={()=>setIsDarkMode(!isDarkMode)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-emerald-100">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
                <h2 className={`text-3xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Login Portal</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase">Username / NIP Pegawai</label><input type="text" className={`w-full p-4 rounded-xl border outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50'}`} value={loginCreds.username} onChange={e=>setLoginCreds({...loginCreds, username:e.target.value})} placeholder="Masukkan Username / NIP" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase">Password</label><input type="password" className={`w-full p-4 rounded-xl border outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50'}`} value={loginCreds.password} onChange={e=>setLoginCreds({...loginCreds, password:e.target.value})} placeholder="Masukkan Password" /></div>
                  {loginError && <p className="text-red-500 text-sm font-bold">{loginError}</p>}
                  <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold uppercase hover:bg-emerald-500 transition-all shadow-lg">Masuk</button>
                </form>
             </div>
          </div>
        </div>
      );
  }

  return (
    <div className={`min-h-screen flex font-sans overflow-hidden relative transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-900 text-white' : 'bg-[#FDFDFD] text-slate-900'}`}>
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <aside className={`w-80 border-r flex flex-col p-8 fixed h-full z-40 transition-transform transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
         <div className="flex items-center justify-between mb-10"><div className="flex items-center gap-4"><div className="p-3 bg-emerald-600 rounded-2xl text-white flex items-center"><Globe size={24}/><Leaf size={20} className="-ml-2 mt-2 text-emerald-300"/></div><div><h1 className="font-black text-xl">INVENSBUN</h1><p className="text-[10px] font-black text-emerald-500 tracking-widest">{safeString(userRole).toUpperCase()}</p></div></div><button className="md:hidden p-2 text-slate-400" onClick={() => setIsMobileMenuOpen(false)}><X/></button></div>
         <nav className="space-y-2 flex-grow overflow-y-auto pb-4 custom-scrollbar">
             {menuItems.filter(m => m.show !== false).map(m => (<button key={m.id} onClick={() => { setActiveTab(m.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === m.id ? 'bg-emerald-600 text-white shadow-lg' : (isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-50')}`}><m.icon size={20} /> {m.label}</button>))}
         </nav>
         <div className={`mt-4 pt-4 border-t space-y-3 ${isDarkMode ? 'border-slate-700' : ''}`}>
             <button onClick={() => setModals({...modals, feedback: true})} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${isDarkMode ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}><MessageSquare size={16}/> Beri Masukan</button>
             <div className="flex justify-center mb-4"><button onClick={()=>setIsDarkMode(!isDarkMode)} className={`flex w-full justify-center items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${isDarkMode ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{isDarkMode ? <Sun size={16}/> : <Moon size={16}/>} {isDarkMode ? 'Light Mode' : 'Dark Mode'}</button></div>
             {!isReadOnly && <button onClick={() => { setStatus({...status, uploadType: userRole === 'admin' ? 'pegawai' : 'prices'}); setModals({...modals, upload: true}); }} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-emerald-700"><CloudUpload size={16}/> Sync Data DB</button>}
             <button onClick={() => setIsLoggedIn(false)} className="w-full py-3 text-red-400 hover:text-red-600 font-bold text-xs uppercase flex items-center justify-center gap-2"><Lock size={14}/> Logout</button>
         </div>
      </aside>

      <main className={`flex-grow w-full md:ml-80 p-6 md:p-12 min-h-screen overflow-y-auto pb-32`}>
         <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300" onClick={() => setIsMobileMenuOpen(true)}><Menu/></button>
              <div><h2 className="text-3xl md:text-4xl font-black capitalize">{safeString(activeTab).replace('-', ' ')}</h2><p className="text-slate-400 font-bold mt-1 hidden md:block">Portal Aset & Inventaris Terintegrasi</p></div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
               {userRole === 'admin' && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                      <Building className="text-emerald-500" size={16}/>
                      <select value={activeUnitView} onChange={e => setActiveUnitView(e.target.value)} className="bg-transparent font-bold text-xs md:text-sm outline-none dark:text-white cursor-pointer">
                          {Object.entries(UNIT_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                      </select>
                  </div>
               )}
               {userRole === 'admin_upt' && (
                  <div className={`px-4 py-2 md:px-6 md:py-3 rounded-2xl border shadow-sm flex items-center gap-2 font-bold text-xs md:text-sm text-emerald-600 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                      <Building size={16}/> {UNIT_LABELS[userUnit]}
                  </div>
               )}
               <div className={`px-4 py-2 md:px-6 md:py-3 rounded-2xl border shadow-sm flex items-center gap-3 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className={`w-3 h-3 rounded-full ${status.synced ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`}></div><span className="text-[10px] md:text-xs font-bold uppercase hidden md:inline">{status.synced ? 'Online' : 'Syncing...'}</span></div>
            </div>
         </header>

         {activeTab === 'dashboard' && (
            <div className="space-y-6 md:space-y-8">
               {userRole !== 'staff' && mutasiPendingData.some(m => m.targetUnit === activeUnitView) && (
                   <div className="p-6 md:p-8 bg-indigo-50 border border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 rounded-[2rem] shadow-sm">
                       <h4 className="font-black text-indigo-800 dark:text-indigo-200 text-lg mb-4 flex items-center gap-2"><Send size={20}/> Menunggu Verifikasi Mutasi Masuk</h4>
                       <div className="space-y-3">
                           {mutasiPendingData.filter(m => m.targetUnit === activeUnitView).map(m => (
                               <div key={m.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm border border-indigo-100 dark:border-indigo-700/50">
                                   <div>
                                       <p className="font-bold text-sm md:text-base dark:text-white">{safeString(m.item.nama)}</p>
                                       <p className="text-xs text-slate-500 font-mono mt-1">No: {safeString(m.item.no_kartu) || '-'} • Dari: {safeString(m.senderName)} ({UNIT_LABELS[m.sourceUnit]})</p>
                                       {m.targetUnit === UNIT_CODES.PUSAT && m.targetBidang && <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">Tujuan Bidang: {m.targetBidang}</p>}
                                   </div>
                                   <div className="flex items-center gap-2 w-full md:w-auto">
                                       <button onClick={() => handleRejectMutasi(m)} disabled={status.loading} className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30 rounded-xl font-bold text-xs transition-colors">Tolak</button>
                                       <button onClick={() => handleApproveMutasi(m)} disabled={status.loading} className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold text-xs transition-colors shadow-md">Terima & Assign</button>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}
               {userRole === 'admin' && showDashboardAlert && (
                 (() => {
                     const expiring = Object.values(filteredPriceData).filter(item => {
                         const n = safeString(item.nama).toLowerCase();
                         const isVehicle = (n.includes('motor') || n.includes('mobil') || n.includes('kendaraan') || n.includes('truk') || n.includes('jeep') || n.includes('pick up')) && !n.includes('kursi roda') && !n.includes('roda dorong');
                         if (!isVehicle && !item.tgl_pajak) return false;
                         const d = getSafeDateString(item.tgl_pajak) || getSafeDateString(item.tgl_pengadaan);
                         if (!d) return false;
                         const tMasa = parseDateRobust(d);
                         if (!tMasa) return false;
                         return Math.ceil((tMasa - new Date()) / 86400000) <= 30;
                     });
                     if (expiring.length > 0) {
                        return (
                           <div className="bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800 p-4 md:p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm mb-6"><div className="flex items-start md:items-center gap-4"><div className="p-3 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 rounded-2xl shrink-0"><AlertTriangle size={28} /></div><div><h4 className="font-black text-red-800 dark:text-red-200 text-base md:text-lg">Peringatan Pajak Kendaraan!</h4><p className="text-xs md:text-sm text-red-600 dark:text-red-300 mt-1 font-medium">Terdapat <b className="font-black">{expiring.length} kendaraan</b> di unit ini yang masa pajaknya akan segera habis.</p></div></div><div className="flex items-center gap-2 w-full md:w-auto"><button onClick={() => setActiveTab('pajak')} className="flex-1 md:flex-none px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-red-700 shadow-lg shadow-red-200">Lihat Detail</button><button onClick={() => setShowDashboardAlert(false)} className="p-3 bg-red-100 text-red-500 rounded-xl hover:bg-red-200 shrink-0"><X size={18} /></button></div></div>
                        );
                     } return null;
                 })()
               )}

               {userRole === 'admin' && todayBookings.length > 0 && (
                   <div className="p-6 md:p-8 bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 rounded-[2rem] shadow-sm mb-6">
                       <h4 className="font-black text-blue-800 dark:text-blue-200 text-lg mb-4 flex items-center gap-2"><Car size={20}/> Aktivitas Peminjaman Kendaraan Dinas (24 Jam Terakhir)</h4>
                       <div className="space-y-3">
                           {todayBookings.map((b, idx) => (
                               <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm border border-blue-100 dark:border-blue-700/50">
                                   <div>
                                       <p className="font-bold text-sm md:text-base dark:text-white">{safeString(b.itemName)} - {safeString(b.no_kartu)}</p>
                                       <p className="text-xs text-slate-500 font-mono mt-1">Pengemudi: {safeString(b.receiverName)} • Tujuan: {safeString(b.tujuan)}</p>
                                   </div>
                                   <div className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full">
                                       Berangkat: {safeString(b.tglBerangkatRaw || b.tglBerangkat)}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}

               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                  <div className={`col-span-1 p-6 md:p-8 rounded-[2rem] shadow-xl border flex flex-col justify-center gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="p-4 bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-2xl w-max"><Users size={32}/></div><div><h3 className="text-3xl md:text-4xl font-black">{filteredPegawaiData.length}</h3><p className="text-xs font-bold text-slate-400 uppercase mt-1">Total Pegawai</p></div></div>
                  <div className={`col-span-1 lg:col-span-2 p-6 md:p-8 rounded-[2rem] shadow-xl border flex flex-col justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                     <h3 className="text-lg font-black mb-6 flex items-center gap-2"><BarChart3 className="text-emerald-500"/> Statistik Kondisi Aset ({UNIT_LABELS[activeUnitView]})</h3>
                     <div className="space-y-5">
                        <div><div className="flex justify-between text-xs font-bold mb-2"><span className="text-emerald-600 dark:text-emerald-400">Aset Aktif Digunakan ({statsAsetAktif})</span><span>{Math.round((statsAsetAktif / totalStat) * 100)}%</span></div><div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden"><div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style={{width: `${(statsAsetAktif / totalStat) * 100}%`}}></div></div></div>
                        <div><div className="flex justify-between text-xs font-bold mb-2"><span className="text-blue-600 dark:text-blue-400">Aset Re-Aktif (Habis Pakai) ({statsReAktif})</span><span>{Math.round((statsReAktif / totalStat) * 100)}%</span></div><div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden"><div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{width: `${(statsReAktif / totalStat) * 100}%`}}></div></div></div>
                        <div><div className="flex justify-between text-xs font-bold mb-2"><span className="text-red-600 dark:text-red-400">Usulan Penghapusan ({statsPenghapusan})</span><span>{Math.round((statsPenghapusan / totalStat) * 100)}%</span></div><div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden"><div className="bg-red-500 h-3 rounded-full transition-all duration-1000" style={{width: `${(statsPenghapusan / totalStat) * 100}%`}}></div></div></div>
                     </div>
                  </div>
                  <div className={`col-span-1 p-6 md:p-8 rounded-[2rem] shadow-xl border flex flex-col justify-center gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="p-4 bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 rounded-2xl w-max"><FilePlus size={32}/></div><div><h3 className="text-3xl md:text-4xl font-black">{visibleRkbmdData.length}</h3><p className="text-xs font-bold text-slate-400 uppercase mt-1">Usulan RKBMD</p></div></div>
               </div>
            </div>
         )}

         {/* --- Data Pegawai --- */}
         {activeTab === 'data' && (
            <div className="space-y-8">
               <div className="relative"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"/><input type="text" placeholder="Cari Pegawai (Ketik Nama / NIP)..." className={`w-full pl-14 p-4 md:p-5 rounded-2xl border shadow-sm outline-none font-bold text-sm md:text-base ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white'}`} onChange={handleSearchChange} value={searchTerm}/></div>
               {selectedUser ? (
                  <div className="space-y-6">
                     <div className={`rounded-[2rem] md:rounded-[3rem] border shadow-xl overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                        <div className={`p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isDarkMode ? 'border-slate-700' : ''}`}>
                           <div className="flex items-center gap-4 md:gap-6">
                              <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600"><User size={24} className="md:w-8 md:h-8"/></div>
                              <div><h3 className="text-xl md:text-2xl font-black">{safeString(selectedUser.nama)}</h3><p className="text-xs md:text-sm font-bold text-slate-400">{safeString(selectedUser.nip)}</p></div>
                           </div>
                           <div className="flex flex-wrap gap-2 w-full md:w-auto">
                              <button onClick={() => handleExportBulkLabel(selectedUser.items, selectedUser.nama)} className="px-4 py-3 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><QrCode size={16}/> Cetak Semua Label</button>
                              <button onClick={() => handleExportWordSPPBI(selectedUser)} className="px-4 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><Printer size={16}/> Cetak SPPBI</button>
                              {selectedUser.sppbiPhoto ? <button onClick={()=>{ setPhotoModal({show:true, item:null, preview:safeString(selectedUser.sppbiPhoto), file:null, isSPPBI: true, isPajak: false, isPBB: false, isRkbmdArchive: false, pajakYear: '', pbbYear: '', rkbmdMeta: null, isPdf: safeString(selectedUser.sppbiPhoto).includes('application/pdf'), isExcel: false, fileName: ''}); }} className="px-4 py-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><CheckSquare size={16}/> Lihat SPPBI</button> : (isPegawaiEditable ? <button onClick={() => setPhotoModal({show: true, item: null, preview: null, file: null, isSPPBI: true, isPajak: false, isPBB: false, isRkbmdArchive: false, pajakYear: '', pbbYear: '', rkbmdMeta: null, isPdf: false, isExcel: false, fileName: ''})} className="px-4 py-3 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><Upload size={16}/> Upload SPPBI</button> : <span className="px-4 py-3 bg-slate-50 text-slate-400 dark:bg-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs">Belum ada SPPBI</span>)}
                              {isPegawaiEditable && <button onClick={() => setModals({...modals, addItem: true})} className="px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><PlusCircle size={16}/> Tambah Aset</button>}
                           </div>
                        </div>
                     </div>

                     {/* Tabel Aset Utama (Monitoring) */}
                     <div className={`rounded-[2rem] shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                        <div className={`px-6 py-4 border-b flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-emerald-50 border-emerald-100'}`}>
                           <Database size={18} className="text-emerald-600"/>
                           <h4 className="font-black text-emerald-800 dark:text-emerald-300">Aset Utama (Terhubung Monitoring)</h4>
                        </div>
                        <div className="p-4 md:p-6 overflow-x-auto">
                           <table className="w-full text-left min-w-[750px]">
                              <thead><tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="pb-4 w-12 text-center">Foto</th><th className="pb-4">Nama Barang</th><th className="pb-4">No Kartu</th><th className="pb-4 text-center">Aksi</th></tr></thead>
                              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                                 {selectedUser.items?.filter(it => !it.isLocalOnly).length === 0 ? <tr><td colSpan="4" className="py-6 text-center text-xs font-bold text-slate-400">Tidak ada aset utama terhubung.</td></tr> :
                                 selectedUser.items?.filter(it => !it.isLocalOnly).map((it, i) => {
                                    const dataSource = priceData;
                                    let pItem = Object.values(dataSource || {}).find(x => safeString(x.no_kartu) === safeString(it.no_kartu) && safeString(it.no_kartu) !== '');
                                    if (!pItem) pItem = Object.values(dataSource || {}).find(x => safeString(x.nama).toLowerCase() === safeString(it.nama).toLowerCase() && safeString(x.lokasi).toLowerCase() === safeString(selectedUser.nama).toLowerCase());
                                    const mergedItem = { ...it, no_kartu: it.no_kartu || pItem?.no_kartu || '-', tahun: it.tahun || pItem?.tgl_pengadaan || pItem?.tahun || '-', merk: (it.merk && it.merk !== '-') ? it.merk : (pItem?.merk || '-') };
                                    return (
                                    <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                                       <td className="py-4 text-center">{pItem?.photoBase64 ? <img src={safeString(pItem.photoBase64)} className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover mx-auto border" alt="aset"/> : <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-300 dark:border-slate-600 border"><Camera size={14}/></div>}</td>
                                       <td className="py-4 font-bold text-sm">{safeString(it.nama)}<br/><span className="text-[10px] md:text-xs font-normal text-slate-400">{safeString(mergedItem.merk)} | {safeString(mergedItem.tahun)}</span></td>
                                       <td className="py-4 text-xs md:text-sm font-mono text-slate-500">{safeString(mergedItem.no_kartu)}</td>
                                       <td className="py-4 text-center flex justify-center gap-1 md:gap-2">
                                           <button onClick={() => exportLabelWord(mergedItem, selectedUser.nama, priceData, templates, data)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-lg transition-colors" title="Cetak Label (Word)"><QrCode size={14}/></button>
                                           {isPegawaiEditable && <button onClick={() => { setTransferItem(mergedItem); setModals({...modals, transfer: true}); }} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-lg transition-colors" title="Mutasi Internal (Antar Pegawai)"><ArrowRightLeft size={14}/></button>}
                                           {isPegawaiEditable && <button onClick={() => { setTransferUnitModal({show: true, item: mergedItem, sourceRef: selectedUser.nip, sourceType: 'pegawai'}); }} className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 rounded-lg transition-colors" title="Mutasi Antar Unit"><Send size={14}/></button>}
                                           {isPegawaiEditable && <button onClick={() => confirmDelete(it, 'pegawai')} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={14}/></button>}
                                       </td>
                                    </tr>
                                 )})}
                              </tbody>
                           </table>
                        </div>
                     </div>

                     {/* Tabel Aset Lokal (Hanya di KIB Pegawai) */}
                     {selectedUser.items?.filter(it => it.isLocalOnly).length > 0 && (
                        <div className={`rounded-[2rem] shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                           <div className={`px-6 py-4 border-b flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-amber-50 border-amber-100'}`}>
                              <ClipboardCheck size={18} className="text-amber-600"/>
                              <h4 className="font-black text-amber-800 dark:text-amber-300">Catatan Inventaris Lokal (Tidak Ada di Monitoring)</h4>
                           </div>
                           <div className="p-4 md:p-6 overflow-x-auto">
                              <table className="w-full text-left min-w-[750px]">
                                 <thead><tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="pb-4 w-12 text-center">Tipe</th><th className="pb-4">Nama Barang Lokal</th><th className="pb-4">No Referensi / Kartu</th><th className="pb-4 text-center">Aksi</th></tr></thead>
                                 <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                                    {selectedUser.items?.filter(it => it.isLocalOnly).map((it, i) => {
                                       const mergedItem = { ...it, no_kartu: it.no_kartu || '-', tahun: it.tahun || '-', merk: (it.merk && it.merk !== '-') ? it.merk : '-' };
                                       return (
                                       <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                                          <td className="py-4 text-center"><div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto text-amber-500 dark:border-amber-700 border"><FileText size={14}/></div></td>
                                          <td className="py-4 font-bold text-sm">{safeString(it.nama)}<br/><span className="text-[10px] md:text-xs font-normal text-slate-400">{safeString(mergedItem.merk)} | {safeString(mergedItem.tahun)}</span></td>
                                          <td className="py-4 text-xs md:text-sm font-mono text-slate-500">{safeString(mergedItem.no_kartu)}</td>
                                          <td className="py-4 text-center flex justify-center gap-1 md:gap-2">
                                              <button onClick={() => exportLabelWord(mergedItem, selectedUser.nama, priceData, templates, data)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-lg transition-colors" title="Cetak Label (Word)"><QrCode size={14}/></button>
                                              {isPegawaiEditable && <button onClick={() => { setTransferItem(mergedItem); setModals({...modals, transfer: true}); }} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-lg transition-colors" title="Mutasi Internal"><ArrowRightLeft size={14}/></button>}
                                              {isPegawaiEditable && <button onClick={() => confirmDelete(it, 'pegawai')} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={14}/></button>}
                                          </td>
                                       </tr>
                                    )})}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     )}
                  </div>
               ) : <div className={`text-center py-20 font-bold border-2 border-dashed rounded-[2rem] ${isDarkMode ? 'border-slate-700 text-slate-500 bg-slate-800' : 'text-slate-400 bg-slate-50'}`}>Ketik nama pegawai untuk menampilkan data aset.</div>}
            </div>
         )}

         {/* --- Inventaris Ruangan --- */}
         {activeTab === 'ruangan' && (
            <div className="space-y-8">
               <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                     <div className="flex-grow w-full md:w-auto">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Pilih Ruangan</label>
                        <div className="flex gap-2">
                            <select className={`w-full md:w-auto flex-grow p-4 rounded-xl border outline-none font-bold text-sm focus:border-emerald-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50'}`} value={selectedRoomName} onChange={e => setSelectedRoomName(e.target.value)}>
                               {dynamicRooms.map((r, i) => <option key={i} value={r}>{r}</option>)}
                            </select>
                            {!isReadOnly && <button onClick={() => setEditRoom({show: true, oldName: selectedRoomName, newName: selectedRoomName})} className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-xl transition-colors" title="Edit Nama Ruangan"><Edit3 size={20}/></button>}
                            {!isReadOnly && <button onClick={() => handleDeleteRoom(selectedRoomName)} className="p-4 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 rounded-xl transition-colors" title="Hapus Ruangan"><Trash2 size={20}/></button>}
                        </div>
                     </div>
                     {!isReadOnly && (
                         <div className="flex-grow w-full md:w-auto">
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tambah Ruangan Baru</label>
                            <div className="flex gap-2">
                               <input type="text" placeholder="Nama Ruangan..." className={`w-full md:w-auto flex-grow p-4 rounded-xl border outline-none font-bold text-sm focus:border-emerald-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50'}`} value={newRoomName} onChange={e => setNewRoomName(e.target.value)} />
                               <button onClick={handleAddRoom} disabled={!newRoomName || status.loading} className="p-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"><PlusCircle size={20}/></button>
                            </div>
                         </div>
                     )}
                  </div>
                  
                  <div className={`mt-8 pt-8 border-t flex flex-wrap gap-2 ${isDarkMode ? 'border-slate-700' : ''}`}>
                      <button onClick={() => handleExportBulkLabel(currentRoomData.items, selectedRoomName)} className="px-6 py-3 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><QrCode size={16}/> Cetak Semua Label</button>
                      <button onClick={() => handleExportKIRWord(selectedRoomName)} className="px-6 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs"><Printer size={16}/> Cetak KIR</button>
                      {!isReadOnly && <button onClick={() => setModals({...modals, addRoomItem: true})} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 flex-grow md:flex-none text-xs hover:bg-emerald-700"><PlusCircle size={16}/> Tambah Aset Ruangan</button>}
                  </div>
               </div>

               {/* Tabel Aset Ruangan Utama (Monitoring) */}
               <div className={`rounded-[2rem] shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  <div className={`px-6 py-5 border-b flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-emerald-50 border-emerald-100'}`}>
                     <Database size={18} className="text-emerald-600"/>
                     <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-300">Aset Utama Terhubung: {selectedRoomName}</h3>
                  </div>
                  <div className="p-4 md:p-8 overflow-x-auto">
                      <table className="w-full text-left min-w-[750px]">
                          <thead><tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="pb-4 w-12 text-center">Foto</th><th className="pb-4">Nama Barang</th><th className="pb-4">No Kartu</th><th className="pb-4 text-center">Aksi</th></tr></thead>
                          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                              {currentRoomData.items?.filter(it => !it.isLocalOnly).length === 0 ? <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-bold">Tidak ada aset utama di ruangan ini.</td></tr> : 
                              currentRoomData.items?.filter(it => !it.isLocalOnly).map((it, i) => {
                                 let pItem = Object.values(filteredPriceData || {}).find(x => safeString(x.no_kartu) === safeString(it.no_kartu) && safeString(it.no_kartu) !== '');
                                 if (!pItem) pItem = Object.values(filteredPriceData || {}).find(x => safeString(x.nama).toLowerCase() === safeString(it.nama).toLowerCase() && safeString(x.lokasi).toLowerCase() === safeString(selectedRoomName).toLowerCase());
                                 const mergedItem = { ...it, no_kartu: it.no_kartu || pItem?.no_kartu || '-', tahun: it.tahun || pItem?.tgl_pengadaan || pItem?.tahun || '-', merk: (it.merk && it.merk !== '-') ? it.merk : (pItem?.merk || '-') };
                                 return (
                                 <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                                    <td className="py-4 text-center">{pItem?.photoBase64 ? <img src={safeString(pItem.photoBase64)} className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover mx-auto border" alt="aset"/> : <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-300 border dark:border-slate-600"><Camera size={14}/></div>}</td>
                                    <td className="py-4 font-bold text-sm">{safeString(it.nama)}<br/><span className="text-[10px] md:text-xs font-normal text-slate-400">{safeString(mergedItem.merk)} | {safeString(mergedItem.tahun)}</span></td>
                                    <td className="py-4 text-xs md:text-sm font-mono text-slate-500">{safeString(mergedItem.no_kartu)}</td>
                                    <td className="py-4 text-center flex justify-center gap-1 md:gap-2">
                                        <button onClick={() => exportLabelWord(mergedItem, selectedUser.nama, priceData, templates, data)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-lg transition-colors" title="Cetak Label (Word)"><QrCode size={14}/></button>
                                        {isPegawaiEditable && <button onClick={() => { setTransferItem(mergedItem); setModals({...modals, transfer: true}); }} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-lg transition-colors" title="Mutasi Internal (Antar Pegawai)"><ArrowRightLeft size={14}/></button>}
                                        {isPegawaiEditable && <button onClick={() => { setTransferUnitModal({show: true, item: mergedItem, sourceRef: selectedUser.nip, sourceType: 'pegawai'}); }} className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 rounded-lg transition-colors" title="Mutasi Antar Unit"><Send size={14}/></button>}
                                        {isPegawaiEditable && <button onClick={() => handleUnlinkFromMaster(it, 'ruangan')} className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg transition-colors" title="Keluarkan dari Monitoring (Jadikan Lokal)"><Unplug size={14}/></button>}
                                        {isPegawaiEditable && <button onClick={() => confirmDelete(it, 'ruangan')} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 rounded-lg transition-colors" title="Hapus Sepenuhnya"><Trash2 size={14}/></button>}
                                    </td>
                                 </tr>
                              )})}
                          </tbody>
                      </table>
                  </div>
               </div>

               {/* Tabel Aset Lokal Ruangan (Hanya KIR) */}
               {currentRoomData.items?.filter(it => it.isLocalOnly).length > 0 && (
                   <div className={`rounded-[2rem] shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                      <div className={`px-6 py-4 border-b flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-amber-50 border-amber-100'}`}>
                         <ClipboardCheck size={18} className="text-amber-600"/>
                         <h4 className="font-black text-amber-800 dark:text-amber-300">Catatan Inventaris Lokal Ruangan (Tidak Ada di Monitoring)</h4>
                      </div>
                      <div className="p-4 md:p-6 overflow-x-auto">
                         <table className="w-full text-left min-w-[750px]">
                            <thead><tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="pb-4 w-12 text-center">Tipe</th><th className="pb-4">Nama Barang Lokal</th><th className="pb-4">No Referensi / Kartu</th><th className="pb-4 text-center">Aksi</th></tr></thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                               {currentRoomData.items?.filter(it => it.isLocalOnly).map((it, i) => {
                                  const mergedItem = { ...it, no_kartu: it.no_kartu || '-', tahun: it.tahun || '-', merk: (it.merk && it.merk !== '-') ? it.merk : '-' };
                                  return (
                                  <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                                     <td className="py-4 text-center"><div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto text-amber-500 dark:border-amber-700 border"><FileText size={14}/></div></td>
                                     <td className="py-4 font-bold text-sm">{safeString(it.nama)}<br/><span className="text-[10px] md:text-xs font-normal text-slate-400">{safeString(mergedItem.merk)} | {safeString(mergedItem.tahun)}</span></td>
                                     <td className="py-4 text-xs md:text-sm font-mono text-slate-500">{safeString(mergedItem.no_kartu)}</td>
                                     <td className="py-4 text-center flex justify-center gap-1 md:gap-2">
                                         <button onClick={() => exportLabelWord(mergedItem, selectedRoomName, priceData, templates, data)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-lg transition-colors" title="Cetak Label (Word)"><QrCode size={14}/></button>
                                         {!isReadOnly && <button onClick={() => { setTransferUnitModal({show: true, item: mergedItem, sourceRef: selectedRoomName, sourceType: 'ruangan'}); }} className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 rounded-lg transition-colors" title="Mutasi Antar Unit"><Send size={14}/></button>}
                                         {!isReadOnly && <button onClick={() => handleUnlinkFromMaster(it, 'ruangan')} className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg transition-colors" title="Keluarkan dari Monitoring (Jadikan Lokal)"><Unplug size={14}/></button>}
                                         {!isReadOnly && <button onClick={() => confirmDelete(it, 'ruangan')} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 rounded-lg transition-colors" title="Hapus Sepenuhnya"><Trash2 size={14}/></button>}
                                     </td>
                                  </tr>
                               )})}
                            </tbody>
                         </table>
                      </div>
                   </div>
               )}
            </div>
         )}

         {/* --- PAJAK KENDARAAN --- */}
         {activeTab === 'pajak' && (
            <div className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
               <div className={`p-6 md:p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50'}`}>
                  <h3 className="font-black text-xl flex items-center gap-2"><Car className="text-emerald-600"/> Pajak Kendaraan Dinas</h3>
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      <span className="font-bold text-xs text-slate-400">Arsip Pembayaran:</span>
                      <select value={pajakSelectedYear} onChange={e=>setPajakSelectedYear(e.target.value)} className={`p-2 font-bold text-sm outline-none border rounded-xl ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}>{pajakYearsList.map(y=><option key={y} value={y}>{y}</option>)}</select>
                      <button onClick={()=>{ const cy = prompt("Masukkan Tahun Arsip Baru (Misal: 2031)"); if(cy && !isNaN(cy) && cy.length === 4) setPajakYearsList(prev => [...new Set([...prev, cy])].sort()); }} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200" title="Tambah Tahun"><PlusCircle size={16}/></button>
                      <button onClick={handleExportPajak} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 text-xs hover:bg-blue-700 transition-colors ml-auto md:ml-2"><Download size={16}/> Export Excel</button>
                  </div>
               </div>
               <div className="p-4 md:p-8 overflow-x-auto">
                  <table className="w-full text-left min-w-[900px]">
                     <thead><tr className={`text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="pb-4">Kendaraan</th><th className="pb-4">Pemegang</th><th className="pb-4">Tgl Pajak (Masa Berlaku)</th><th className="pb-4 text-center">Status</th><th className="pb-4 text-center">Foto Kendaraan</th><th className="pb-4 text-center">Bukti Bayar {pajakSelectedYear}</th><th className="pb-4 text-center">Aksi</th></tr></thead>
                     <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                        {vehicleItems.length === 0 ? <tr><td colSpan="7" className="text-center py-10 text-slate-400 font-bold">Tidak ada data kendaraan terdeteksi.</td></tr> : vehicleItems.map((it, i) => {
                           const tglMasa = parseDateRobust(getSafeDateString(it.tgl_pajak) || getSafeDateString(it.tgl_pengadaan));
                           let diffDays = 0, warning = false; if (tglMasa) { diffDays = Math.ceil((tglMasa - new Date()) / 86400000); warning = diffDays <= 30; }
                           const currentBukti = it.pajak_history?.[pajakSelectedYear] || null;
                           return (
                           <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                              <td className="py-4"><p className="font-bold text-sm">{safeString(it.nama)}</p><p className="text-xs text-slate-400 font-mono">{safeString(it.no_kartu)}</p></td>
                              <td className="py-4 text-sm font-bold text-slate-500 flex items-center gap-2">{it.pemegang !== '-' ? safeString(it.pemegang) : (it.ruangan !== '-' ? safeString(it.ruangan) : safeString(it.lokasi || 'N/A'))}{!isReadOnly && <button onClick={() => setEditPajakModal({show: true, item: it})} className="text-emerald-500 p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded" title="Edit Pemegang"><Edit3 size={14}/></button>}</td>
                              <td className="py-4 text-sm font-bold">{tglMasa ? tglMasa.toLocaleDateString('id-ID') : '-'}</td>
                              <td className="py-4 text-center">{tglMasa && <span className={`px-3 py-1 rounded-full text-[10px] font-black ${warning ? (diffDays < 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700') : 'bg-emerald-100 text-emerald-700'}`}>{diffDays < 0 ? 'LEWAT WAKTU' : (warning ? `H-${diffDays}` : 'AMAN')}</span>}</td>
                              <td className="py-4 text-center">
                                  {it.photoBase64 ? <button onClick={()=>setPhotoModal({show:true, item:it, preview:safeString(it.photoBase64), file:null, isSPPBI: false, isPajak: false, isPBB: false, isRkbmdArchive: false, rkbmdMeta: null, pajakYear: '', pbbYear: '', isPdf: false, isExcel: false, fileName: ''})} className="text-[10px] md:text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 rounded py-1">Lihat Foto</button> : (!isReadOnly ? <button onClick={()=>setPhotoModal({show:true, item:it, preview:null, file:null, isSPPBI: false, isPajak: false, isPBB: false, isRkbmdArchive: false, rkbmdMeta: null, pajakYear: '', pbbYear: '', isPdf: false, isExcel: false, fileName: ''})} className="text-slate-400 p-2 border border-transparent hover:border-emerald-200 rounded" title="Upload Foto Kendaraan"><Camera size={16}/></button> : <span className="text-xs text-slate-400 italic">Kosong</span>)}
                              </td>
                              <td className="py-4 text-center">{currentBukti ? <button onClick={()=>{ const isExcel = safeString(currentBukti).includes('spreadsheet') || safeString(currentBukti).includes('excel') || safeString(currentBukti).includes('.xls'); if (isExcel) { const a = document.createElement('a'); a.href = currentBukti; a.download = `Pajak_${safeString(it.nama)}_${pajakSelectedYear}.xlsx`; a.click(); } else { setPhotoModal({show:true, item:it, preview:safeString(currentBukti), file:null, isSPPBI: false, isPajak: false, isPBB: false, isRkbmdArchive: false, rkbmdMeta: null, pajakYear: '', pbbYear: '', isPdf: safeString(currentBukti).includes('application/pdf'), isExcel: false, fileName: ''}); } }} className="text-xs text-blue-600 font-bold hover:underline border border-blue-200 px-2 py-1 rounded">Lihat Bukti</button> : (!isReadOnly ? <button onClick={()=>setPhotoModal({show:true, item:it, preview:null, file:null, isSPPBI: false, isPajak: true, isPBB: false, isRkbmdArchive: false, rkbmdMeta: null, pajakYear: pajakSelectedYear, pbbYear: '', isPdf: false, isExcel: false, fileName: ''})} className="text-xs text-slate-400 border px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Upload size={14} className="inline mr-1"/>Upload</button> : <span className="text-xs text-slate-400 italic">Kosong</span>)}</td>
                              <td className="py-4 text-center flex flex-col gap-2 justify-center items-center">
                                  {!isReadOnly && <button onClick={()=>handlePerpanjangPajak(it)} className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded hover:bg-emerald-100 transition-colors w-full">+ 1 Tahun</button>}
                                  <button onClick={()=>handleExportWordSPPBIVehicle(it)} className="px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold rounded hover:bg-indigo-100 transition-colors flex justify-center items-center gap-1 w-full"><Printer size={12}/> SPPBI</button>
                              </td>
                           </tr>
                        )})}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* --- SURAT JALAN KENDARAAN --- */}
         {activeTab === 'surat-kendaraan' && ((userRole === 'admin' && activeUnitView === UNIT_CODES.PUSAT) || userRole === 'staff') && (
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
         )}

         {/* --- RKBMD --- */}
         {activeTab === 'rkbmd' && (
            <div className="space-y-6 md:space-y-8">
               <div className="flex flex-wrap gap-4">
                  {canEditRkbmd && <button onClick={() => { setModals({...modals, rkbmd: true}); }} className="px-6 md:px-8 py-3 md:py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2 text-sm md:text-base"><PlusCircle size={20}/> Buat Usulan</button>}
                  <button onClick={() => handleExportRkbmd('ALL')} className={`px-6 md:px-8 py-3 md:py-4 border rounded-2xl font-bold transition-all flex items-center gap-2 text-sm md:text-base ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white hover:bg-slate-50'}`}><Download size={20}/> Export Excel (All)</button>
                  {canEditRkbmd && (
                     <div className="relative overflow-hidden group">
                        <button className={`px-6 md:px-8 py-3 md:py-4 border text-emerald-600 rounded-2xl font-bold transition-all flex items-center gap-2 text-sm md:text-base ${isDarkMode ? 'bg-slate-800 border-emerald-900/50 hover:bg-emerald-900/30' : 'bg-white hover:bg-emerald-50'}`}><Upload size={20}/> Template Excel</button>
                        <input type="file" accept=".xlsx, .xls" onChange={handleUploadRkbmdTemplate} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload format Excel untuk Output"/>
                     </div>
                  )}
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                   <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                      <h4 className="font-bold text-sm text-slate-500 mb-4">Pilih Tampilan Bidang (Multiple):</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                         {ALL_BIDANG_RKBMD.map((b,i) => {
                            if (userRole !== 'admin' && !allowedBidangList.includes(b)) return null;
                            const isActive = rkbmdFilters.includes(b);
                            return <button key={i} onClick={() => setRkbmdFilters(prev => isActive ? prev.filter(x => x !== b) : [...prev, b])} className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive ? 'bg-purple-600 text-white border-purple-600' : (isDarkMode ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-50 text-slate-600 hover:bg-purple-50')}`}>{isActive && <Check size={14}/>} {b}</button>;
                         })}
                         {rkbmdFilters.length > 0 && <button onClick={()=>setRkbmdFilters([])} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">Tampilkan Semua Bidang</button>}
                      </div>
                      <div className="flex gap-4">
                          <select value={rkbmdSelectedYear} onChange={e=>setRkbmdSelectedYear(e.target.value)} className={`p-3 font-bold text-sm outline-none border rounded-xl flex-1 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}><option value="Semua">Semua Tahun</option>{Array.from({length: 6}, (_, i) => new Date().getFullYear() + i).map(y=><option key={y} value={y.toString()}>{y}</option>)}</select>
                          <select value={rkbmdSelectedJenis} onChange={e=>setRkbmdSelectedJenis(e.target.value)} className={`p-3 font-bold text-sm outline-none border rounded-xl flex-1 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}><option value="Semua">Semua Jenis Usulan</option>{JENIS_USULAN_RKBMD.map((j,i)=><option key={i} value={j}>{j}</option>)}</select>
                      </div>
                   </div>

                   <div className={`p-6 rounded-[2rem] border bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800`}>
                      <h4 className="font-bold text-sm text-indigo-700 dark:text-indigo-300 mb-4 flex items-center gap-2"><FileBadge size={18}/> Arsip Dokumen Sah RKBMD</h4>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-4">Pilih filter Tahun dan Jenis Usulan di samping, lalu Bidang di bawah ini untuk melihat/mengunggah dokumen usulan yang telah disahkan (Ditandatangani).</p>
                      
                      <div className="space-y-4">
                          <select id="arsipBidangSelect" className="w-full p-3 font-bold text-sm outline-none border border-indigo-200 rounded-xl bg-white dark:bg-slate-800 dark:border-indigo-700 dark:text-white">
                              {allowedBidangList.map((b,i) => <option key={i} value={b}>{b}</option>)}
                          </select>
                          
                          <div className="flex gap-2">
                              <button onClick={() => {
                                  const b = document.getElementById('arsipBidangSelect').value;
                                  if (rkbmdSelectedYear === 'Semua' || rkbmdSelectedJenis === 'Semua') return customAlert("Filter Diperlukan", "Pilih Tahun (bukan Semua) dan Jenis Usulan (bukan Semua) di kotak filter sebelum melihat/mengunggah arsip.");
                                  const arsipKey = `${rkbmdSelectedYear}_${rkbmdSelectedJenis.replace(/[^a-zA-Z0-9]/g, '')}_${b.replace(/[^a-zA-Z0-9]/g, '')}`;
                                  const currentArsip = rkbmdArsip[arsipKey];
                                  if (currentArsip) {
                                      const isExcel = safeString(currentArsip).includes('spreadsheet') || safeString(currentArsip).includes('excel') || safeString(currentArsip).includes('.xls');
                                      if (isExcel) { const a = document.createElement('a'); a.href = currentArsip; a.download = `Arsip_RKBMD_${rkbmdSelectedYear}.xlsx`; a.click(); } 
                                      else { setPhotoModal({show:true, item:null, preview:safeString(currentArsip), file:null, isSPPBI: false, isPajak: false, isPBB: false, isRkbmdArchive: false, rkbmdMeta: null, pajakYear: '', pbbYear: '', isPdf: safeString(currentArsip).includes('application/pdf'), isExcel: false, fileName: ''}); }
                                  } else { customAlert("Tidak Ditemukan", `Belum ada dokumen sah yang diunggah untuk ${rkbmdSelectedJenis} Tahun ${rkbmdSelectedYear} Bidang ${b}.`); }
                              }} className="flex-1 py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-700 rounded-xl hover:bg-indigo-100 transition-all text-xs">Lihat Arsip</button>
                              
                              {!isReadOnly && <button onClick={() => {
                                  const b = document.getElementById('arsipBidangSelect').value;
                                  if (rkbmdSelectedYear === 'Semua' || rkbmdSelectedJenis === 'Semua') return customAlert("Filter Diperlukan", "Pilih Tahun (bukan Semua) dan Jenis Usulan (bukan Semua) di kotak filter sebelum mengunggah arsip.");
                                  setPhotoModal({show: true, item: null, preview: null, file: null, isSPPBI: false, isPajak: false, isPBB: false, isRkbmdArchive: true, rkbmdMeta: {tahun: rkbmdSelectedYear, jenis: rkbmdSelectedJenis, bidang: b}, pajakYear: '', pbbYear: '', isPdf: false, isExcel: false, fileName: ''});
                              }} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-xs flex justify-center items-center gap-1"><Upload size={14}/> Upload Baru</button>}
                          </div>
                      </div>
                   </div>
               </div>

               <div className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border p-6 md:p-8 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  <div className="flex justify-between items-center mb-6"><h3 className="font-black text-lg md:text-xl ml-2">Daftar Usulan ({displayedRkbmdData.length})</h3></div>
                  <div className="space-y-3 md:space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                     {displayedRkbmdData.map(r => (
                        <div key={r.id} className={`p-4 md:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-transparent'}`}>
                           <div><h4 className="font-bold text-base md:text-lg">{safeString(r.usulan_nama || r.nama_barang || '(Tanpa Nama)')}</h4><p className="text-[10px] md:text-xs text-slate-500 mt-1"><span className="text-purple-600 font-bold">{safeString(r.jenis_usulan)} ({safeString(r.tahun_usulan)})</span> • {safeString(r.bidang)} • {safeString(r.usulan_jumlah || r.jumlah)} {safeString(r.usulan_satuan || r.satuan)} • User: {safeString(r.inputByRole)}</p><p className="text-[10px] text-slate-400 mt-1 truncate max-w-xl">Ket: {safeString(r.keterangan || r.alasan) || '-'}</p></div>
                           <div className="text-left md:text-right w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end">
                              {canEditRkbmd ? <button onClick={() => deleteRkbmd(r.id)} className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded font-bold hover:bg-red-200 mt-0 md:mt-1">Hapus</button> : <span className="text-[10px] text-slate-400">Read-only</span>}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* --- Inventaris Tanah --- */}
         {activeTab === 'tanah' && (userRole === 'admin' || (userRole === 'admin_upt' && userUnit === UNIT_CODES.P2BTP)) && (
            <div className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border overflow-hidden flex flex-col h-[80vh] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
               <div className={`p-6 md:p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50'}`}>
                  <h3 className="font-black text-xl flex items-center gap-2"><MapIcon className="text-emerald-600"/> Inventaris Tanah</h3>
                  <div className="flex flex-wrap items-center gap-2">
                      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/><input type="text" placeholder="Cari KIB, Nama, Alamat..." className={`pl-9 pr-4 py-2 rounded-xl text-xs outline-none border focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`} value={tanahSearch} onChange={e => setTanahSearch(e.target.value)} /></div>
                      <div className="flex items-center gap-1 border rounded-xl px-2 py-1 bg-white dark:bg-slate-700 dark:border-slate-600">
                          <span className="text-[10px] font-bold text-slate-400">PBB:</span>
                          <select value={pbbSelectedYear} onChange={e=>setPbbSelectedYear(e.target.value)} className="bg-transparent text-xs font-bold outline-none dark:text-white">{pbbYearsList.map(y=><option key={y} value={y}>{y}</option>)}</select>
                          <button onClick={()=>{ const cy = prompt("Masukkan Tahun Arsip PBB Baru (Misal: 2031)"); if(cy && !isNaN(cy) && cy.length === 4) setPbbYearsList(prev => [...new Set([...prev, cy])].sort()); }} className="text-emerald-600 hover:text-emerald-800"><PlusCircle size={14}/></button>
                      </div>
                      <button onClick={handleExportTanah} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 text-xs hover:bg-blue-700 transition-colors"><Download size={16}/> Export</button>
                      {userRole === 'admin' && <button onClick={() => { setStatus({...status, uploadType: 'tanah'}); setModals({...modals, upload: true}); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 text-xs hover:bg-emerald-700 transition-colors"><CloudUpload size={16}/> Sync</button>}
                  </div>
               </div>
               <div className="p-0 md:p-4 flex-grow overflow-auto custom-scrollbar">
                  <table className="w-full text-left min-w-[1000px]">
                     <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}><tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="p-4 w-48">KIB / No Barang</th><th className="p-4 w-64">Penggunaan & Alamat</th><th className="p-4 w-48">Luas / Hak</th><th className="p-4 w-48">Petugas / PIC</th><th className="p-4 text-center w-32">Media (Aset)</th><th className="p-4 text-center">Arsip PBB {pbbSelectedYear}</th><th className="p-4 text-center">Aksi / Gmaps</th></tr></thead>
                     <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                        {filteredTanahDataFinal.length === 0 ? <tr><td colSpan="7" className="text-center py-10 text-slate-400 font-bold">Data tanah tidak ditemukan.</td></tr> : filteredTanahDataFinal.map((t, i) => {
                           const gmapsUrl = safeString(t.gmaps).startsWith('http') ? safeString(t.gmaps) : (t.gmaps ? 'https://' + safeString(t.gmaps) : '');
                           const currentPbb = t.pbb_history?.[pbbSelectedYear] || null;
                           return (
                           <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                              <td className="p-4"><p className="font-bold text-sm text-emerald-600">{safeString(t.kib)}</p><p className="text-[10px] md:text-xs text-slate-400 font-mono mt-1">Peroleh: {getSafeDateString(t.tgl_peroleh).split('T')[0]}</p>{t.lastEditedBy && <div className={`mt-2 pt-2 border-t text-[9px] text-slate-400 flex items-center gap-1 ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}><Edit3 size={10}/> {safeString(t.lastEditedBy)}</div>}</td>
                              <td className="p-4"><p className="font-bold text-sm">{safeString(t.penggunaan) || '-'}</p><p className="text-[10px] md:text-xs text-slate-500 mt-1 leading-tight flex items-start gap-1"><MapPin size={12} className="shrink-0 mt-0.5"/> {safeString(t.alamat) || '-'}</p></td>
                              <td className="p-4"><p className="font-black text-sm">{safeString(t.luas) || '-'} m²</p><p className="text-[10px] text-slate-500 mt-1">{safeString(t.status_hak) || '-'}</p></td>
                              <td className="p-4"><p className="font-bold text-xs text-blue-500">{safeString(t.petugas) || 'Belum ada PIC'}</p><p className="text-[10px] text-slate-500 mt-1">Tlp: {safeString(t.tlp_petugas) || '-'}</p></td>
                              <td className="p-4 text-center flex flex-col gap-2 items-center justify-center h-full">
                                  {t.photoUrl ? <button onClick={() => setMediaTanahModal({show: true, viewOnlyUrl: safeString(t.photoUrl), viewOnlyType: 'photo', item: null, file: null, preview: null, isVideo: false, uploading: false, progress: 0})} className="px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded font-bold text-[10px] flex items-center gap-1 w-full justify-center"><ImageIcon size={12}/> Lihat Foto</button> : <button onClick={() => setMediaTanahModal({show: true, item: t, file: null, preview: null, isVideo: false, uploading: false, progress: 0, viewOnlyUrl: '', viewOnlyType: ''})} className="px-2 py-1 border border-slate-200 dark:border-slate-600 text-slate-400 rounded font-bold text-[10px] flex items-center gap-1 w-full justify-center hover:bg-slate-50"><Upload size={12}/> Upload Foto</button>}
                                  {t.videoUrl ? <button onClick={() => setMediaTanahModal({show: true, viewOnlyUrl: safeString(t.videoUrl), viewOnlyType: 'video', item: null, file: null, preview: null, isVideo: false, uploading: false, progress: 0})} className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded font-bold text-[10px] flex items-center gap-1 w-full justify-center"><PlaySquare size={12}/> Lihat Video</button> : <button onClick={() => setMediaTanahModal({show: true, item: t, file: null, preview: null, isVideo: false, uploading: false, progress: 0, viewOnlyUrl: '', viewOnlyType: ''})} className="px-2 py-1 border border-slate-200 dark:border-slate-600 text-slate-400 rounded font-bold text-[10px] flex items-center gap-1 w-full justify-center hover:bg-slate-50"><Upload size={12}/> Upload Video</button>}
                              </td>
                              <td className="p-4 text-center">
                                  {currentPbb ? <button onClick={()=>{ const isExcel = safeString(currentPbb).includes('spreadsheet') || safeString(currentPbb).includes('excel') || safeString(currentPbb).includes('.xls'); if (isExcel) { const a = document.createElement('a'); a.href = currentPbb; a.download = `PBB_${safeString(t.kib)}_${pbbSelectedYear}.xlsx`; a.click(); } else { setPhotoModal({show:true, item:t, preview:safeString(currentPbb), file:null, isSPPBI: false, isPajak: false, isPBB: false, isRkbmdArchive: false, rkbmdMeta: null, pajakYear: '', pbbYear: '', isPdf: safeString(currentPbb).includes('application/pdf'), isExcel: false, fileName: ''}); } }} className="text-xs text-blue-600 font-bold hover:underline border border-blue-200 px-2 py-1 rounded">Lihat PBB</button> : (!isReadOnly ? <button onClick={()=>setPhotoModal({show:true, item:t, preview:null, file:null, isSPPBI: false, isPajak: false, isPBB: true, isRkbmdArchive: false, rkbmdMeta: null, pajakYear: '', pbbYear: pbbSelectedYear, isPdf: false, isExcel: false, fileName: ''})} className="text-[10px] text-slate-400 border px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Upload size={12} className="inline mr-1"/>Upload</button> : <span className="text-[10px] text-slate-400 italic">Kosong</span>)}
                              </td>
                              <td className="p-4 text-center">
                                  <div className="flex flex-col items-center gap-2">
                                      <div className="flex justify-center gap-2">
                                          <button onClick={() => setEditTanahModal({show: true, item: t})} className="p-2 bg-slate-100 hover:bg-emerald-100 text-emerald-600 dark:bg-slate-700 rounded-lg transition-colors" title="Edit Data Tanah"><Edit3 size={16}/></button>
                                          {gmapsUrl && <a href={gmapsUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 hover:bg-blue-100 text-blue-600 dark:bg-slate-700 rounded-lg transition-colors" title="Buka di Google Maps"><MapIcon size={16}/></a>}
                                      </div>
                                      {gmapsUrl && <a href={gmapsUrl} target="_blank" rel="noreferrer" className="text-[9px] text-blue-500 hover:underline max-w-[120px] truncate block" title={gmapsUrl}>{gmapsUrl}</a>}
                                  </div>
                              </td>
                           </tr>
                        )})}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* --- Riwayat Mutasi --- */}
         {activeTab === 'history' && (
             <div className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border overflow-hidden flex flex-col h-[80vh] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                <div className={`p-6 md:p-8 border-b flex items-center gap-4 shrink-0 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50'}`}>
                   <h3 className="font-black text-xl flex items-center gap-2"><HistoryIcon className="text-emerald-600"/> Riwayat Mutasi & Aktivitas</h3>
                </div>
                <div className="p-0 md:p-4 flex-grow overflow-auto custom-scrollbar">
                   <table className="w-full text-left min-w-[800px]">
                      <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                         <tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}>
                            <th className="p-4">Waktu</th>
                            <th className="p-4">Jenis Aktivitas</th>
                            <th className="p-4">Nama Aset</th>
                            <th className="p-4">Dari (Sumber)</th>
                            <th className="p-4">Ke (Tujuan)</th>
                         </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                         {filteredHistoryData.length === 0 ? <tr><td colSpan="5" className="p-10 text-center font-bold text-slate-400">Belum ada riwayat tercatat.</td></tr> : 
                         filteredHistoryData.map((h, i) => (
                            <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                               <td className="p-4 font-mono text-xs text-slate-500">{h.timestamp ? new Date(h.timestamp.seconds * 1000).toLocaleString('id-ID') : '-'}</td>
                               <td className="p-4 font-bold text-xs"><span className={`px-2 py-1 rounded-md ${h.type === 'MUTASI' || h.type === 'MUTASI ANTAR UNIT' || h.type.includes('MUTASI') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : (h.type.includes('HAPUS') ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300')}`}>{safeString(h.type)}</span></td>
                               <td className="p-4 font-bold text-sm">{safeString(h.itemName)} <br/><span className="font-mono font-normal text-[10px] text-slate-400">{safeString(h.no_kartu)}</span></td>
                               <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{safeString(h.senderName) || '-'}</td>
                               <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{safeString(h.receiverName) || '-'}{h.alasan && <><br/><span className="text-[10px] text-slate-400 mt-1 italic block">"{h.alasan}"</span></>}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
         )}

         {/* --- Monitoring --- */}
         {activeTab === 'monitoring' && (
            <div className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border overflow-hidden flex flex-col h-[80vh] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
               <div className={`p-6 md:p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50'}`}>
                  <h3 className="font-black text-xl">Monitoring Nilai Buku & Aset</h3>
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      <select value={monitoringSelectedYear} onChange={e=>setMonitoringSelectedYear(e.target.value)} className={`p-2 md:p-3 border rounded-xl font-bold outline-none text-sm focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50'}`}>
                          <option value="Semua">Semua Tahun</option>
                          {Array.from({length: 15}, (_, i) => new Date().getFullYear() - 10 + i).map(y => <option key={y} value={y.toString()}>{y}</option>)}
                      </select>
                      <button onClick={handleExportRekapPengguna} className="px-4 py-2 md:py-3 bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap"><FileDown size={16}/><span className="hidden md:inline">Rekap Excel</span></button>
                      <div className="relative w-full md:w-auto"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input type="text" placeholder="Cari aset..." className={`w-full md:w-64 pl-10 pr-4 py-2 md:py-3 rounded-xl border outline-none text-sm focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`} onChange={e => setMonitoringSearch(e.target.value)} /></div>
                  </div>
               </div>
               <div className="p-0 md:p-4 flex-grow overflow-auto custom-scrollbar">
                  <table className="w-full text-left min-w-[1200px]">
                     <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}><tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="p-4">Aset & Kode</th><th className="p-4">Lokasi / Pemegang</th><th className="p-4 text-center">Nilai Perolehan</th><th className="p-4 text-center">Nilai Buku (Rp)</th><th className="p-4 text-center">Tgl Pengadaan</th><th className="p-4 text-center">Masa Pakai</th><th className="p-4 text-center">Label / Foto</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Aksi / Edit</th></tr></thead>
                     <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                        {activeMonitoringData.map((it, i) => {
                           const locName = it.pemegang !== '-' ? safeString(it.pemegang) : (it.ruangan !== '-' ? safeString(it.ruangan) : safeString(it.lokasi || 'N/A'));
                           return (
                           <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}><td className="p-4"><p className="font-bold text-sm">{safeString(it.nama)}</p><p className="text-[10px] md:text-xs text-slate-400 font-mono mt-1">{safeString(it.no_kartu)}</p></td><td className="p-4 text-xs md:text-sm text-slate-500"><div className="flex items-center gap-2">{it.pemegang !== '-' ? (<div className="flex flex-col"><span className="flex items-center gap-1 font-bold text-emerald-600"><User size={12}/>{safeString(it.pemegang)}</span><span className="text-[10px] font-medium text-slate-400 mt-0.5">{safeString(it.skpd)}</span></div>) : (it.ruangan !== '-' ? <span className="flex items-center gap-1 font-bold text-indigo-500"><Building2 size={12}/>{safeString(it.ruangan)}</span> : <span>{safeString(it.lokasi || '-')}</span>)}{!isReadOnly && <button onClick={() => setLinkAsetModal({show: true, item: it})} className="text-emerald-500 p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded" title="Ubah & Hubungkan Lokasi"><Link size={14}/></button>}</div></td><td className="p-4 text-center text-sm font-bold text-slate-500">{formatCurrency(it.nilai_perolehan || 0)}</td><td className="p-4 text-center text-sm font-bold text-slate-600 dark:text-slate-300">{formatCurrency(it.nilai_buku || 0)}</td><td className="p-4 text-center text-xs font-medium text-slate-500">{formatDisplayDate(getSafeDateString(it.tgl_pengadaan))}</td><td className="p-4 text-center text-xs">{it.isExpired ? <span className="text-red-500 font-bold">Habis</span> : <div className="flex flex-col items-center justify-center gap-1"><span className="text-slate-500 whitespace-nowrap">{formatDisplayDate(getSafeDateString(it.tgl_habis))}</span><span className="text-emerald-600 font-black px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">{it.diffDays} Hari</span></div>}</td><td className="p-4 text-center"><div className="flex justify-center gap-2"><button onClick={() => exportLabelWord(it, locName, priceData, templates, data)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg" title="Cetak Label (Word)"><QrCode size={14}/></button>{it.photoBase64 ? <button onClick={()=>setPhotoModal({show:true, item:it, preview:safeString(it.photoBase64), file:null})} className="text-[10px] md:text-xs text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 rounded">Foto</button> : (!isReadOnly ? <button onClick={()=>setPhotoModal({show:true, item:it, preview:null, file:null})} className="text-slate-400 p-2 border border-transparent hover:border-emerald-200 rounded"><Camera size={16}/></button> : <Camera size={16} className="text-slate-400 mx-auto"/>)}</div></td><td className="p-4 text-center"><span className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black ${it.manual_active ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'}`}>{it.manual_active ? 'RE-AKTIF' : 'AKTIF'}</span></td><td className="p-4 text-center">{!isReadOnly && <button onClick={()=>setEditNilaiModal({show: true, item: it})} className="text-xs font-bold text-blue-600 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100" title="Edit Nilai Buku/Masa Pakai"><Edit3 size={16}/></button>}</td></tr>
                           )})}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* --- Usulan Penghapusan (Disposal) Tab --- */}
         {activeTab === 'penghapusan' && (userRole === 'admin' || userRole === 'admin_upt') && (
             <div className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border overflow-hidden flex flex-col h-[80vh] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                <div className={`p-6 md:p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50'}`}>
                   <h3 className="font-black text-xl text-red-600 flex items-center gap-2"><Trash2/> Daftar Usulan Penghapusan Aset</h3>
                   <div className="flex items-center gap-2 w-full md:w-auto">
                       <div className="relative w-full md:w-auto"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input type="text" placeholder="Cari aset..." className={`w-full md:w-64 pl-10 pr-4 py-2 md:py-3 rounded-xl border outline-none text-sm focus:border-red-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white'}`} onChange={e => setMonitoringSearch(e.target.value)} /></div>
                       <button onClick={() => setModals({...modals, manualDisposal: true})} className="px-4 py-2 md:py-3 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap"><PlusCircle size={16}/><span className="hidden md:inline">Manual</span></button>
                   </div>
                </div>
                <div className="p-0 md:p-4 flex-grow overflow-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}><tr className={`text-[10px] md:text-xs font-black text-slate-400 border-b ${isDarkMode ? 'border-slate-700' : ''}`}><th className="p-4">Aset & Kode</th><th className="p-4">Lokasi Akhir</th><th className="p-4 text-center">Nilai Buku (Rp)</th><th className="p-4 text-center">Alasan</th><th className="p-4 text-center">Aksi Penahanan (Re-Aktif)</th><th className="p-4 text-center">Hapus Permanen</th></tr></thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : ''}`}>
                            {disposalData.length === 0 ? <tr><td colSpan="6" className="p-10 text-center font-bold text-slate-400">Tidak ada usulan penghapusan.</td></tr> : disposalData.map((it, i) => (
                                <tr key={i} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-red-50/30'}>
                                    <td className="p-4"><p className="font-bold text-sm">{safeString(it.nama)}</p><p className="text-[10px] text-slate-400 font-mono mt-1">{safeString(it.no_kartu)}</p></td>
                                    <td className="p-4 text-sm font-medium">{it.pemegang !== '-' ? safeString(it.pemegang) : (it.ruangan !== '-' ? safeString(it.ruangan) : safeString(it.lokasi || '-'))}</td>
                                    <td className="p-4 text-center font-bold text-slate-500">{formatCurrency(it.nilai_buku || 0)}</td>
                                    <td className="p-4 text-center"><span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black">{it.isManuallyDisposed ? 'USULAN MANUAL' : (it.isExpired ? 'MASA PAKAI HABIS' : 'NILAI BUKU 0')}</span>{it.alasan_hapus && <p className="text-[10px] mt-2 italic text-slate-500">"{it.alasan_hapus}"</p>}</td>
                                    <td className="p-4 text-center"><button onClick={()=>handleRestoreItem(it)} className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold text-xs rounded-xl transition-all shadow-sm">{it.isManuallyDisposed ? 'Batalkan Usulan' : 'Batalkan & Re-Aktifkan'}</button></td>
                                    <td className="p-4 text-center"><button onClick={() => {
                                        const pass = prompt("MASUKKAN PASSWORD OTORISASI (Kasubbag / Pengurus Barang) untuk MENGHAPUS PERMANEN aset ini dari sistem:");
                                        if (pass) processPermanentDisposal(it, pass);
                                    }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 mx-auto"><Trash2 size={12}/> Hapus Permanen</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
         )}

         {/* --- Ulasan --- */}
         {activeTab === 'ulasan' && userRole === 'admin' && (
             <div className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border overflow-hidden flex flex-col h-[80vh] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                <div className={`p-6 md:p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50'}`}>
                   <h3 className="font-black text-xl text-yellow-600 flex items-center gap-2"><Star className="fill-yellow-600"/> Daftar Ulasan & Masukan Pengguna</h3>
                </div>
                <div className="p-4 md:p-8 flex-grow overflow-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {feedbacks.length === 0 ? <p className="col-span-full text-center p-10 font-bold text-slate-400">Belum ada ulasan yang diberikan pengguna.</p> : feedbacks.map((f, i) => (
                            <div key={i} className={`p-6 rounded-[2rem] border shadow-sm flex flex-col ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{safeString(f.unitName)}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{safeString(f.userRole)}</p>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star key={idx} size={14} className={idx < f.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300 dark:text-slate-600"} />
                                        ))}
                                    </div>
                                </div>
                                <p className={`flex-grow text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{safeString(f.comment)}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-auto">{f.timestamp ? new Date(f.timestamp.seconds * 1000).toLocaleString('id-ID') : '-'}</p>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
         )}

         {/* --- Laporan --- */}
         {activeTab === 'laporan' && (
            <div className="space-y-6">
               <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 w-full md:w-max ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  <span className="font-black text-sm text-slate-500">ARSIP TAHUN:</span>
                  <select className={`p-2 md:p-3 border rounded-xl font-bold outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50'}`} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                     <option value="Semua">Semua Tahun</option>
                     {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                  <button onClick={()=>handleExportExcel('all')} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Database/></div><h4 className="font-black text-base md:text-lg">Semua Data</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Export Excel Lengkap</p></button>
                  <button onClick={()=>handleExportExcel('disposal')} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><AlertTriangle/></div><h4 className="font-black text-base md:text-lg">Usulan Hapus</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Aset Expired / Rp 0</p></button>
                  <button onClick={()=>handleExportExcel('active')} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><CheckCircle2/></div><h4 className="font-black text-base md:text-lg">Aset Aktif</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Aset Produktif</p></button>
                  <button onClick={()=>handleExportWordSPPBI(null)} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><FileSignature/></div><h4 className="font-black text-base md:text-lg">Cetak SPPBI</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Dokumen Word (BAST)</p></button>
                  <button onClick={()=>setModals({...modals, bulkLabel: true})} className={`p-6 border rounded-[2rem] hover:shadow-xl transition-all text-left group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}><div className="w-10 h-10 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><QrCode/></div><h4 className="font-black text-base md:text-lg">Cetak Label</h4><p className="text-[10px] md:text-xs text-slate-400 mt-2">Pilih Banyak Aset (Word)</p></button>
               </div>
               
               {!isReadOnly && (
                   <div className={`p-6 md:p-8 border rounded-[2rem] shadow-sm mt-8 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                       <h4 className="font-black text-lg mb-4 flex items-center gap-2"><Settings size={20} className="text-slate-400"/> Pengaturan Template HTML/TXT ({UNIT_LABELS[activeUnitView]})</h4>
                       <p className="text-xs text-slate-500 mb-6">Ganti format standar cetak dokumen khusus untuk unit ini dengan mengunggah file HTML/TXT kustom. <button onClick={()=>setModals({...modals, templateInfo: true})} className="text-blue-600 hover:underline font-bold">Lihat Panduan</button></p>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {['sppbi', 'kir', 'label'].map(type => (
                               <div key={type} className={`border p-4 rounded-xl relative group ${isDarkMode ? 'border-slate-700' : ''}`}>
                                   <p className="font-bold text-sm uppercase mb-2">Template {type}</p>
                                   <div className="flex items-center gap-2">
                                       <label className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg cursor-pointer text-center transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                                           <Upload size={14} className="inline mr-1"/> Upload File
                                           <input type="file" accept=".html,.txt" className="hidden" onChange={(e) => handleTemplateUpload(e, type)} />
                                       </label>
                                       {templates[type] && <button onClick={async () => { customConfirm("Hapus Template", `Kembalikan template ${type.toUpperCase()}?`, "danger", async () => { setStatus({...status, loading: true}); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'templates_doc', activeUnitView), { [type]: '' }, {merge: true}); setStatus({...status, loading: false}); }); }} className="p-2 bg-red-50 text-red-500 dark:bg-red-900/30 rounded-lg hover:bg-red-100"><Trash2 size={14}/></button>}
                                   </div>
                                   {templates[type] && <p className="text-[10px] text-emerald-600 mt-2 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Aktif (Kustom)</p>}
                               </div>
                           ))}
                       </div>
                   </div>
               )}
            </div>
         )}

      </main>

      {/* --- Global Modals --- */}
      {modals.bulkLabel && <ModalBulkLabelExport onClose={() => setModals({...modals, bulkLabel: false})} monitoringData={activeMonitoringData} onExport={handleExportBulkLabel} />}
      {modals.rkbmd && <ModalRKBMD allowedBidangList={allowedBidangList} kodeBarangDataList={kodeBarangData} onClose={() => setModals({...modals, rkbmd: false})} onSave={handleAddRkbmd} />}
      {modals.addItem && <ModalAddAsset onClose={() => setModals({...modals, addItem: false})} onSave={handleAddItem} priceData={filteredPriceData} pegawaiData={data} ruanganData={ruanganData} kodeBarangDataList={kodeBarangData} />}
      {modals.addRoomItem && <ModalAddRoomAsset onClose={() => setModals({...modals, addRoomItem: false})} onSave={handleAddRoomItem} priceData={filteredPriceData} ruanganData={ruanganData} pegawaiData={data} kodeBarangDataList={kodeBarangData} />}
      {modals.transfer && <ModalTransfer item={transferItem} data={data} selectedUser={selectedUser} onClose={() => setModals({...modals, transfer: false})} onSave={processTransfer} statusLoading={status.loading} />}
      {modals.transferUnit && <ModalTransferUnit item={transferUnitModal.item} sourceUnitView={activeUnitView} selectedUser={data.find(p=>p.nip===transferUnitModal.sourceRef)} selectedRoom={transferUnitModal.sourceType==='ruangan'?transferUnitModal.sourceRef:null} onClose={() => setTransferUnitModal({show: false, item: null, sourceRef: null, sourceType: ''})} onSave={processTransferUnit} statusLoading={status.loading} />}
      {modals.manualDisposal && <ModalManualDisposal onClose={() => setModals({...modals, manualDisposal: false})} onSave={processManualDisposal} activeAssets={activeMonitoringData} statusLoading={status.loading} />}
      {modals.manualLabel && <ModalManualLabel onClose={() => setModals({...modals, manualLabel: false})} templates={templates} pegawaiData={data} monitoringData={monitoringDataFiltered} />}
      {modals.feedback && <ModalFeedback onClose={() => setModals({...modals, feedback: false})} onSave={handleSaveFeedback} />}
      {linkAsetModal.show && <ModalLinkAset onClose={() => setLinkAsetModal({show:false, item:null})} onSave={processLinkAset} item={linkAsetModal.item} data={data} ruanganData={filteredRuanganData} statusLoading={status.loading} />}
      {editNilaiModal.show && <ModalEditNilaiBuku onClose={() => setEditNilaiModal({show:false, item:null})} onSave={processEditNilai} item={editNilaiModal.item} statusLoading={status.loading} kodeBarangDataList={kodeBarangData} />}
      {editPajakModal.show && <ModalEditPajakOwner onClose={() => setEditPajakModal({show:false, item:null})} onSave={processPajakOwner} item={editPajakModal.item} data={data} ruanganData={filteredRuanganData} statusLoading={status.loading} />}
      {editTanahModal.show && <ModalEditTanah show={editTanahModal.show} item={editTanahModal.item} onClose={() => setEditTanahModal({ show: false, item: null })} onSave={handleUpdateTanahInfo} statusLoading={status.loading} />}

      {/* Modal Edit Room Name */}
      {editRoom.show && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className={`p-6 md:p-8 rounded-[2rem] w-full max-w-md shadow-2xl ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                  <h3 className="text-xl font-black mb-4">Edit Nama Ruangan</h3>
                  <input type="text" className={`w-full p-4 border rounded-xl outline-none focus:border-emerald-500 font-bold mb-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50'}`} value={editRoom.newName} onChange={e=>setEditRoom({...editRoom, newName: e.target.value})} />
                  <div className="flex gap-2">
                      <button onClick={()=>setEditRoom({show:false, oldName:'', newName:''})} className={`flex-1 py-3 font-bold rounded-xl ${isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>Batal</button>
                      <button onClick={handleAddRoomName} disabled={!editRoom.newName || editRoom.newName === editRoom.oldName || status.loading} className="flex-1 py-3 bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 rounded-xl flex justify-center">{status.loading ? <Loader2 className="animate-spin" size={20}/> : 'Simpan'}</button>
                  </div>
              </div>
          </div>
      )}

      {/* Modal Panduan Template */}
      {modals.templateInfo && (
          <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
              <div className={`rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                  <h3 className="text-xl font-black mb-4">Panduan Template Kustom</h3>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Anda dapat membuat file <code>.html</code> atau <code>.txt</code> lalu mengunggahnya. Sistem akan mengganti kata kunci (placeholder) berikut secara otomatis saat cetak:</p>
                  <div className="space-y-4 text-xs">
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50'}`}><h4 className="font-bold text-sm text-indigo-500 mb-2">Cetak SPPBI</h4><p className="font-mono text-slate-400">{'{{NAMA}}'}, {'{{NIP}}'}, {'{{JABATAN}}'}, {'{{TANGGAL}}'}, {'{{TABLE_ROWS}}'}</p><p className="mt-2 text-slate-500">Gunakan {'{{TABLE_ROWS}}'} di dalam tag &lt;tbody&gt; untuk menyisipkan baris aset.</p></div>
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50'}`}><h4 className="font-bold text-sm text-emerald-500 mb-2">Cetak KIR</h4><p className="font-mono text-slate-400">{'{{ROOM_NAME}}'}, {'{{KASUBAG_NAMA}}'}, {'{{KASUBAG_NIP}}'}, {'{{PENGURUS_NAMA}}'}, {'{{PENGURUS_NIP}}'}, {'{{TANGGAL}}'}, {'{{TABLE_ROWS}}'}</p></div>
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50'}`}><h4 className="font-bold text-sm text-amber-500 mb-2">Cetak Label Aset</h4><p className="font-mono text-slate-400">{'{{NAMA_BARANG}}'}, {'{{MERK}}'}, {'{{NO_KARTU}}'}, {'{{TAHUN}}'}, {'{{SISTEM_ID}}'}, {'{{LOKASI}}'}, {'{{NAMA_DINAS}}'}, {'{{NAMA_SKPD}}'}</p><p className="mt-2 text-slate-500">NAMA_DINAS akan selalu menjadi "Dinas Perkebunan Prov. Jatim", sedangkan NAMA_SKPD akan ditarik dari data SKPD/Bidang pemilik barang.</p></div>
                  </div>
                  <button onClick={() => setModals({...modals, templateInfo: false})} className={`mt-8 w-full py-3 font-bold rounded-xl ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>Tutup Panduan</button>
              </div>
          </div>
      )}
      
      {/* Modal View / Upload Photo Global & SPPBI/Pajak */}
      {photoModal.show && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
             <div className={`p-6 md:p-8 rounded-3xl w-full max-w-lg text-center max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-6">
                   <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : ''}`}>{photoModal.isSPPBI ? 'Dokumen SPPBI' : (photoModal.isPajak ? `Bukti Pajak ${photoModal.pajakYear}` : (photoModal.isPBB ? `Bukti PBB ${photoModal.pbbYear}` : (photoModal.isRkbmdArchive ? `Arsip ${photoModal.rkbmdMeta.jenis} (${photoModal.rkbmdMeta.tahun})` : 'Foto Aset')))}</h3>
                   <button onClick={() => setPhotoModal({ show: false, item: null, preview: null, file: null, isSPPBI: false, isPajak: false, isPBB: false, isRkbmdArchive: false, rkbmdMeta: null, pajakYear: '', pbbYear: '', isPdf: false, isExcel: false, fileName: '' })} className={`p-2 rounded-xl ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><X size={20}/></button>
                </div>
                {photoModal.preview && !photoModal.file ? (
                    <div className={`w-full rounded-2xl mb-6 overflow-hidden relative flex flex-col items-center justify-center min-h-[300px] border p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                        {photoModal.isPdf ? <div className="text-center"><FileText size={48} className="text-red-500 mx-auto mb-4"/><a href={photoModal.preview} target="_blank" rel="noreferrer" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Buka PDF</a></div>
                        : photoModal.isExcel ? <div className="text-center"><FileType size={48} className="text-emerald-500 mx-auto mb-4"/><a href={photoModal.preview} target="_blank" rel="noreferrer" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">Unduh Excel</a></div>
                        : <img src={photoModal.preview} alt="Preview" className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-sm" />}
                    </div>
                ) : (
                    <div className="mb-6">
                        <label className={`w-full aspect-video rounded-2xl overflow-hidden relative group cursor-pointer border-2 border-dashed flex items-center justify-center transition-colors hover:border-emerald-500 ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-300'}`}>
                           <input type="file" accept="image/*, application/pdf, .xlsx, .xls" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handlePhotoChange} disabled={status.loading}/>
                           {photoModal.preview ? (
                               photoModal.isPdf ? <div className="flex flex-col items-center"><FileText size={48} className="text-red-500 mb-2"/><span className="font-bold">{photoModal.fileName}</span></div> :
                               photoModal.isExcel ? <div className="flex flex-col items-center"><FileType size={48} className="text-emerald-500 mb-2"/><span className="font-bold">{photoModal.fileName}</span></div> :
                               <img src={photoModal.preview} className="w-full h-full object-contain bg-slate-900" alt="Preview"/>
                           ) : (
                               <div className="flex flex-col items-center gap-3 text-slate-400 font-bold group-hover:text-emerald-500 p-6">
                                   <Upload size={36}/>
                                   <span className="text-sm">Klik atau Drag file ke sini<br/><span className="text-xs font-normal mt-1 block">Mendukung Foto (JPG/PNG), PDF, Excel</span></span>
                               </div>
                           )}
                        </label>
                    </div>
                )}

                {(photoModal.file || (!photoModal.preview && !isReadOnly)) && (
                    <button onClick={savePhotoToCloud} disabled={!photoModal.file || status.loading} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 disabled:bg-slate-300 transition-all text-sm md:text-base flex justify-center items-center gap-2 shadow-lg">
                        {status.loading ? <><Loader2 className="animate-spin" size={20}/> Menyimpan...</> : 'Simpan ke Cloud'}
                    </button>
                )}
             </div>
         </div>
     )}

     {/* Modal Sync Database Master */}
     {modals.upload && (
       <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-3xl">
         <div className={`rounded-[2rem] md:rounded-[5rem] shadow-2xl w-full max-w-4xl overflow-hidden border flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
           <div className={`p-6 md:p-10 border-b flex justify-between items-center shrink-0 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50'}`}><h3 className={`text-xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-2 md:gap-4 ${isDarkMode ? 'text-white' : ''}`}><Database className="w-6 h-6 md:w-8 md:h-8" /> Sync DB Master</h3><button onClick={() => setModals({...modals, upload: false})} className="p-2 md:p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"><X size={32} /></button></div>
           <div className="p-6 md:p-12 text-center overflow-y-auto">
             <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-8">
                {userRole === 'admin' && <button onClick={() => setStatus({...status, uploadType: 'pegawai'})} className={`p-3 md:p-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest transition-all ${status.uploadType === 'pegawai' ? 'bg-slate-900 dark:bg-slate-600 text-white shadow-xl scale-105' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:bg-slate-200'}`}>Data Pegawai</button>}
                <button onClick={() => setStatus({...status, uploadType: 'prices'})} className={`p-3 md:p-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest transition-all ${status.uploadType === 'prices' ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:bg-slate-200'}`}>Nilai Buku</button>
                {userRole === 'admin' && <button onClick={() => setStatus({...status, uploadType: 'kode_barang'})} className={`p-3 md:p-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest transition-all ${status.uploadType === 'kode_barang' ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:bg-slate-200'}`}>Master Kode</button>}
                {userRole === 'admin' && <button onClick={() => setStatus({...status, uploadType: 'pajak'})} className={`p-3 md:p-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest transition-all ${status.uploadType === 'pajak' ? 'bg-purple-600 text-white shadow-xl scale-105' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:bg-slate-200'}`}>Pajak Motor</button>}
                {userRole === 'admin' && <button onClick={() => setStatus({...status, uploadType: 'tanah'})} className={`p-3 md:p-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest transition-all ${status.uploadType === 'tanah' ? 'bg-amber-600 text-white shadow-xl scale-105' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:bg-slate-200'}`}>Tanah (KIB A)</button>}
             </div>

             {/* Checkbox Mode Tambah Data (Append) Universal */}
             <div className="flex flex-col items-center mb-6">
                 <label className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-left max-w-2xl">
                     <input type="checkbox" checked={status.uploadAppend} onChange={(e) => setStatus({...status, uploadAppend: e.target.checked})} className="w-5 h-5 accent-emerald-600 mt-1" />
                     <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                         Mode Tambah Data (Append) - Sangat Aman
                         <br/><span className="text-xs font-normal opacity-90 mt-1 block">Aset atau data baru yang Anda upload melalui Excel <b>TIDAK</b> akan menghapus data yang sudah ada dari tahun-sebelumnya. Sistem akan otomatis menyisipkan data baru tanpa menimpa arsip yang lama.</span>
                     </span>
                 </label>
             </div>

             <label htmlFor="portalSync" className={`block border-[4px] md:border-[12px] border-dashed rounded-[2rem] md:rounded-[4rem] p-8 md:p-16 transition-all duration-700 cursor-pointer group ${status.loading ? 'opacity-20 animate-pulse bg-emerald-50' : 'border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-500'}`}>
               <input type="file" accept=".xlsx, .xls, .csv" onChange={handleBulkUpload} className="hidden" id="portalSync" disabled={status.loading} />
               <div className="flex flex-col items-center">
                 <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center shadow-2xl mb-6 md:mb-12 transition-all duration-500 ${status.loading ? 'bg-white text-emerald-600 animate-bounce' : (status.uploadType === 'pegawai' ? 'bg-slate-900 dark:bg-slate-600' : (status.uploadType === 'kode_barang' ? 'bg-indigo-600' : (status.uploadType === 'pajak' ? 'bg-purple-600' : (status.uploadType === 'tanah' ? 'bg-amber-600' : 'bg-emerald-600')))) + ' text-white md:group-hover:rotate-12 md:group-hover:scale-110'}`}>
                   {status.uploadType === 'pegawai' ? <Users size={48}/> : (status.uploadType === 'kode_barang' ? <ListTree size={48}/> : (status.uploadType === 'pajak' ? <Car size={48}/> : (status.uploadType === 'tanah' ? <MapPin size={48}/> : <DollarSign size={48} />)))}
                 </div>
                 <p className={`text-lg md:text-2xl font-black uppercase tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{status.loading ? `UPDATING ${status.progress}%` : `UPLOAD FILE ${status.uploadType.toUpperCase()}`}</p>
                 <p className="text-slate-400 mt-2 text-sm font-bold">Klik area ini untuk memilih dokumen Excel</p>
               </div>
             </label>
           </div>
         </div>
       </div>
     )}

     {/* MODAL: Notifikasi (Alert & Confirm) Generic */}
     {confirmModal.show && (
       <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-sm animate-in fade-in">
         <div className={`rounded-[2rem] md:rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden text-center p-8 md:p-12 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
           <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${confirmModal.type === 'danger' ? 'bg-red-50 text-red-500 dark:bg-red-900/30' : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30'}`}>
             {confirmModal.type === 'danger' ? <AlertTriangle size={40} className="md:w-12 md:h-12" /> : (confirmModal.isAlert ? <Info size={40} className="md:w-12 md:h-12" /> : <CheckCircle2 size={40} className="md:w-12 md:h-12" />)}
           </div>
           <h3 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{safeString(confirmModal.title)}</h3>
           <p className="text-slate-500 dark:text-slate-300 font-bold mb-8 text-sm md:text-base">{safeString(confirmModal.message)}</p>
           
           {confirmModal.isAlert ? (
               <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="w-full py-3 md:py-4 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black uppercase hover:bg-emerald-700 transition-all text-xs md:text-sm">Oke Mengerti</button>
           ) : (
               <div className="flex gap-4">
                 <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="flex-1 py-3 md:py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl md:rounded-2xl font-black uppercase hover:bg-slate-200 transition-all text-xs md:text-sm">Batal</button>
                 <button onClick={() => { if(confirmModal.onConfirm) confirmModal.onConfirm(); setConfirmModal({ ...confirmModal, show: false }); }} className={`flex-1 py-3 md:py-4 text-white rounded-xl md:rounded-2xl font-black uppercase transition-all flex justify-center items-center gap-2 text-xs md:text-sm ${confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>Lanjutkan</button>
               </div>
           )}
         </div>
       </div>
     )}
     
     <footer className="fixed bottom-0 md:left-80 right-0 p-4 md:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t dark:border-slate-800 text-center text-[8px] md:text-[10px] font-black tracking-widest text-slate-400 z-10 transition-colors duration-300">
         INVENSBUN.ID · DINAS PERKEBUNAN JATIM © {new Date().getFullYear()}
     </footer>
   </div>
 );
};

export default App;