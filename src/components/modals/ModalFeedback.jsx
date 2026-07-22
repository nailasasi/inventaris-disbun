import { Star } from 'lucide-react';
import React, { useState } from 'react';

const ModalFeedback = ({ onClose, onSave }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] w-full max-w-md shadow-2xl">
                <h3 className="font-black text-xl mb-4 dark:text-white">Beri Masukan Aplikasi</h3>
                <div className="flex gap-2 mb-6 justify-center">
                    {[1, 2, 3, 4, 5].map(r => (
                        <Star key={r} size={32} onClick={() => setRating(r)} className={`cursor-pointer transition-colors ${rating >= r ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`} />
                    ))}
                </div>
                <textarea className="w-full p-4 border dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl mb-4 outline-none font-medium dark:text-white" rows="4" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Tulis komentar atau kendala Anda di sini..."></textarea>
                <button onClick={() => onSave(rating, comment)} disabled={!comment} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-emerald-700">Kirim Masukan</button>
                <button onClick={onClose} className="w-full py-4 mt-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">Batal</button>
            </div>
        </div>
    )
}

export default ModalFeedback;
