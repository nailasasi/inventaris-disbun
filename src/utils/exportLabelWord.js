// Fungsi export label Word untuk aset
import { User } from 'lucide-react';
import React from 'react';
import { doc } from 'firebase/firestore';
import { safeString } from './helpers';

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

    console.log("templates =", templates);
    console.log("templates.label =", templates.label);
    console.log("typeof =", typeof templates.label);
    
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

export { exportLabelWord };
