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
  Trash2,
  History,
  Search,
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
  handleAddVehicle,
  handleEditVehicle,
  handleDeleteVehicle,
  handleVehicleHistory,
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

  // State untuk pencarian & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [pemegangFilter, setPemegangFilter] = useState("Semua");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleCopy = (text, key) => {
    if (!text || text === "-") return;
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // Helper: nama pemegang aktif (pegawai / ruangan / lokasi)
  const getPemegangName = (it) =>
    it.pemegang !== "-"
      ? safeString(it.pemegang)
      : it.ruangan !== "-"
        ? safeString(it.ruangan)
        : safeString(it.lokasi || "N/A");

  // Helper: kategori status masa berlaku pajak, dipakai untuk filter
  const getVehicleStatusCategory = (it) => {
    const tglMasa = parseDateRobust(
      getSafeDateString(it.tgl_pajak) || getSafeDateString(it.tgl_pengadaan),
    );
    if (!tglMasa) return "Aman";
    const diffDays = Math.ceil((tglMasa - new Date()) / 86400000);
    if (diffDays < 0) return "Lewat Waktu";
    if (diffDays <= 30) return "Akan Habis";
    return "Aman";
  };

  // Opsi dropdown Pemegang, diambil dinamis dari data kendaraan yang ada
  const pemegangOptions = [
    "Semua",
    ...Array.from(
      new Set(vehicleItems.map(getPemegangName).filter((v) => v && v !== "N/A")),
    ).sort(),
  ];

  // Saran (autocomplete) saat mengetik di kolom pencarian
  const suggestionMatches = searchQuery.trim()
    ? vehicleItems
        .filter((it) =>
          [it.nama, it.no_kartu].some((v) =>
            safeString(v).toLowerCase().includes(searchQuery.trim().toLowerCase()),
          ),
        )
        .slice(0, 6)
    : [];

  // Data kendaraan setelah difilter pencarian + status + pemegang
  const filteredVehicleItems = vehicleItems.filter((it) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      [
        it.nama,
        it.no_kartu,
        getPemegangName(it),
        it.nomor_mesin || it.no_mesin,
        it.nomor_rangka || it.no_rangka,
      ].some((v) => safeString(v).toLowerCase().includes(q));
    const matchesPemegang =
      pemegangFilter === "Semua" || getPemegangName(it) === pemegangFilter;
    const matchesStatus =
      statusFilter === "Semua" || getVehicleStatusCategory(it) === statusFilter;
    return matchesSearch && matchesPemegang && matchesStatus;
  });

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
          {!isReadOnly && (
            <button
              onClick={handleAddVehicle}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 text-xs hover:bg-emerald-700 transition-colors"
            >
              <PlusCircle size={16} />
              Tambah Kendaraan
            </button>
          )}

          <button
            onClick={handleExportPajak}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 text-xs hover:bg-blue-700 transition-colors ml-auto md:ml-2"
          >
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className={`px-4 md:px-8 py-6 border-b ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}>
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-grow">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Cari kendaraan, nomor polisi, pemegang, atau nomor mesin..."
              className={`w-full pl-9 pr-3 py-3 rounded-xl border outline-none text-sm font-semibold focus:border-emerald-500 ${isDarkMode ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-200 placeholder:text-slate-400"}`}
            />
            {showSuggestions && searchQuery.trim() && suggestionMatches.length > 0 && (
              <div
                className={`absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border shadow-xl ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
              >
                {suggestionMatches.map((it, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={() => {
                      setSearchQuery(safeString(it.no_kartu || it.nama));
                      setShowSuggestions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex flex-col ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-emerald-50"}`}
                  >
                    <span className="font-bold">{safeString(it.nama)}</span>
                    <span
                      className={`inline-block w-fit mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-mono ${isDarkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"}`}
                    >
                      {safeString(it.no_kartu)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`p-3 rounded-xl border outline-none text-sm font-bold min-w-[150px] shrink-0 ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
          >
            <option value="Semua">Status: Semua</option>
            <option value="Aman">Aman</option>
            <option value="Akan Habis">Akan Habis</option>
            <option value="Lewat Waktu">Lewat Waktu</option>
          </select>

          <select
            value={pemegangFilter}
            onChange={(e) => setPemegangFilter(e.target.value)}
            className={`p-3 rounded-xl border outline-none text-sm font-bold min-w-[170px] max-w-[240px] shrink-0 ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`}
          >
            {pemegangOptions.map((p) => (
              <option key={p} value={p}>
                {p === "Semua" ? "Pemegang: Semua" : p}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowSuggestions(false)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shrink-0"
          >
            <Search size={16} /> Cari
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 pb-4 md:pb-8 overflow-auto max-h-[70vh]">
        <table className="w-full text-left min-w-[1300px]">
          <thead>
            <tr className="text-xs font-black text-slate-400">
              <th className={`sticky top-0 z-10 pt-4 pb-4 px-4 whitespace-nowrap border-b ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>Kendaraan</th>
              <th className={`sticky top-0 z-10 pt-4 pb-4 px-4 whitespace-nowrap border-b ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>Pemegang</th>
              <th className={`sticky top-0 z-10 pt-4 pb-4 px-4 whitespace-nowrap border-b w-40 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>Nomor Mesin</th>
              <th className={`sticky top-0 z-10 pt-4 pb-4 px-4 whitespace-nowrap border-b w-52 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>Nomor Rangka</th>

              <th className={`sticky top-0 z-10 pt-4 pb-4 px-4 whitespace-nowrap border-b ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
                Tgl Pajak (Masa Berlaku)
              </th>
              <th className={`sticky top-0 z-10 pt-4 pb-4 px-4 whitespace-nowrap border-b ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
                Tgl Pajak 5 Tahun
              </th>
              <th className={`sticky top-0 z-10 pt-4 pb-4 px-4 text-center whitespace-nowrap border-b ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
                Pajak 5 Tahunan
              </th>
              <th className={`sticky top-0 z-10 pt-4 pb-4 px-4 text-center whitespace-nowrap border-b ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
                Status
              </th>
              <th className={`sticky top-0 z-10 pt-4 pb-4 px-4 text-center whitespace-nowrap border-b ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
                Foto Kendaraan
              </th>
              <th className={`sticky top-0 z-10 pt-4 pb-4 px-4 text-center whitespace-nowrap border-b ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
                Bukti Bayar {pajakSelectedYear}
              </th>
              <th className={`sticky top-0 z-10 pt-4 pb-4 px-4 text-center whitespace-nowrap border-b ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
                Aksi
              </th>
            </tr>
          </thead>

            
          <tbody className={`divide-y ${isDarkMode ? "divide-slate-700" : ""}`}>
          {filteredVehicleItems.length === 0 ? (
              <tr>
                  <td colSpan="11" className="text-center py-10 text-slate-400 font-bold">
                      {vehicleItems.length === 0
                        ? "Tidak ada data kendaraan terdeteksi."
                        : "Tidak ada kendaraan yang cocok dengan pencarian/filter."}
                  </td>
              </tr>
          ) : (
              filteredVehicleItems.map((it, i) => {

                  const tglMasa = parseDateRobust(
                  getSafeDateString(it.tgl_pajak) ||
                  getSafeDateString(it.tgl_pengadaan)
                );

                const tglPajak5 = parseDateRobust(
                  getSafeDateString(it.tgl_pajak_5_tahun)
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
                      <p className="font-bold text-sm">
                        {safeString(it.nama)}
                      </p>

                      {(() => {
                        const history = Array.isArray(it.nomor_polisi_history)
                          ? it.nomor_polisi_history
                          : [];

                        if (history.length > 0) {
                          const last = history[history.length - 1];

                          return (
                            <p className="text-xs text-blue-500 font-mono">
                              {safeString(last.dari)} ➜ {safeString(last.ke)}
                            </p>
                          );
                        }

                        return (
                          <p className="text-xs text-slate-400 font-mono">
                            {safeString(it.no_kartu)}
                          </p>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-500">
                      <div className="flex items-center gap-2 max-w-[220px]">
                        <span className="leading-snug break-words">
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
                          className="inline-block rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 hover:opacity-80 hover:ring-2 hover:ring-emerald-400 transition-all"
                          title="Lihat Foto Kendaraan"
                        >
                          <img
                            src={safeString(it.photoBase64)}
                            alt={safeString(it.nama)}
                            className="w-12 h-12 object-cover"
                          />
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
                      {!isReadOnly && (
                            <button
                                onClick={() => handleEditVehicle(it)}
                                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold hover:bg-yellow-200 transition-colors flex justify-center items-center gap-1 w-full"
                            >
                                <Edit3 size={12} />
                                Edit
                            </button>
                        )}
                      {!isReadOnly && (
                          <button
                              onClick={() => handleDeleteVehicle(it)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200 transition-colors flex justify-center items-center gap-1 w-full"
                          >
                              <Trash2 size={12} />
                              Hapus
                          </button>
                      )}
                      {!isReadOnly && (
                          <button
                              onClick={() => handleVehicleHistory(it)}
                              className="px-3 py-1 bg-sky-100 text-sky-700 rounded text-xs font-bold hover:bg-sky-200 transition-colors flex justify-center items-center gap-1 w-full"
                          >
                              <History size={12} />
                              Riwayat
                          </button>
                      )}
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