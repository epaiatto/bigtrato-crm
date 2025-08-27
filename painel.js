// painel.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, collection, getDocs, doc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===== CONFIG FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyDhPL394SjXkgbrD6_dJSHN3vJ2Zou9erE",
  authDomain: "bigtrato-3a134.firebaseapp.com",
  projectId: "bigtrato-3a134",
  storageBucket: "bigtrato-3a134.appspot.com", // ✅ corrigido
  messagingSenderId: "604650099192",
  appId: "1:604650099192:web:86931f6066bf221080c60d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tbody = document.getElementById("tbody");
const search = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");

// ====== CARREGAR ORÇAMENTOS ======
async function carregar() {
  tbody.innerHTML = "";
  const snap = await getDocs(collection(db, "quotes"));
  let rows = [];
  snap.forEach(docSnap => rows.push({ ...docSnap.data(), _id: docSnap.id }));

  console.log("Orçamentos carregados:", rows); // 👀 debug no console

  // filtros
  const termo = search.value.toLowerCase();
  const filtro = statusFilter.value;
  rows = rows.filter(r =>
    (!termo || (r.cliente || "").toLowerCase().includes(termo)) &&
    (!filtro || r.status === filtro)
  );

  rows.forEach(q => {
    const tr = document.createElement("tr");

    // === Data ===
    let dataFormatada = "-";
    if (q.createdAt) {
      try {
        const d = new Date(q.createdAt);
        if (!isNaN(d.getTime())) dataFormatada = d.toLocaleString("pt-BR");
      } catch { dataFormatada = q.createdAt; }
    }

    // === Total ===
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

    // alterar status
    tr.querySelector(".status").addEventListener("change", async (e) => {
      await updateDoc(doc(db, "quotes", q._id), { status: e.target.value });
    });

    // editar
    tr.querySelector(".editar").addEventListener("click", () => {
      localStorage.setItem("bt_load_quote", JSON.stringify(q));
      window.location.href = "Gerador de orçamentos.html";
    });

    // deletar
    tr.querySelector(".delete").addEventListener("click", async () => {
      if (confirm("Excluir este orçamento?")) {
        await deleteDoc(doc(db, "quotes", q._id));
        carregar();
      }
    });

    tbody.appendChild(tr);
  });
}

search.addEventListener("input", carregar);
statusFilter.addEventListener("change", carregar);
carregar();
