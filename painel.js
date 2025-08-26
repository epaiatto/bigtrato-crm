/* ===== STORAGE ===== */
const LS_QUOTES='bt_quotes';
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
  if(rows.length===0){
    const tr=document.createElement('tr');
    const td=document.createElement('td');
    td.colSpan=6;
    td.className='muted';
    td.style.padding='20px';
    td.textContent='Nenhum orçamento encontrado.';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

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
          <option ${q.status==='Serviço Concluído'?'selected':''}>Serviço Concluído</option>
        </select>
      </td>
      <td class="actions">
        <button class="primary editar">Editar no gerador</button>
        <button class="delete">×</button>
      </td>
    `;

    /* === Delete === */
    tr.querySelector('.delete').onclick=()=>{
      if(confirm(`Excluir orçamento #${q.id} de "${q.cliente}"?`)){
        const all=getQuotes();
        const i=all.findIndex(x=>String(x.id)===String(q.id));
        if(i>=0){ all.splice(i,1); setQuotes(all); }
        render();
      }
    };

    /* === Status === */
    const sel=tr.querySelector('.status');
    sel.addEventListener('change',()=>{
      q.status=sel.value;
      const all=getQuotes();
      const i=all.findIndex(x=>String(x.id)===String(q.id));
      if(i>=0){ all[i]=q; setQuotes(all); }
      render();
    });

    /* === Editar === */
    tr.querySelector('.editar').onclick=()=>editarNoGerador(q);

    tbody.appendChild(tr);
  });
}

qInput.addEventListener('input',render);
fStatus.addEventListener('change',render);

/* ===== Navegação para o gerador ===== */
function winPathToFileURL(p){ 
  const m=/^[A-Za-z]:[\\/]/.exec(p); 
  if(!m) return null; 
  let d=p[0].toUpperCase(); 
  let r=p.slice(2).replace(/\\/g,'/'); 
  if(!r.startsWith('/')) r='/'+r; 
  r=r.split('/').map(s=>encodeURIComponent(s)).join('/'); 
  return `file:///${d}:${r}`;
}
function resolveGeradorURL(){
  const PREFS_GER='bt_gerador_path';
  const raw=(localStorage.getItem(PREFS_GER)||'Gerador de orçamentos.html').trim();
  if(/^https?:\/\//i.test(raw) || /^file:\/\//i.test(raw)) return raw;
  const maybe=winPathToFileURL(raw); if(maybe) return maybe;
  try{ return new URL(raw, location.href).toString(); }catch{ return raw; }
}
function editarNoGerador(q){ try{ localStorage.setItem('bt_load_quote', JSON.stringify(q)); }catch{} location.href = resolveGeradorURL(); }
document.getElementById('btnNovo').onclick=()=>{ try{ localStorage.removeItem('bt_load_quote'); }catch{} location.href = resolveGeradorURL(); };

/* ===== START ===== */
render();
