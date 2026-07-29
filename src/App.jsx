/* global __initial_auth_token */
import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, MapPin, Menu, Info, AlertCircle, Printer, Car, CheckSquare, Upload, FileText, CheckCircle2, X, Loader2, QrCode, FileDown, FileSignature, Building2, FileType, Database, Trash2, ArrowRightLeft, History as HistoryIcon, CloudUpload, ClipboardCheck, PlusCircle, Globe, LayoutDashboard, Users, BarChart3, Star, MessageSquare, Send, Check, DollarSign, Lock, AlertTriangle, Download, Camera, FilePlus, Link, Edit3, Map as MapIcon, PlaySquare, Image as ImageIcon, Leaf, Settings, Sun, Moon, Edit, FileBadge, Building, FileKey, ListTree, Unplug } from 'lucide-react';
import { collection, doc, setDoc, onSnapshot, writeBatch, updateDoc, arrayUnion, serverTimestamp, addDoc, deleteDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { auth, db, appId, UNIT_CODES, UNIT_LABELS } from './config/firebase';
import { ROOM_LIST, ALL_BIDANG_RKBMD, JENIS_USULAN_RKBMD } from './config/constants';
import { safeString, loadScripts, formatCurrency, parseDateRobust, parseKodeBarangData, calculateNilaiBuku, formatDisplayDate, getSafeDateString } from './utils/helpers';
import { exportLabelWord } from './utils/exportLabelWord';
import ModalFeedback from './components/modals/ModalFeedback';
import ModalBulkLabelExport from './components/modals/ModalBulkLabelExport';
import ModalManualLabel from './components/modals/ModalManualLabel';
import ModalLinkAset from './components/modals/ModalLinkAset';
import ModalEditNilaiBuku from './components/modals/ModalEditNilaiBuku';
import ModalTransferUnit from './components/modals/ModalTransferUnit';
import ModalEditTanah from './components/modals/ModalEditTanah';
import ModalRKBMD from './components/modals/ModalRKBMD';
import ModalAddAsset from './components/modals/ModalAddAsset';
import ModalAddRoomAsset from './components/modals/ModalAddRoomAsset';
import ModalTransfer from './components/modals/ModalTransfer';
import ModalEditPajakOwner from './components/modals/ModalEditPajakOwner';
import ModalManualDisposal from './components/modals/ModalManualDisposal';
import DashboardView from './components/views/DashboardView';
import DataAsetView from './components/views/DataAsetView';
import RuanganView from './components/views/RuanganView';
import PajakView from './components/views/PajakView';
import SuratKendaraanView from './components/views/SuratKendaraanView';
import RkbmdView from './components/views/RkbmdView';
import TanahView from './components/views/TanahView';
import HistoryView from './components/views/HistoryView';
import MonitoringView from './components/views/MonitoringView';
import PenghapusanView from './components/views/PenghapusanView';
import UlasanView from './components/views/UlasanView';
import LaporanView from './components/views/LaporanView';
import { exportDocx } from "./utils/exportDocx";
import { exportLabelExcel } from "./utils/exportLabelExcel";
import {formatRupiah} from "./utils/helpers";
import { buildBarangData,buildBastBarangData} from "./utils/exportHelpers";
import { buildBastKendaraanData} from "./utils/exportHelpers";
import { terbilang, capitalize } from "./utils/helpers";

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
  
  const generateBAST = async (item, sender, receiver) => {
    try {
        
        if (!templates.bast_barang?.url) {

             console.log("SEMUA TEMPLATE:", templates);
             console.log("TEMPLATE BAST:", templates?.bast);

            customAlert(
                "Template belum ada",
                "Silakan upload template BAST terlebih dahulu."
            );
            return;
           
        }

        const sekarang = new Date();

        const hari = sekarang.toLocaleDateString("id-ID", {
            weekday: "long"
        });

        const bulan = sekarang.toLocaleDateString("id-ID", {
            month: "long"
        });

        const tahun = sekarang.getFullYear();

        const barang = buildBastBarangData(
            [item],
            priceData,
            sender,
            safeString
        );

        const dataTemplate = {
                
            nama_pihak_pertama: safeString(sender.nama),
            nip_pihak_pertama: safeString(sender.nip),
            jabatan_pihak_pertama: safeString(sender.jabatan),

            nama_pihak_kedua: safeString(receiver.nama),
            nip_pihak_kedua: safeString(receiver.nip),
            jabatan_pihak_kedua: safeString(receiver.jabatan),

            hari,
            tanggal_terbilang: capitalize(terbilang(sekarang.getDate())),
            bulan,       
            tahun_terbilang: capitalize(terbilang(tahun)),
            barang

        };

        console.log("DATA BAST", dataTemplate);

        await exportDocx(
            templates.bast_barang.url,
            dataTemplate,
            `BAST - ${safeString(item.nama)} - ${safeString(sender.nama)}.docx`
        );
        
    } catch (err) {

        console.error(err);

        customAlert(
            "Export gagal",
            err.message || "Terjadi kesalahan saat membuat BAST."
        );

    }
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


  const generateBASTKendaraan = async (item, sender, receiver) => {
    console.log("===== ITEM KENDARAAN =====");
    console.log(item);

    try {

        if (!templates.bast_kendaraan?.url) {

            customAlert(
                "Template belum ada",
                "Silakan upload template BAST Kendaraan."
            );

            return;
        }

        const sekarang = new Date();

        const hari = sekarang.toLocaleDateString(
            "id-ID",
            {
                weekday: "long"
            }
        );

        const bulan = sekarang.toLocaleDateString(
            "id-ID",
            {
                month: "long"
            }
        );

        const kendaraan = buildBastKendaraanData(
            [item],
            safeString
        );

        const dataTemplate = {

            nama_pihak_pertama: safeString(sender.nama),
            nip_pihak_pertama: safeString(sender.nip),
            jabatan_pihak_pertama: safeString(sender.jabatan),

            nama_pihak_kedua: safeString(receiver.nama),
            nip_pihak_kedua: safeString(receiver.nip),
            jabatan_pihak_kedua: safeString(receiver.jabatan),

            hari,
            tanggal_terbilang: terbilang(sekarang.getDate()),
            bulan,
            tahun_terbilang: terbilang(sekarang.getFullYear()),

            kendaraan

        };

        await exportDocx(
            templates.bast_kendaraan.url,
            dataTemplate,
            `BAST Kendaraan - ${safeString(item.no_polisi)}.docx`
        );

    } catch (err) {

        console.error(err);

        customAlert(
            "Export gagal",
            err.message
        );

    }

};

const generateSPPKD = async (
    kendaraan,
    pengemudi,
    pengurus,
    tujuan
) => {
    try {
        if (!templates.sppkd?.url) {
            customAlert(
                "Template belum ada",
                "Silakan upload template SPPKD."
            );
            return;
        }

        const sekarang = new Date();

        const dataTemplate = {
            // Kendaraan
            jenis_kendaraan: safeString(kendaraan.nama),
            no_polisi: safeString(
                kendaraan.no_polisi ||
                kendaraan.no_kartu ||
                "-"
            ),

            // Pengemudi
            nama_pengemudi: safeString(pengemudi),

            // Pengurus barang
            nama_pengurus: safeString(pengurus?.nama),
            nip_pengurus: safeString(pengurus?.nip),

            // Perjalanan
            tujuan: safeString(tujuan),

            // Tanggal pembuatan
            tanggal: sekarang.getDate().toString(),
            bulan: sekarang.toLocaleDateString("id-ID", {
                month: "long"
            }),
            tahun: sekarang.getFullYear().toString()
        };

        console.log("DATA SPPKD:", dataTemplate);

        await exportDocx(
            templates.sppkd.url,
            dataTemplate,
            `SPPKD - ${safeString(kendaraan.no_kartu)}.docx`
        );

    } catch (err) {
        console.error("ERROR SPPKD:", err);
        customAlert("Export SPPKD gagal", err.message);
    }
};

  const handleExportBulkLabel = async (
    items,
    defaultLocation = "Kumpulan Aset"
) => {

    if (!templates.label?.url) {

        customAlert(
            "Template belum ada",
            "Silakan upload template label."
        );

        return;

    }

    await exportLabelExcel(

        templates.label.url,

        items,

        defaultLocation,

        priceData,

        data,

        safeString

    );

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
    const unsubPr = onSnapshot(
        collection(db, 'artifacts', appId, 'public', 'data', 'prices'),
        s => {
            const t = {};

            s.forEach(d => {

                if (d.data().nama === "TOYOTA KIJANG KAPSUL") {
                    console.log("TOYOTA FIRESTORE", d.data());
                }

                t[d.id] = {
                    id: d.id,
                    ...d.data()
                };

            });

            setPriceData(t);
        },
        err => console.error(err)
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
        s => { if(s.exists()) setTemplates(s.data()); else setTemplates({ sppbi: '',  bast_barang: '', kir: '', label: '' }); },
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

        const row = jsonData[i];
        if (!row) continue;

        const jenisKendaraan = safeString(row[1]).trim();
        const noPolisi = safeString(row[3]).trim();

        if (
            !noPolisi ||
            noPolisi.toLowerCase() === 'nomor polisi' ||
            noPolisi.toUpperCase().includes('NOMOR POLISI')
        ) continue;

        if (
            !jenisKendaraan ||
            jenisKendaraan.toLowerCase().includes('roda')
        ) continue;


        // ==========================
        // NO RANGKA & NO MESIN
        // ==========================

        const rangkaMesinRaw = safeString(row[4]).trim();

        let noRangka = "";
        let noMesin = "";

        if (rangkaMesinRaw) {

            // Excel biasanya menyimpan:
            // NO RANGKA
            // NO MESIN
            // dalam satu cell dengan baris baru

            const parts = rangkaMesinRaw
                .split(/\r?\n/)
                .map(x => x.trim())
                .filter(Boolean);

            noRangka = parts[0] || "";
            noMesin = parts[1] || "";
        }


        // ==========================
        // TANGGAL PAJAK
        // ==========================

        let tglPajakRaw = row[6];
        let tglPajakIso = null;

        if (tglPajakRaw) {
            const parsedDate = parseDateRobust(tglPajakRaw);

            if (parsedDate) {
                tglPajakIso = parsedDate.toISOString();
            }
        }


        // ==========================
        // SIMPAN KE FIRESTORE
        // ==========================

        const safeId = noPolisi.replace(
            /[^a-zA-Z0-9.-]/g,
            '_'
        );

        const payload = {
            ...injectUnit,

            nama: jenisKendaraan.toUpperCase(),

            no_kartu: noPolisi,

            lokasi: safeString(row[5]).trim() || 'N/A',

            no_rangka: noRangka,
            no_mesin: noMesin,

            tgl_pajak:
                tglPajakIso ||
                safeString(tglPajakRaw),

            updatedAt: serverTimestamp()
        };


        console.log("UPLOAD KENDARAAN:", payload);


        batch.set(
            doc(
                db,
                'artifacts',
                appId,
                'public',
                'data',
                'prices',
                safeId
            ),
            payload,
            { merge: true }
        );


        count++;

        if (count % 400 === 0) {

            await batch.commit();

            batch = writeBatch(db);

            setStatus(prev => ({
                ...prev,
                progress: Math.round(
                    (i / jsonData.length) * 100
                )
            }));
        }
    }

} else if (status.uploadType === 'tanah') {
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
        
        await b.commit(); setModals({...modals, transfer: false}); await generateBAST(safeTransferItem, selectedUser, target);
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
      const { item } = editPajakModal;console.log("processPajakOwner dijalankan"); if (!item || !user) return; setStatus({ ...status, loading: true });
      try {
          const safeId = item.no_kartu ? safeString(item.no_kartu).trim().replace(/[^a-zA-Z0-9.-]/g, '_') : safeString(item.nama).toUpperCase().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
          let locName = targetIdParam; const isPegawai = (data || []).find(p => p.nip === targetIdParam); if (isPegawai) locName = isPegawai.nama;
          // Pemegang baru
            const receiver = isPegawai;

            // Pemegang lama
            const sender = (data || []).find(
                p => p.nama === item.lokasi || p.nama === item.pemegang
            );
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'prices', safeId), { lokasi: locName, updatedAt: serverTimestamp() }, { merge: true });
                if (sender && receiver) {
            console.log("Mau generate BAST");
            console.log(sender);
            console.log(receiver);
            await generateBASTKendaraan(item,sender,receiver);
} 
          customAlert("Berhasil", "Pemegang kendaraan telah diperbarui."); setEditPajakModal({ show: false, item: null });
      } catch (e) {
            console.error("processPajakOwner ERROR:", e);
            customAlert("Error", e.message);
        }
      setStatus({ ...status, loading: false });
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
         } catch (e) {
        } 
      setStatus({ ...status, loading: false });
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
  const CLOUDINARY_CLOUD_NAME = 'gctf50zw';       // ganti dengan Cloud Name kamu
  const CLOUDINARY_UPLOAD_PRESET = 'preset_inventaris';   // ganti dengan Unsigned Upload Preset kamu

  const uploadToCloudinary = async (file) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const isPdf = file.type === "application/pdf";

    const resourceType =
        isImage ? "image" :
        isVideo ? "video" :
        isPdf ? "auto" :
        "raw"; // pdf/xlsx/xls masuk 'raw'

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    const res = await fetch(url, { method: 'POST', body: formData });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `Upload gagal (status ${res.status})`);
    }

    const data = await res.json();

        console.log("UPLOAD RESULT", data);

        let fileUrl = data.secure_url;

        if (file.type === "application/pdf") {
            fileUrl += "?fl_attachment=1";
        }

        return fileUrl;
    };

 const savePhotoToCloud = async () => {
    if (!photoModal.file || !user) return;

    setStatus({ ...status, loading: true });

    try {
        const file = photoModal.file;

        //console debug
        console.log("photoModal =", photoModal);
        console.log("item =", photoModal.item);
        console.log("pajak_history =", photoModal.item?.pajak_history);
        console.log("tahun =", photoModal.pajakYear);
        console.log(
            "current =",
            photoModal.item?.pajak_history?.[photoModal.pajakYear]
        );

        if (
            photoModal.isPajak &&
            photoModal.item?.[`pajak_history.${photoModal.pajakYear}`]
        ) {
            setStatus({ ...status, loading: false });

            customAlert(
                "Data Sudah Ada",
                `Bukti pembayaran pajak tahun ${photoModal.pajakYear} sudah tersedia dan tidak dapat diunggah kembali.`
            );

            return;
        }

        const downloadURL = await uploadToCloudinary(file);
        
        console.log("downloadURL =", downloadURL);

        // ==========================
        // FOTO SPPBI
        // ==========================
        if (photoModal.isSPPBI) {

            await setDoc(
                doc(
                    db,
                    'artifacts',
                    appId,
                    'public',
                    'data',
                    'pegawai',
                    safeString(selectedUser?.nip).replace(/\s/g, '')
                ),
                {
                    sppbiPhoto: downloadURL,
                    lastSync: serverTimestamp()
                },
                { merge: true }
            );

            console.log("setDoc SPPBI berhasil");
        }

        // ==========================
        // PAJAK
        // ==========================
        else if (photoModal.isPajak) {

            const safeId = photoModal.item.no_kartu
                ? safeString(photoModal.item.no_kartu)
                    .trim()
                    .replace(/[^a-zA-Z0-9.-]/g, '_')
                : safeString(photoModal.item.nama)
                    .toUpperCase()
                    .replace(/[^a-zA-Z0-9]/g, '_')
                    .substring(0, 100);

            await setDoc(
                doc(
                    db,
                    'artifacts',
                    appId,
                    'public',
                    'data',
                    'prices',
                    safeId
                ),
                {
                    [`pajak_history.${photoModal.pajakYear}`]: downloadURL,
                    updatedAt: serverTimestamp()
                },
                { merge: true }
            );
        }

        // ==========================
        // PBB
        // ==========================
        else if (photoModal.isPBB) {

            const safeId =
                photoModal.item.id ||
                safeString(photoModal.item.kib)
                    .replace(/[^a-zA-Z0-9.-]/g, '_');

            await setDoc(
                doc(
                    db,
                    'artifacts',
                    appId,
                    'public',
                    'data',
                    'tanah',
                    safeId
                ),
                {
                    [`pbb_history.${photoModal.pbbYear}`]: downloadURL,
                    updatedAt: serverTimestamp()
                },
                { merge: true }
            );

            console.log("setDoc PBB berhasil");
        }

        // ==========================
        // RKBMD
        // ==========================
        else if (photoModal.isRkbmdArchive) {

            const safeId =
                `${photoModal.rkbmdMeta.tahun}_` +
                `${photoModal.rkbmdMeta.jenis.replace(/[^a-zA-Z0-9]/g, '')}_` +
                `${photoModal.rkbmdMeta.bidang.replace(/[^a-zA-Z0-9]/g, '')}`;

            await setDoc(
                doc(
                    db,
                    'artifacts',
                    appId,
                    'public',
                    'data',
                    'rkbmd_arsip',
                    safeId
                ),
                {
                    fileUrl: downloadURL,
                    updatedAt: serverTimestamp()
                },
                { merge: true }
            );

            console.log("setDoc RKBMD berhasil");
        }

        // ==========================
        // DEFAULT
        // ==========================
        else {

            const safeId = photoModal.item.no_kartu
                ? safeString(photoModal.item.no_kartu)
                    .trim()
                    .replace(/[^a-zA-Z0-9.-]/g, '_')
                : safeString(photoModal.item.nama)
                    .toUpperCase()
                    .replace(/[^a-zA-Z0-9]/g, '_')
                    .substring(0, 100);

            await setDoc(
                doc(
                    db,
                    'artifacts',
                    appId,
                    'public',
                    'data',
                    'prices',
                    safeId
                ),
                {
                    photoBase64: downloadURL,
                    updatedAt: serverTimestamp()
                },
                { merge: true }
            );

            console.log("setDoc DEFAULT berhasil");
        }

        setPhotoModal({
            show: false,
            item: null,
            preview: null,
            file: null,
            isSPPBI: false,
            isPajak: false,
            isPBB: false,
            isRkbmdArchive: false,
            rkbmdMeta: null,
            pajakYear: '',
            pbbYear: '',
            isPdf: false,
            isExcel: false,
            fileName: ''
        });

        setStatus({ ...status, loading: false });

        customAlert(
            "Berhasil",
            "File dokumen berhasil diunggah ke server."
        );

    } catch (e) {

        console.error(e);

        setStatus({
            ...status,
            loading: false
        });

        customAlert(
            "Upload Gagal",
            `Pesan Error: ${e.message}`
        );
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
          
          const downloadURL = await uploadToCloudinary(file);
          console.log("Cloudinary URL:", downloadURL);
          console.log("photoModal =", photoModal);
          
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
  const handleTemplateUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus((prev) => ({ ...prev, loading: true }));

    try {
        const downloadURL = await uploadToCloudinary(file);

        await setDoc(
            doc(
                db,
                "artifacts",
                appId,
                "public",
                "data",
                "templates_doc",
                activeUnitView
            ),
            {
                [type]: {
                    url: downloadURL,
                    fileName: file.name,
                    fileType: file.type,
                    updatedAt: serverTimestamp()
                }
            },
            { merge: true }
        );

        customAlert("Berhasil", "Template berhasil diperbarui!");
    } catch (err) {
        console.error(err);
        customAlert("Gagal", err.message);
    }

    setStatus((prev) => ({ ...prev, loading: false }));
    e.target.value = "";
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

            const handleExportBastBarang = () => {
                customAlert(
                    "Dalam Pengembangan",
                    "Export BAST Barang belum diimplementasikan."
                );
            };

            const handleExportBastKendaraan = () => {
                customAlert(
                    "Dalam Pengembangan",
                    "Export BAST Kendaraan belum diimplementasikan."
                );
            };

            const handleExportSPPKD = () => {
                customAlert(
                    "Dalam Pengembangan",
                    "Export SPPKD belum diimplementasikan."
                );
            };
            
            const handleExportWordSPPBI = async (single) => {
            
    try {
        const targets = single
            ? [single]
            : (filteredPegawaiData || []).filter(
                p => p.items && p.items.length > 0
            );

        if (targets.length === 0) {
            return customAlert(
                "Kosong",
                "Data kosong."
            );
        }

        const tanggalLengkap =
        new Intl.DateTimeFormat(
            "id-ID",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(new Date());

        for (const p of targets) {
            let userItemsToShow = p.items || [];

            userItemsToShow = userItemsToShow.filter(
                it =>
                    !safeString(it.nama)
                        .toUpperCase()
                        .includes("DINAS PERKEBUNAN")
            );

            if (userItemsToShow.length === 0) {
                continue;
            }

            const barang = buildBarangData(
                userItemsToShow,
                priceData,
                p,
                safeString
            );

            const data = {
                nama_asn: safeString(p.nama),
                nip_asn: safeString(p.nip),
                jabatan_asn: safeString(p.jabatan),
                tanggal_lengkap: tanggalLengkap,
                barang
            };

            if (!templates.sppbi?.url) {
                customAlert(
                    "Template belum ada",
                    "Silakan upload template SPPBI terlebih dahulu."
                );
                return;
            }

            console.log("DATA UNTUK TEMPLATE", data);

            await exportDocx(
                templates.sppbi.url,
                data,
                `SPPBI - ${safeString(p.nama)}.docx`
            );
        }
    } catch (err) {
        console.error(err);
        customAlert(
            "Export gagal",
            err.message || "Terjadi kesalahan saat membuat dokumen."
        );
    }
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
              "Ada Bukti Bayar (Tahun Dipilih)":
                it[`pajak_history.${pajakSelectedYear}`] ? "Ya" : "Tidak"
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
            <DashboardView activeUnitView={activeUnitView} filteredPegawaiData={filteredPegawaiData} filteredPriceData={filteredPriceData} handleApproveMutasi={handleApproveMutasi} handleRejectMutasi={handleRejectMutasi} isDarkMode={isDarkMode} mutasiPendingData={mutasiPendingData} setActiveTab={setActiveTab} setShowDashboardAlert={setShowDashboardAlert} showDashboardAlert={showDashboardAlert} statsAsetAktif={statsAsetAktif} statsPenghapusan={statsPenghapusan} statsReAktif={statsReAktif} status={status} todayBookings={todayBookings} totalStat={totalStat} userRole={userRole} visibleRkbmdData={visibleRkbmdData} />
         )}
         {/* --- Data Pegawai --- */}
         {activeTab === 'data' && (
            <DataAsetView confirmDelete={confirmDelete} data={data} handleExportBulkLabel={handleExportBulkLabel} handleExportWordSPPBI={handleExportWordSPPBI} handleSearchChange={handleSearchChange} isDarkMode={isDarkMode} isPegawaiEditable={isPegawaiEditable} modals={modals} priceData={priceData} searchTerm={searchTerm} selectedUser={selectedUser} setModals={setModals} setPhotoModal={setPhotoModal} setTransferItem={setTransferItem} setTransferUnitModal={setTransferUnitModal} templates={templates} />
         )}
         {/* --- Inventaris Ruangan --- */}
         {activeTab === 'ruangan' && (
            <RuanganView confirmDelete={confirmDelete} currentRoomData={currentRoomData} data={data} dynamicRooms={dynamicRooms} filteredPriceData={filteredPriceData} handleAddRoom={handleAddRoom} handleDeleteRoom={handleDeleteRoom} handleExportBulkLabel={handleExportBulkLabel} handleExportKIRWord={handleExportKIRWord} handleUnlinkFromMaster={handleUnlinkFromMaster} isDarkMode={isDarkMode} isPegawaiEditable={isPegawaiEditable} isReadOnly={isReadOnly} modals={modals} newRoomName={newRoomName} priceData={priceData} selectedRoomName={selectedRoomName} selectedUser={selectedUser} setEditRoom={setEditRoom} setModals={setModals} setNewRoomName={setNewRoomName} setSelectedRoomName={setSelectedRoomName} setTransferItem={setTransferItem} setTransferUnitModal={setTransferUnitModal} status={status} templates={templates} />
         )}
         {/* --- PAJAK KENDARAAN --- */}
         {activeTab === 'pajak' && (
            <PajakView handleExportPajak={handleExportPajak} handleExportWordSPPBIVehicle={handleExportWordSPPBIVehicle} handlePerpanjangPajak={handlePerpanjangPajak} isDarkMode={isDarkMode} isReadOnly={isReadOnly} pajakSelectedYear={pajakSelectedYear} pajakYearsList={pajakYearsList} setEditPajakModal={setEditPajakModal} setPajakSelectedYear={setPajakSelectedYear} setPajakYearsList={setPajakYearsList} setPhotoModal={setPhotoModal} vehicleItems={vehicleItems} />
         )}
         {/* --- SURAT JALAN KENDARAAN --- */}
         {activeTab === 'surat-kendaraan' && ((userRole === 'admin' && activeUnitView === UNIT_CODES.PUSAT) || userRole === 'staff') && (
             <SuratKendaraanView availableVehicles={availableVehicles} handleExportSuratJalan={handleExportSuratJalan} isDarkMode={isDarkMode} pengurusOptions={pengurusOptions} setSuratJalanForm={setSuratJalanForm} suratJalanForm={suratJalanForm} suratJalanHistory={suratJalanHistory} vehicleItems={vehicleItems} />
         )}
         {/* --- RKBMD --- */}
         {activeTab === 'rkbmd' && (
            <RkbmdView allowedBidangList={allowedBidangList} canEditRkbmd={canEditRkbmd} customAlert={customAlert} deleteRkbmd={deleteRkbmd} displayedRkbmdData={displayedRkbmdData} handleExportRkbmd={handleExportRkbmd} handleUploadRkbmdTemplate={handleUploadRkbmdTemplate} isDarkMode={isDarkMode} isReadOnly={isReadOnly} modals={modals} rkbmdArsip={rkbmdArsip} rkbmdFilters={rkbmdFilters} rkbmdSelectedJenis={rkbmdSelectedJenis} rkbmdSelectedYear={rkbmdSelectedYear} setModals={setModals} setPhotoModal={setPhotoModal} setRkbmdFilters={setRkbmdFilters} setRkbmdSelectedJenis={setRkbmdSelectedJenis} setRkbmdSelectedYear={setRkbmdSelectedYear} userRole={userRole} />
         )}
         {/* --- Inventaris Tanah --- */}
         {activeTab === 'tanah' && (userRole === 'admin' || (userRole === 'admin_upt' && userUnit === UNIT_CODES.P2BTP)) && (
            <TanahView filteredTanahDataFinal={filteredTanahDataFinal} handleExportTanah={handleExportTanah} isDarkMode={isDarkMode} isReadOnly={isReadOnly} modals={modals} pbbSelectedYear={pbbSelectedYear} pbbYearsList={pbbYearsList} setEditTanahModal={setEditTanahModal} setMediaTanahModal={setMediaTanahModal} setModals={setModals} setPbbSelectedYear={setPbbSelectedYear} setPbbYearsList={setPbbYearsList} setPhotoModal={setPhotoModal} setStatus={setStatus} setTanahSearch={setTanahSearch} status={status} tanahSearch={tanahSearch} userRole={userRole} />
         )}
         {/* --- Riwayat Mutasi --- */}
         {activeTab === 'history' && (
             <HistoryView filteredHistoryData={filteredHistoryData} isDarkMode={isDarkMode} />
         )}
         {/* --- Monitoring --- */}
         {activeTab === 'monitoring' && (
            <MonitoringView activeMonitoringData={activeMonitoringData} data={data} handleExportRekapPengguna={handleExportRekapPengguna} isDarkMode={isDarkMode} isReadOnly={isReadOnly} monitoringSelectedYear={monitoringSelectedYear} priceData={priceData} setEditNilaiModal={setEditNilaiModal} setLinkAsetModal={setLinkAsetModal} setMonitoringSearch={setMonitoringSearch} setMonitoringSelectedYear={setMonitoringSelectedYear} setPhotoModal={setPhotoModal} templates={templates} />
         )}
         {/* --- Usulan Penghapusan (Disposal) Tab --- */}
         {activeTab === 'penghapusan' && (userRole === 'admin' || userRole === 'admin_upt') && (
             <PenghapusanView disposalData={disposalData} handleRestoreItem={handleRestoreItem} isDarkMode={isDarkMode} modals={modals} processPermanentDisposal={processPermanentDisposal} setModals={setModals} setMonitoringSearch={setMonitoringSearch} />
         )}
         {/* --- Ulasan --- */}
         {activeTab === 'ulasan' && userRole === 'admin' && (
             <UlasanView feedbacks={feedbacks} isDarkMode={isDarkMode} />
         )}
         {/* --- Laporan --- */}
         {activeTab === 'laporan' && (
           <LaporanView
            activeUnitView={activeUnitView}
            customConfirm={customConfirm}
            handleExportExcel={handleExportExcel}
            handleExportWordSPPBI={handleExportWordSPPBI}

            handleExportBastBarang={handleExportBastBarang}
            handleExportBastKendaraan={handleExportBastKendaraan}
            handleExportSPPKD={handleExportSPPKD}

            handleTemplateUpload={handleTemplateUpload}
            isDarkMode={isDarkMode}
            isReadOnly={isReadOnly}
            modals={modals}
            selectedYear={selectedYear}
            setModals={setModals}
            setSelectedYear={setSelectedYear}
            setStatus={setStatus}
            status={status}
            templates={templates}
        />
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
                        {photoModal.isPdf ? (
                            <iframe
                                src={photoModal.preview}
                                title="Preview PDF"
                                className="w-full h-[65vh] rounded-xl border"
                            />
                        ) : photoModal.isExcel ? (
                            <div className="text-center">
                                <FileType size={48} className="text-emerald-500 mx-auto mb-4"/>
                                <a
                                    href={photoModal.preview}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                                >
                                    Unduh Excel
                                </a>
                            </div>
                        ) : (
                            <img
                                src={photoModal.preview}
                                alt="Preview"
                                className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-sm"
                            />
                        )}
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