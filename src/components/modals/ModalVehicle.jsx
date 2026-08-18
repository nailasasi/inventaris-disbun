import React, { useEffect, useRef, useState } from "react";
import { Car, Loader2, ImagePlus, Lock, Eye, EyeOff } from "lucide-react";

const ModalVehicle = ({
    show,
    onClose,
    onSave,
    statusLoading,
    initialData = null,
    adminPassword = "",
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

    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const fileInputRef = useRef(null);

    const isEditMode = !!initialData;
    const requiresPassword = isEditMode && !!adminPassword;

    useEffect(() => {
        if (!show) return;

        setPhotoFile(null);
        setPassword("");
        setShowPassword(false);
        setPasswordError("");

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
            setPhotoPreview(initialData.photoBase64 || null);
        } else {
            // Mode Tambah Kendaraan: selalu mulai dari form kosong,
            // jangan bawa data sisa dari sesi Edit sebelumnya.
            setForm({
                id: "",
                nama: "",
                no_kartu: "",
                nomor_mesin: "",
                nomor_rangka: "",
                lokasi: "",
                tgl_pajak: "",
                tgl_pajak_5_tahun: ""
            });
            setPhotoPreview(null);
        }
    }, [initialData, show]);

    const update = (key,val)=>{
        setForm(prev=>({
            ...prev,
            [key]:val
        }));
    };

    const handlePickPhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("File yang dipilih harus berupa gambar.");
            return;
        }

        setPhotoFile(file);

        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!form.nama.trim() || !form.no_kartu.trim()) {
            alert("Nama Kendaraan dan Nomor Polisi wajib diisi.");
            return;
        }

        if (requiresPassword) {
            if (!password) {
                setPasswordError("Password admin wajib diisi untuk menyimpan perubahan.");
                return;
            }
            if (password !== adminPassword) {
                setPasswordError("Password admin salah. Perubahan tidak disimpan.");
                return;
            }
        }

        setPasswordError("");
        onSave({ ...form, photoFile });
    };

    if(!show) return null;

    const inputClass = "w-full p-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none mt-1 text-sm font-bold text-slate-900 dark:text-white";
    const labelClass = "text-[10px] font-bold text-slate-500 uppercase";

    return(
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">

            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">

                <h3 className="text-xl font-black mb-6 dark:text-white flex items-center gap-2">
                    <Car className="text-emerald-500" />
                    {initialData ? "Edit Kendaraan" : "Tambah Kendaraan"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* KOLOM KIRI — DATA DASAR */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm border-b pb-2 border-emerald-100 dark:border-emerald-900">
                            Data Dasar
                        </h4>

                        <div>
                            <label className={labelClass}>Nama Kendaraan</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={form.nama}
                                onChange={e => update("nama", e.target.value)}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Nomor Polisi</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={form.no_kartu}
                                onChange={e => update("no_kartu", e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <div className="w-1/2">
                                <label className={labelClass}>Nomor Mesin</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={form.nomor_mesin}
                                    onChange={e => update("nomor_mesin", e.target.value)}
                                />
                            </div>
                            <div className="w-1/2">
                                <label className={labelClass}>Nomor Rangka</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={form.nomor_rangka}
                                    onChange={e => update("nomor_rangka", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Pemegang</label>
                            <input
                                type="text"
                                className={`${inputClass} ${initialData ? "opacity-60 cursor-not-allowed" : ""}`}
                                value={form.lokasi}
                                readOnly={!!initialData}
                                disabled={!!initialData}
                                onChange={e => update("lokasi", e.target.value)}
                            />
                            {initialData && (
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Mutasi pemegang kendaraan dilakukan lewat ikon pensil pada kolom "Pemegang" di tabel, bukan dari sini.
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <div className="w-1/2">
                                <label className={labelClass}>Pajak Tahunan</label>
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={form.tgl_pajak}
                                    onChange={e => update("tgl_pajak", e.target.value)}
                                />
                            </div>
                            <div className="w-1/2">
                                <label className={labelClass}>Pajak 5 Tahunan</label>
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={form.tgl_pajak_5_tahun}
                                    onChange={e => update("tgl_pajak_5_tahun", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN — FOTO & OTORISASI */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-blue-600 dark:text-blue-400 text-sm border-b pb-2 border-blue-100 dark:border-blue-900">
                            Foto Kendaraan
                        </h4>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative group cursor-pointer rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-900/40 flex items-center justify-center h-48"
                        >
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Foto Kendaraan"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                    <ImagePlus size={28} />
                                    <span className="text-xs font-bold">Belum ada foto</span>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold flex items-center gap-1">
                                    <ImagePlus size={16} />
                                    {photoPreview ? "Ganti Foto" : "Upload Foto"}
                                </span>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePickPhoto}
                        />
                        {photoFile && (
                            <p className="text-[10px] text-emerald-600 font-bold">
                                Foto baru dipilih: {photoFile.name}
                            </p>
                        )}

                        {requiresPassword && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50 mt-6">
                                <label className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 mb-2">
                                    <Lock size={12} /> Password Otorisasi (Wajib)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password Admin untuk Menyimpan"
                                        className="w-full p-2.5 pr-10 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 rounded-lg outline-none focus:border-red-500 text-sm font-bold dark:text-red-100"
                                        value={password}
                                        onChange={e => {
                                            setPassword(e.target.value);
                                            if (passwordError) setPasswordError("");
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="text-[10px] text-red-500 font-bold mt-2">
                                        {passwordError}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 mt-8">
                    <button
                        onClick={onClose}
                        className="w-1/3 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                    >
                        Batal
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={statusLoading || (requiresPassword && !password)}
                        className="w-2/3 py-4 bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 rounded-xl flex justify-center items-center gap-2"
                    >
                        {statusLoading
                            ? <Loader2 className="animate-spin" size={20} />
                            : (initialData ? "Simpan Semua Perubahan" : "Simpan Kendaraan")}
                    </button>
                </div>

            </div>

        </div>
    );
};

export default ModalVehicle;