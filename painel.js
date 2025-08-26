/* ===== STORAGE ===== */
const LS_QUOTES = 'bt_quotes';
function getQuotes(){ try{return JSON.parse(localStorage.getItem(LS_QUOTES)||'[]')}catch{return []} }
function setQuotes(arr){ localStorage.setItem(LS_QUOTES, JSON.stringify(arr)); }

/* ===== ELEMENTOS ===== */
const tbody=document.querySelector('#tbl tbody');
const qInput=document.getElementById('q');
const fStatus=document.getElementById('fStatus');

/* ===== RENDER ===== */
function render(){
  const list=getQuotes().slice().reverse();
  const term=(qInput.value||'').toLowerCase().trim();
  const st=(fStatus.value||'').trim();

  const rows=list.filter(q=>{
    const okTerm = !term || (q.cliente||'').toLowerCase().includes(term);
    const okStatus = !st || (q.status===st);
    return okTerm && okStatus;
  });

  tbody.innerHTML='';
  rows.forEach(q=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td>${q.id ?? ''}</td>
      <td>${q.cliente||'-'}</td>
      <td>${q.createdAt? new Date(q.createdAt).toLocaleString('pt-BR') : '-'}</td>
      <td>${q.total||'-'}</td>
      <td>
        <select class="status">
          <option ${q.status==='Pendente'?'selected':''}>Pendente</option>
          <option ${q.status==='Aprovado'?'selected':''}>Aprovado</option>
          <option ${q.status==='Negado'?'selected':''}>Negado</option>
        </select>
      </td>
      <td class="actions">
        <button class="primary editar">Editar</button>
        <button class="delete">❌</button>
      </td>
    `;

    // --- status ---
    const sel=tr.querySelector('.status');
    sel.addEventListener('change',()=>{
      q.status=sel.value;
      const all=getQuotes();
      const i=all.findIndex(x=>String(x.id)===String(q.id));
      if(i>=0){ all[i]=q; setQuotes(all); }
      render();
    });

    // --- editar ---
    tr.querySelector('.editar').onclick=()=>editarNoGerador(q);

    // --- deletar ---
    tr.querySelector('.delete').onclick=()=>{
      if(confirm("Deseja excluir este orçamento?")){
        const all=getQuotes().filter(x=>String(x.id)!==String(q.id));
        setQuotes(all);
        render();
      }
    };

    tbody.appendChild(tr);
  });
}

qInput.addEventListener('input',render);
fStatus.addEventListener('change',render);

/* ===== Navegação para o gerador ===== */
function editarNoGerador(q){
  try{ localStorage.setItem('bt_load_quote', JSON.stringify(q)); }catch{}
  location.href = "Gerador de orçamentos.html";
}
document.getElementById('btnNovo').onclick=()=>{
  try{ localStorage.removeItem('bt_load_quote'); }catch{}
  location.href = "Gerador de orçamentos.html";
};

/* ===== START ===== */
render();
