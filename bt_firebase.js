// bt_firebase.js  (ES Module - não colocar <script> aqui)

// ------------------ IMPORTS (CDN Firebase) ------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc,
  deleteDoc, updateDoc, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ------------------ SUA CONFIG DO FIREBASE ------------------
const firebaseConfig = {
  apiKey: "AIzaSyDhPL394SjXkgbrD6_dJSHN3vJ2Zou9erE",
  authDomain: "bigtrato-3a134.firebaseapp.com",
  projectId: "bigtrato-3a134",
  storageBucket: "bigtrato-3a134.firebasestorage.app",
  messagingSenderId: "604650099192",
  appId: "1:604650099192:web:86931f6066bf221080c60d"
};

// ------------------ INIT ------------------
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// carimba atualização no Firestore
const stamp = () => ({ updatedAt: serverTimestamp() });

// --------------- CLIENTES (coleção: clients) ----------------
export const Clients = {
  async list() {
    const q = query(collection(db, "clients"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  },
  async save(c) {
    if (c._id || c.id) {
      const id = String(c._id || c.id);
      await setDoc(doc(db, "clients", id), { ...c, ...stamp() }, { merge: true });
      return id;
    } else {
      const ref = await addDoc(collection(db, "clients"), {
        ...c, createdAt: serverTimestamp(), ...stamp()
      });
      return ref.id;
    }
  },
  async remove(id) {
    await deleteDoc(doc(db, "clients", String(id)));
  }
};

// --------------- ORÇAMENTOS (coleção: quotes) ---------------
export const Quotes = {
  async list() {
    const q = query(collection(db, "quotes"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  },
  async save(qt) {
    const docId = String(qt._id || qt.id || "");
    const base = { ...qt, ...stamp() };
    if (docId) {
      await setDoc(doc(db, "quotes", docId), base, { merge: true });
      return docId;
    } else {
      const ref = await addDoc(collection(db, "quotes"), {
        ...base, createdAt: serverTimestamp()
      });
      return ref.id;
    }
  },
  async remove(id) {
    await deleteDoc(doc(db, "quotes", String(id)));
  }
};
