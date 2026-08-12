import { QrCode } from 'lucide-react';
import React, { useMemo, useState } from 'react';

const ModalBulkLabelExport = ({
    onClose,
    monitoringData = [],
    onExport
}) => {

    const [filterType, setFilterType] = useState("orang");
    const [selectedValue, setSelectedValue] = useState("");
    const [location, setLocation] = useState("Semua Aset");

    // =========================================================
    // DAFTAR NAMA ORANG
    // =========================================================

    const daftarOrang = useMemo(() => {
        const names = monitoringData
            .map(item => String(item?.pemegang || "").trim())
            .filter(name =>
                name &&
                name !== "-" &&
                name !== "N/A"
            );

        return [...new Set(names)].sort((a, b) =>
            a.localeCompare(b, "id")
        );
    }, [monitoringData]);


    // =========================================================
    // DAFTAR NAMA BARANG
    // =========================================================

    const daftarBarang = useMemo(() => {
        const names = monitoringData
            .map(item => String(item?.nama || "").trim())
            .filter(name =>
                name &&
                name !== "-" &&
                name !== "N/A"
            );

        return [...new Set(names)].sort((a, b) =>
            a.localeCompare(b, "id")
        );
    }, [monitoringData]);


    // =========================================================
    // FILTER DATA SESUAI PILIHAN
    // =========================================================

    const filteredItems = useMemo(() => {

        if (!selectedValue) {
            return [];
        }

        const selected = selectedValue
            .trim()
            .toLowerCase();

        return monitoringData.filter(item => {

            if (filterType === "orang") {

                const pemegang = String(
                    item?.pemegang || ""
                )
                    .trim()
                    .toLowerCase();

                return pemegang === selected;
            }

            if (filterType === "barang") {

                const namaBarang = String(
                    item?.nama || ""
                )
                    .trim()
                    .toLowerCase();

                return namaBarang === selected;
            }

            return false;
        });

    }, [
        monitoringData,
        filterType,
        selectedValue
    ]);


    // =========================================================
    // KETIKA JENIS FILTER DIGANTI
    // =========================================================

    const handleFilterTypeChange = (type) => {
        setFilterType(type);
        setSelectedValue("");
    };


    // =========================================================
    // EXPORT
    // =========================================================

    const handleExport = () => {

        if (filteredItems.length === 0) {
            alert("Tidak ada aset yang sesuai dengan pilihan.");
            return;
        }

        onExport(
            filteredItems,
            location,
            filterType,
            selectedValue
        );

        onClose();
    };


    return (

        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4">

            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] w-full max-w-md shadow-2xl">

                {/* HEADER */}

                <h3 className="font-black text-xl mb-4 flex items-center gap-2 dark:text-white">
                    <QrCode className="text-emerald-500" />
                    Cetak Label Massal
                </h3>


                {/* JENIS FILTER */}

                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">
                    Cetak Berdasarkan
                </label>

                <select
                    value={filterType}
                    onChange={(e) =>
                        handleFilterTypeChange(e.target.value)
                    }
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white border dark:border-slate-700 rounded-xl mb-5 outline-none focus:border-emerald-500 font-bold"
                >
                    <option value="orang">
                        Per Nama Orang
                    </option>

                    <option value="barang">
                        Per Nama Barang
                    </option>
                </select>


                {/* PILIH NAMA */}

                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">

                    {filterType === "orang"
                        ? "Pilih Nama Orang"
                        : "Pilih Nama Barang"}

                </label>

                <select
                    value={selectedValue}
                    onChange={(e) =>
                        setSelectedValue(e.target.value)
                    }
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white border dark:border-slate-700 rounded-xl mb-5 outline-none focus:border-emerald-500 font-bold"
                >

                    <option value="">
                        -- Pilih --
                    </option>

                    {filterType === "orang"
                        ? daftarOrang.map((nama, index) => (
                            <option
                                key={index}
                                value={nama}
                            >
                                {nama}
                            </option>
                        ))

                        : daftarBarang.map((nama, index) => (
                            <option
                                key={index}
                                value={nama}
                            >
                                {nama}
                            </option>
                        ))
                    }

                </select>


                {/* LOKASI DEFAULT */}

                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">
                    Lokasi Default
                </label>

                <input
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white border dark:border-slate-700 rounded-xl mb-4 outline-none focus:border-emerald-500 font-bold"
                    placeholder="Misal: Kantor Pusat"
                    value={location}
                    onChange={e =>
                        setLocation(e.target.value)
                    }
                />


                {/* INFO HASIL */}

                <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-400">

                    {selectedValue
                        ? `${filteredItems.length} label akan dicetak`
                        : "Silakan pilih nama terlebih dahulu"
                    }

                </div>


                {/* BUTTON */}

                <div className="flex gap-2">

                    <button
                        onClick={onClose}
                        className="w-1/3 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        Batal
                    </button>

                    <button
                        onClick={handleExport}
                        disabled={
                            !selectedValue ||
                            filteredItems.length === 0
                        }
                        className="w-2/3 py-4 bg-emerald-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <QrCode size={18} />

                        Cetak {filteredItems.length} Label
                    </button>

                </div>

            </div>

        </div>
    );
};

export default ModalBulkLabelExport;