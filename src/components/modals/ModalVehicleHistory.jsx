import React from "react";
import { History, X } from "lucide-react";

const ModalVehicleHistory = ({
    show,
    onClose,
    history = [],
}) => {

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[900]">

            <div className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-2xl p-8 shadow-2xl">

                <div className="flex justify-between items-center mb-6">

                    <h2 className="font-black text-xl flex items-center gap-2">
                        <History className="text-emerald-600" />
                        Riwayat Nomor Polisi
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X />
                    </button>

                </div>

                {history.length === 0 ? (

                    <div className="text-center py-10 text-slate-400 font-bold">
                        Belum ada riwayat perubahan nomor polisi.
                    </div>

                ) : (

                    <div className="space-y-4">

                        {history.map((item, index) => (

                            <div
                                key={index}
                                className="border rounded-xl p-4"
                            >

                                <div className="text-xs text-slate-400 mb-2">
                                    {new Date(item.tanggal).toLocaleString("id-ID")}
                                </div>

                                <div className="font-bold">
                                    {item.nomor}
                                </div>

                                <div className="text-center text-slate-400 my-2">
                                    ↓
                                </div>

                                <div className="font-bold text-emerald-600">
                                    {item.berubah_ke}
                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
};

export default ModalVehicleHistory;