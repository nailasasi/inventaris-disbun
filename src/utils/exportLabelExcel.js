import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function sanitizeFileName(name) {
  return String(name)
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

// Satu-satunya sel yang berisi placeholder data barang di template.
// Merge C3:C5 — cukup tulis ke sel master-nya (C3).
const PLACEHOLDER_CELL = "C3";

function fillPlaceholders(text, item, defaultLocation, safeString) {
  return String(text)
    .replaceAll("{no_kartu}", safeString(item.no_kartu))
    .replaceAll("{nama_barang}", safeString(item.nama))
    .replaceAll("{merk_tipe}", safeString(item.merk))
    .replaceAll("{tahun}", safeString(item.tahun))
    .replaceAll("{lokasi_user}", safeString(defaultLocation));
}

// ===== Auto-fit teks label (wrap + tinggi baris + shrink font bertahap) =====

// Baris yang menyusun merged cell placeholder (C3:C5). Sesuaikan jika template berubah.
const PLACEHOLDER_ROWS = [3, 4, 5];

function excelColWidthToPx(width) {
  const MDW = 7; // Maximum Digit Width perkiraan standar (Calibri 11)
  return Math.floor(((256 * width + Math.floor(128 / MDW)) / 256) * MDW);
}

function ptToPx(pt) {
  return pt * (96 / 72);
}

function measureWrappedLineCount(ctx, text, fontSizePt, bold, fontFamily, maxWidthPx) {
  ctx.font = `${bold ? "bold " : ""}${ptToPx(fontSizePt)}px ${fontFamily}`;
  let totalLines = 0;

  String(text).split("\n").forEach(paragraph => {
    const words = paragraph.split(" ");
    let line = "";
    let lineCount = 0;

    words.forEach(word => {
      // Kata tunggal yang sendirian sudah lebih lebar dari cell
      // (mis. No. Kartu tanpa spasi) → pecah karakter per karakter,
      // sama seperti perilaku wrapText asli Excel saat mentok.
      if (ctx.measureText(word).width > maxWidthPx) {
        if (line) {
          lineCount++;
          line = "";
        }
        let chunk = "";
        for (const ch of word) {
          const testChunk = chunk + ch;
          if (chunk && ctx.measureText(testChunk).width > maxWidthPx) {
            lineCount++;
            chunk = ch;
          } else {
            chunk = testChunk;
          }
        }
        line = chunk;
        return;
      }

      const testLine = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(testLine).width > maxWidthPx) {
        lineCount++;
        line = word;
      } else {
        line = testLine;
      }
    });

    totalLines += lineCount + 1;
  });

  return totalLines;
}

// Menyesuaikan tinggi baris (naik, proporsional) dan font size (mengecil, bertahap
// & terakhir) HANYA pada area cell placeholder, tanpa mengubah desain lain.
function fitLabelText(cell, worksheet) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const baseFontSize = cell.font?.size || 8;
  const minFontSize = 6;
  const isBold = !!cell.font?.bold;
  const fontFamily = `${cell.font?.name || "Arial Narrow"}, Arial, sans-serif`;
  const lineHeightFactor = 1.25;
  const maxGrowthRatio = 1.8; // batas maksimal tinggi baris boleh membesar
  const cellPaddingPx = 8; // perkiraan padding kiri+kanan bawaan Excel

  const colLetter = cell.address.match(/[A-Z]+/)[0];
  const colWidthPx = Math.max(
    excelColWidthToPx(worksheet.getColumn(colLetter).width || 8) - cellPaddingPx,
    10
  );

  const originalHeights = PLACEHOLDER_ROWS.map(r => worksheet.getRow(r).height || 15);
  const originalTotalPt = originalHeights.reduce((a, b) => a + b, 0);
  const maxAllowedPt = originalTotalPt * maxGrowthRatio;

  let fontSize = baseFontSize;
  let requiredHeightPt;

  while (true) {
    const lines = measureWrappedLineCount(ctx, cell.value, fontSize, isBold, fontFamily, colWidthPx);
    requiredHeightPt = lines * fontSize * lineHeightFactor;
    if (requiredHeightPt <= maxAllowedPt || fontSize <= minFontSize) break;
    fontSize -= 0.5;
  }

  if (fontSize !== baseFontSize) {
    cell.font = { ...cell.font, size: fontSize };
  }

  const finalTotalPt = Math.min(Math.max(requiredHeightPt, originalTotalPt), maxAllowedPt);
  if (finalTotalPt > originalTotalPt) {
    const ratio = finalTotalPt / originalTotalPt;
    PLACEHOLDER_ROWS.forEach((r, idx) => {
      worksheet.getRow(r).height = originalHeights[idx] * ratio;
    });
  }
}

// Menduplikat 1 sheet template (isi, style, lebar kolom, tinggi baris,
// merge cell, dan page setup) menjadi sheet baru yang identik.
function cloneTemplateSheet(workbook, sourceSheet, sheetName) {
  const newSheet = workbook.addWorksheet(sheetName, {
    properties: sourceSheet.properties,
    pageSetup: sourceSheet.pageSetup,
    views: sourceSheet.views
  });

  newSheet.columns = sourceSheet.columns.map(col => ({ width: col.width }));

  // 1) Salin dulu nilai & style semua sel (sheet baru masih polos, belum di-merge)
  sourceSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const newRow = newSheet.getRow(rowNumber);
    newRow.height = row.height;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const newCell = newRow.getCell(colNumber);
      newCell.value = cell.value;
      newCell.style = cell.style;
    });
    newRow.commit();
  });

  // 2) BARU setelah semua nilai tersalin, terapkan merge cell persis seperti template
  sourceSheet.model.merges.forEach(range => {
    newSheet.mergeCells(range);
  });


    // Salin logo/gambar — ExcelJS tidak otomatis menyalin ini
  sourceSheet.getImages().forEach(img => {
    newSheet.addImage(img.imageId, img.range);
  });


  return newSheet;
}

export async function exportLabelExcel(
  templateUrl,
  items,
  defaultLocation,
  priceData,
  data,
  safeString,
  fileName = "Template_Label_Hasil"
) {
  try {
    if (!items || items.length === 0) {
      console.warn("Tidak ada barang untuk dicetak.");
      return;
    }

    const response = await fetch(templateUrl);
    const arrayBuffer = await response.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const templateSheet = workbook.worksheets[0];

    items.forEach((item, index) => {
      // SEMUA sheet, termasuk barang pertama, dibuat lewat clone.
      // templateSheet asli TIDAK PERNAH ditulisi langsung.
      const sheet = cloneTemplateSheet(workbook, templateSheet, `Label ${index + 1}`);

     const cell = sheet.getCell(PLACEHOLDER_CELL);
      cell.value = fillPlaceholders(cell.value, item, defaultLocation, safeString);
      cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      fitLabelText(cell, sheet);
    });

    // Buang sheet template mentah (masih berisi {placeholder}) dari hasil akhir
    workbook.removeWorksheet(templateSheet.id);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${sanitizeFileName(fileName)}.xlsx`);

    console.log(`Export selesai. Total label: ${items.length}`);
  } catch (err) {
    console.error("ERROR EXPORT LABEL:", err);
  }
}