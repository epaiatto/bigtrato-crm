import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, collection, getDocs, doc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ===== CONFIG FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyDhPL394SjXkgbrD6_dJSHN3vJ2Zou9erE",
  authDomain: "bigtrato-3a134.firebaseapp.com",
  projectId: "bigtrato-3a134",
  storageBucket: "bigtrato-3a134.firebasestorage.app"
  messagingSenderId: "604650099192",
  appId: "1:604650099192:web:86931f6066bf221080c60d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const tbody = document.getElementById("tbody");
const search = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");

// ===== LOGIN ANÔNIMO =====
signInAnonymously(auth)
  .catch((error) => {
    console.error("❌ Erro no login anônimo:", error.code, error.message);
  });

// só roda depois que login for feito
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ Login anônimo feito:", user.uid);
    carregar();
  } else {
    console.error("⚠️ Nenhum usuário autenticado");
  }
});

// ====== CARREGAR ORÇAMENTOS ======
async function carregar() {
  tbody.innerHTML = "";
  try {
    const snap = await getDocs(collection(db, "quotes"));
    let rows = [];
    snap.forEach(docSnap => rows.push({ ...docSnap.data(), _id: docSnap.id }));

    console.log("📥 Orçamentos carregados:", rows);

    const termo = search.value.toLowerCase();
    const filtro = statusFilter.value;
    rows = rows.filter(r =>
      (!termo || (r.cliente || "").toLowerCase().includes(termo)) &&
      (!filtro || r.status === filtro)
    );

    rows.forEach(q => {
      const tr = document.createElement("tr");
      let dataFormatada = "-";
      if (q.createdAt) {
        try {
          const d = new Date(q.createdAt);
          if (!isNaN(d.getTime())) dataFormatada = d.toLocaleString("pt-BR");
        } catch { dataFormatada = q.createdAt; }
      }

      let total = 0;
      if (q.itens && Array.isArray(q.itens)) {
        total = q.itens.reduce((soma, item) => {
          const preco = Number(item.preco || 0);
          const qtd = Number(item.qtd || 1);
          return soma + preco * qtd;
        }, 0);
      }

      tr.innerHTML = `
        <td>${q.id ?? ""}</td>
        <td>${q.cliente || "-"}</td>
        <td>${dataFormatada}</td>
        <td>R$ ${total.toFixed(2)}</td>
        <td>
          <select class="status">
            <option ${q.status === "Pendente" ? "selected" : ""}>Pendente</option>
            <option ${q.status === "Aprovado" ? "selected" : ""}>Aprovado</option>
            <option ${q.status === "Negado" ? "selected" : ""}>Negado</option>
            <option ${q.status === "Serviço Concluído" ? "selected" : ""}>Serviço Concluído</option>
          </select>
        </td>
        <td class="actions">
          <button class="editar">Editar no gerador</button>
          <button class="delete">x</button>
        </td>
      `;

      tr.querySelector(".status").addEventListener("change", async (e) => {
        await updateDoc(doc(db, "quotes", q._id), { status: e.target.value });
      });

      tr.querySelector(".editar").addEventListener("click", () => {
        localStorage.setItem("bt_load_quote", JSON.stringify(q));
        window.location.href = "Gerador de orçamentos.html";
      });

      tr.querySelector(".delete").addEventListener("click", async () => {
        if (confirm("Excluir este orçamento?")) {
          await deleteDoc(doc(db, "quotes", q._id));
          carregar();
        }
      });

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("❌ Erro ao carregar orçamentos:", err.message);
  }
}

search.addEventListener("input", carregar);
statusFilter.addEventListener("change", carregar);
