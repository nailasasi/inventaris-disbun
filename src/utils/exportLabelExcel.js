import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exportLabelExcel(
    templateUrl,
    items,
    defaultLocation,
    priceData,
    data,
    safeString
) {
    try {
        console.log("Template URL:", templateUrl);

        const response = await fetch(templateUrl);
        const arrayBuffer = await response.arrayBuffer();

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.worksheets[0];

        const LABEL_POSITIONS = [
            "C3",
            "F3",
            "C7",
            "F7",
            "C11",
            "F11",
            "C15",
            "F15",
            "C19",
            "F19",
            "C23",
            "F23"
        ];

        console.log("========== TEMPLATE ==========");
        LABEL_POSITIONS.forEach(pos => {
            console.log(pos, worksheet.getCell(pos).value);
        });

        console.log("========== ITEMS ==========");
        console.log("Jumlah item:", items.length);
        console.log(items);

        items.forEach((item, index) => {

            // Maksimal 12 label
            if (index >= LABEL_POSITIONS.length) return;

            const address = LABEL_POSITIONS[index];
            const cell = worksheet.getCell(address);

            console.log("=================================");
            console.log("INDEX :", index);
            console.log("CELL :", address);
            console.log("SEBELUM :", cell.value);

            cell.value = String(cell.value)
                .replaceAll("{no_kartu}", safeString(item.no_kartu))
                .replaceAll("{nama_barang}", safeString(item.nama))
                .replaceAll("{merk_tipe}", safeString(item.merk))
                .replaceAll("{tahun}", safeString(item.tahun))
                .replaceAll("{lokasi_user}", safeString(defaultLocation));

            console.log("SESUDAH :", cell.value);

            cell.alignment = {
                vertical: "middle",
                horizontal: "left",
                wrapText: true
            };
        });

        const buffer = await workbook.xlsx.writeBuffer();

        saveAs(
            new Blob([buffer]),
            "Template_Label_Hasil.xlsx"
        );

        console.log("Export selesai.");

    } catch (err) {
        console.error("ERROR EXPORT LABEL:", err);
    }
}