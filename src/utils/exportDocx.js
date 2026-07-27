import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

export async function exportDocx(templateUrl, data, fileName = "document.docx") {
    // download template dari Cloudinary
    const response = await fetch(templateUrl);

    if (!response.ok) {
        throw new Error("Template tidak dapat diunduh.");
    }

    // ubah menjadi ArrayBuffer
    const content = await response.arrayBuffer();

    // buka file docx
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    console.log("DATA DI EXPORTDOCX", data);
    // isi placeholder
    doc.render(data);

    // generate docx baru
    const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // download
    saveAs(blob, fileName);
}