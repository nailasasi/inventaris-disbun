import {
  Camera,
  Car,
  Download,
  Edit3,
  PlusCircle,
  Printer,
  Upload,
  Copy,
  Check,
} from "lucide-react";
import React, { useState } from "react";
import {
  getSafeDateString,
  parseDateRobust,
  safeString,
} from "../../utils/helpers";

const PajakView = ({
  handleExportPajak,
  handleExportWordSPPBIVehicle,
  handlePerpanjangPajak,
  isDarkMode,
  isReadOnly,
  pajakSelectedYear,
  pajakYearsList,
  setEditPajakModal,
  setPajakSelectedYear,
  setPajakYearsList,
  setPhotoModal,
  vehicleItems,
}) => {
  // State untuk melacak status copy per-item
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, key) => {
    if (!text || text === "-") return;
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div
      className={`rounded-[2rem] md:rounded-[3rem] shadow-xl border overflow-hidden ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"}`}
    >
      <div
        className={`p-6 md:p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50"}`}
      >
        <h3 className="font-black text-xl flex items-center gap-2">
          <Car className="text-emerald-600" /> Pajak Kendaraan Dinas
        </h3>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="font-bold text-xs text-slate-400">
            Arsip Pembayaran:
          </span>
          <select
            value={pajakSelectedYear}
            onChange={(e) => setPajakSelectedYear(e.target.value)}
            className={`p-2 font-bold text-sm outline-none border rounded-xl ${isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"}`}
          >
            {pajakYearsList.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              const cy = prompt("Masukkan Tahun Arsip Baru (Misal: 2031)");

              if (!cy) return;

              const tahun = cy.trim();

              if (isNaN(tahun) || tahun.length !== 4) {
                alert("Tahun harus terdiri dari 4 digit.");
                return;
              }

              if (pajakYearsList.includes(tahun)) {
                alert(`Tahun ${tahun} sudah tersedia.`);
                return;
              }

              setPajakYearsList((prev) =>
                [...prev, tahun].sort((a, b) => Number(a) - Number(b)),
              );
            }}
            className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200"
            title="Tambah Tahun"
          >
            <PlusCircle size={16} />
          </button>
          <button
            onClick={handleExportPajak}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 text-xs hover:bg-blue-700 transition-colors ml-auto md:ml-2"
          >
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>
      <div className="p-4 md:p-8 overflow-x-auto">
        <table className="w-full text-left min-w-[1300px]">
          <thead>
            <tr
              className={`text-xs font-black text-slate-400 border-b ${isDarkMode ? "border-slate-700" : ""}`}
            >
              <th className="pb-4 px-4 whitespace-nowrap">Kendaraan</th>
              <th className="pb-4 px-4 whitespace-nowrap">Pemegang</th>
              <th className="pb-4 px-4 whitespace-nowrap w-40">Nomor Mesin</th>
              <th className="pb-4 px-4 whitespace-nowrap w-52">Nomor Rangka</th>

              <th className="pb-4 px-4 whitespace-nowrap">
                Tgl Pajak (Masa Berlaku)
              </th>

              <th className="pb-4 px-4 whitespace-nowrap">Tgl Pajak 5 Tahun</th>

              <th className="pb-4 px-4 text-center whitespace-nowrap">
                Pajak 5 Tahunan
              </th>

              <th className="pb-4 px-4 text-center whitespace-nowrap">
                Status
              </th>

              <th className="pb-4 px-4 text-center whitespace-nowrap">
                Foto Kendaraan
              </th>

              <th className="pb-4 px-4 text-center whitespace-nowrap">
                Bukti Bayar {pajakSelectedYear}
              </th>

              <th className="pb-4 px-4 text-center whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? "divide-slate-700" : ""}`}>
            {vehicleItems.length === 0 ? (
              <tr>
                <td
                  colSpan="11"
                  className="text-center py-10 text-slate-400 font-bold"
                >
                  Tidak ada data kendaraan terdeteksi.
                </td>
              </tr>
            ) : (
              vehicleItems.map((it, i) => {
                const tglMasa = parseDateRobust(
                  getSafeDateString(it.tgl_pajak) ||
                    getSafeDateString(it.tgl_pengadaan),
                );

                const tglPajak5 = parseDateRobust(
                  getSafeDateString(it.tgl_pajak_5_tahun),
                );

                let diffDays = 0;
                let warning = false;
                let pajak5Tahunan = false;

                if (tglMasa) {
                  diffDays = Math.ceil((tglMasa - new Date()) / 86400000);
                  warning = diffDays <= 30;
                }

                if (tglPajak5) {
                  const diffPajak5 = Math.ceil(
                    (tglPajak5 - new Date()) / 86400000,
                  );

                  pajak5Tahunan = diffPajak5 >= 0 && diffPajak5 <= 30;
                }

                const currentBukti =
                  it[`pajak_history.${pajakSelectedYear}`] || null;

                const noMesin = safeString(
                  it.nomor_mesin || it.no_mesin || "-",
                );
                const noRangka = safeString(
                  it.nomor_rangka || it.no_rangka || "-",
                );

                return (
                  <tr
                    key={i}
                    className={
                      isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                    }
                  >
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-bold text-sm">{safeString(it.nama)}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        {safeString(it.no_kartu)}
                      </p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm font-bold text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="leading-snug">
                          {it.pemegang !== "-"
                            ? safeString(it.pemegang)
                            : it.ruangan !== "-"
                              ? safeString(it.ruangan)
                              : safeString(it.lokasi || "N/A")}
                        </span>
                        {!isReadOnly && (
                          <button
                            onClick={() =>
                              setEditPajakModal({ show: true, item: it })
                            }
                            className="text-emerald-500 p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded shrink-0"
                            title="Edit Pemegang"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* NOMOR MESIN */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 w-40">
                      <div className="flex items-center gap-1.5">
                        <span>{noMesin}</span>
                        {noMesin !== "-" && (
                          <button
                            onClick={() => handleCopy(noMesin, `mesin-${i}`)}
                            className="text-slate-400 hover:text-emerald-600 p-1 rounded transition-colors"
                            title="Salin No Mesin"
                          >
                            {copiedField === `mesin-${i}` ? (
                              <Check size={13} className="text-emerald-500" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* NOMOR RANGKA */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 w-52">
                      <div className="flex items-center gap-1.5">
                        <span
                          title={noRangka}
                          className="max-w-[150px] truncate"
                        >
                          {noRangka}
                        </span>
                        {noRangka !== "-" && (
                          <button
                            onClick={() => handleCopy(noRangka, `rangka-${i}`)}
                            className="text-slate-400 hover:text-emerald-600 p-1 rounded transition-colors shrink-0"
                            title="Salin No Rangka"
                          >
                            {copiedField === `rangka-${i}` ? (
                              <Check size={13} className="text-emerald-500" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-sm font-bold">
                      {tglMasa ? tglMasa.toLocaleDateString("id-ID") : "-"}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-sm font-bold">
                      {tglPajak5 ? tglPajak5.toLocaleDateString("id-ID") : "-"}
                    </td>

                    {/* PAJAK 5 TAHUNAN */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black ${
                          pajak5Tahunan
                            ? "bg-orange-100 text-orange-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {pajak5Tahunan ? "IYA" : "TIDAK"}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {tglMasa && (
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black ${
                            warning
                              ? diffDays < 0
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {diffDays < 0
                            ? "LEWAT WAKTU"
                            : warning
                              ? `H-${diffDays}`
                              : "AMAN"}
                        </span>
                      )}
                    </td>

                    {/* FOTO KENDARAAN */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {it.photoBase64 ? (
                        <button
                          onClick={() =>
                            setPhotoModal({
                              show: true,
                              item: it,
                              preview: safeString(it.photoBase64),
                              file: null,
                              isSPPBI: false,
                              isPajak: false,
                              isPBB: false,
                              isRkbmdArchive: false,
                              rkbmdMeta: null,
                              pajakYear: "",
                              pbbYear: "",
                              isPdf: false,
                              isExcel: false,
                              fileName: "",
                            })
                          }
                          className="text-[10px] md:text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 rounded py-1"
                        >
                          Lihat Foto
                        </button>
                      ) : !isReadOnly ? (
                        <button
                          onClick={() =>
                            setPhotoModal({
                              show: true,
                              item: it,
                              preview: null,
                              file: null,
                              isSPPBI: false,
                              isPajak: false,
                              isPBB: false,
                              isRkbmdArchive: false,
                              rkbmdMeta: null,
                              pajakYear: "",
                              pbbYear: "",
                              isPdf: false,
                              isExcel: false,
                              fileName: "",
                            })
                          }
                          className="text-slate-400 p-2 border border-transparent hover:border-emerald-200 rounded"
                          title="Upload Foto Kendaraan"
                        >
                          <Camera size={16} />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Kosong
                        </span>
                      )}
                    </td>

                    {/* BUKTI BAYAR */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {currentBukti ? (
                        <div className="flex flex-col gap-2 items-center">
                          <button
                            onClick={async () => {
                              const bukti = safeString(currentBukti);

                              try {
                                const response = await fetch(bukti);
                                if (!response.ok)
                                  throw new Error("Gagal mengambil file");
                                const blob = await response.blob();
                                const blobUrl = URL.createObjectURL(blob);

                                const cleanUrl = bukti.split("?")[0];
                                const ext =
                                  cleanUrl.substring(
                                    cleanUrl.lastIndexOf(".") + 1,
                                  ) || "file";

                                const a = document.createElement("a");
                                a.href = blobUrl;
                                a.download = `Bukti_Pajak_${safeString(it.no_kartu)}_${pajakSelectedYear}.${ext}`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                URL.revokeObjectURL(blobUrl);
                              } catch (err) {
                                console.error(err);
                                window.open(bukti, "_blank");
                              }
                            }}
                            className="text-xs text-blue-600 font-bold hover:underline border border-blue-200 px-2 py-1 rounded"
                          >
                            Lihat Bukti
                          </button>

                          {!isReadOnly && (
                            <button
                              onClick={() =>
                                setPhotoModal({
                                  show: true,
                                  item: it,
                                  preview: null,
                                  file: null,
                                  isSPPBI: false,
                                  isPajak: true,
                                  isPBB: false,
                                  isRkbmdArchive: false,
                                  rkbmdMeta: null,
                                  pajakYear: pajakSelectedYear,
                                  pbbYear: "",
                                  isPdf: false,
                                  isExcel: false,
                                  fileName: "",
                                })
                              }
                              className="text-xs text-orange-600 border border-orange-300 px-2 py-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            >
                              <Upload size={14} className="inline mr-1" />
                              Ganti
                            </button>
                          )}
                        </div>
                      ) : !isReadOnly ? (
                        <button
                          onClick={() =>
                            setPhotoModal({
                              show: true,
                              item: it,
                              preview: null,
                              file: null,
                              isSPPBI: false,
                              isPajak: true,
                              isPBB: false,
                              isRkbmdArchive: false,
                              rkbmdMeta: null,
                              pajakYear: pajakSelectedYear,
                              pbbYear: "",
                              isPdf: false,
                              isExcel: false,
                              fileName: "",
                            })
                          }
                          className="text-xs text-slate-400 border px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Upload size={14} className="inline mr-1" />
                          Upload
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Kosong
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap flex flex-col gap-2 justify-center items-center">
                      {/*
                      {!isReadOnly && (
                        <button
                          onClick={() => handlePerpanjangPajak(it)}
                          className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded hover:bg-emerald-100 transition-colors w-full"
                        >
                          + 1 Tahun
                        </button>
                      )}
                      */}
                      <button
                        onClick={() => handleExportWordSPPBIVehicle(it)}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold rounded hover:bg-indigo-100 transition-colors flex justify-center items-center gap-1 w-full"
                      >
                        <Printer size={12} /> SPPBI
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PajakView;
