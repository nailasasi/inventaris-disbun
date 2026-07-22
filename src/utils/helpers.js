// Fungsi utilitas umum (format, parsing tanggal, kalkulasi nilai buku, dsb)
import { DEFAULT_MASA_MANFAAT } from '../config/constants';

const safeString = (v) => (v === undefined || v === null || v === 'undefined') ? '' : String(v);

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

export { safeString, loadScripts, formatCurrency, parseDateRobust, parseKodeBarangData, calculateNilaiBuku, formatDisplayDate, getSafeDateString };
