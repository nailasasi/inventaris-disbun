/* global __firebase_config, __app_id */
// Konfigurasi Firebase & unit kerja
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const MANUAL_CONFIG = {
  apiKey: "AIzaSyCSWisYU_yau2S-Ktm1We_FBo1jx-GInmM",
  authDomain: "disbuninven.firebaseapp.com",
  projectId: "disbuninven",
  storageBucket: "disbuninven.firebasestorage.app",
  messagingSenderId: "751597078296",
  appId: "1:751597078296:web:f128fb8b302e175a6a806d"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : MANUAL_CONFIG;

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'production-v1';

const UNIT_CODES = {
    PUSAT: '020301.00000',
    P2BTP: '020301.00001',
    PSBP: '020301.00002'
};

const UNIT_LABELS = {
    [UNIT_CODES.PUSAT]: 'Dinas Perkebunan Pusat',
    [UNIT_CODES.P2BTP]: 'UPT P2BTP',
    [UNIT_CODES.PSBP]: 'UPT PSBP'
};

export { app, auth, db, storage, appId, UNIT_CODES, UNIT_LABELS };
