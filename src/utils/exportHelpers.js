import { formatRupiah, ambilTahun } from "./helpers";

export function buildBarangData(
    userItemsToShow,
    priceData,
    pegawai,
    safeString
) {
    return userItemsToShow.map((it, index) => {

        let pItem = Object.values(priceData || {}).find(
            x =>
                safeString(x.no_kartu) === safeString(it.no_kartu) &&
                safeString(it.no_kartu) !== ""
        );

        if (!pItem) {
            pItem = Object.values(priceData || {}).find(
                x =>
                    safeString(x.nama).toLowerCase() === safeString(it.nama).toLowerCase() &&
                    safeString(x.lokasi).toLowerCase() === safeString(pegawai.nama).toLowerCase()
            );
        }

        return {
            nomor: index + 1,
            jenis_barang: safeString(it.nama),
            merk_barang: safeString(it.merk || pItem?.merk || "-"),
            type_barang: "-",
            tanggal_tercatat: safeString(it.tahun || pItem?.tgl_pengadaan || "-"),
            kode_barang: safeString(it.no_kartu || pItem?.no_kartu || "-"),
            tahun_pengadaan: ambilTahun(it.tahun || pItem?.tgl_pengadaan),
            jumlah: "1",
            kondisi: "Baik",
            nomor_register: "-",
            harga_satuan: formatRupiah(pItem?.nilai_perolehan)
        };
    });
}