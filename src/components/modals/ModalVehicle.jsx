import React, { useEffect, useState } from "react";
import { Car, Loader2 } from "lucide-react";

const ModalVehicle = ({
    show,
    onClose,
    onSave,
    statusLoading,
    initialData = null
}) => {

    const [form, setForm] = useState({
    id:"",
    nama:"",
    no_kartu:"",
    nomor_mesin:"",
    nomor_rangka:"",
    lokasi:"",
    tgl_pajak:"",
    tgl_pajak_5_tahun:""
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                id: initialData.id || "",
                nama: initialData.nama || "",
                no_kartu: initialData.no_kartu || "",
                nomor_mesin: initialData.nomor_mesin || "",
                nomor_rangka: initialData.nomor_rangka || "",
                lokasi: initialData.lokasi || "",
                tgl_pajak: initialData.tgl_pajak
                    ? initialData.tgl_pajak.substring(0,10)
                    : "",
                tgl_pajak_5_tahun: initialData.tgl_pajak_5_tahun
                    ? initialData.tgl_pajak_5_tahun.substring(0,10)
                    : ""
            });
        }
    }, [initialData]);

    const update = (key,val)=>{
        setForm(prev=>({
            ...prev,
            [key]:val
        }));
    };

    if(!show) return null;

    return(
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[700] backdrop-blur-sm p-4">

            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 w-full max-w-xl shadow-2xl">

                <h2 className="font-black text-xl flex gap-2 items-center mb-6">
                    <Car className="text-emerald-600"/>
                    {initialData ? "Edit Kendaraan" : "Tambah Kendaraan"}
                </h2>

                <div className="grid grid-cols-1 gap-4">

                    <input
                        className="p-3 rounded-xl border"
                        placeholder="Nama Kendaraan"
                        value={form.nama}
                        onChange={e=>update("nama",e.target.value)}
                    />

                    <input
                        className="p-3 rounded-xl border"
                        placeholder="Nomor Polisi"
                        value={form.no_kartu}
                        onChange={e=>update("no_kartu",e.target.value)}
                    />

                    <input
                        className="p-3 rounded-xl border"
                        placeholder="Nomor Mesin"
                        value={form.nomor_mesin}
                        onChange={e=>update("nomor_mesin",e.target.value)}
                    />

                    <input
                        className="p-3 rounded-xl border"
                        placeholder="Nomor Rangka"
                        value={form.nomor_rangka}
                        onChange={e=>update("nomor_rangka",e.target.value)}
                    />

                    <input
                        className="p-3 rounded-xl border"
                        placeholder="Pemegang"
                        value={form.lokasi}
                        onChange={e=>update("lokasi",e.target.value)}
                    />

                    <label className="font-bold text-sm">
                        Pajak Tahunan
                    </label>

                    <input
                        type="date"
                        className="p-3 rounded-xl border"
                        value={form.tgl_pajak}
                        onChange={e=>update("tgl_pajak",e.target.value)}
                    />

                    <label className="font-bold text-sm">
                        Pajak 5 Tahunan
                    </label>

                    <input
                        type="date"
                        className="p-3 rounded-xl border"
                        value={form.tgl_pajak_5_tahun}
                        onChange={e=>update("tgl_pajak_5_tahun",e.target.value)}
                    />

                </div>

                <div className="flex gap-3 mt-8">

                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-slate-200"
                    >
                        Batal
                    </button>

                    <button
                        disabled={statusLoading}
                        onClick={()=>onSave(form)}
                        className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold flex justify-center items-center gap-2"
                    >
                        {statusLoading
                            ? (
                                <Loader2 className="animate-spin"/>
                            )
                            : (
                                initialData
                                    ? "Update Kendaraan"
                                    : "Simpan Kendaraan"
                            )}
                    </button>

                </div>

            </div>

        </div>
    );
};

export default ModalVehicle;