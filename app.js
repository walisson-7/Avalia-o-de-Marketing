// ==============================
// DATABASE (localStorage)
// ==============================
const DB = {
  get: (k) => { try { return JSON.parse(localStorage.getItem('mkt_'+k) || 'null'); } catch(e) { return null; } },
  set: (k, v) => localStorage.setItem('mkt_'+k, JSON.stringify(v)),
  init() {
    if (!DB.get('users')) {
      DB.set('users', [
        { id: 1, name: 'Analista Marketing', username: 'analista', password: 'marketing2024', role: 'analista' }
      ]);
    }
    if (!DB.get('atividades')) DB.set('atividades', []);
    if (!DB.get('links')) DB.set('links', []);
    if (!DB.get('avaliacoes')) DB.set('avaliacoes', []);
  }
};

DB.init();

// ==============================
// AUTH
// ==============================
let currentUser = null;

function doLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const users = DB.get('users') || [];
  const found = users.find(u => u.username === user && u.password === pass);
  document.getElementById('login-error').textContent = '';
  if (!found) {
    document.getElementById('login-error').textContent = 'Usuário ou senha incorretos.';
    return;
  }
  currentUser = found;
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  buildSidebar();
  if (found.role === 'analista') navigateTo('dashboard');
  else navigateTo('aval-dashboard');
}

function doLogout() {
  currentUser = null;
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

// ==============================
// SIDEBAR
// ==============================
const MENUS = {
  analista: [
    { section: 'Principal', items: [
      { id: 'dashboard', label: 'Visão Geral', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    ]},
    { section: 'Gestão', items: [
      { id: 'atividade', label: 'Atividade da Semana', icon: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
      { id: 'links-analista', label: 'Compartilhar Links', icon: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z' },
      { id: 'avaliadores', label: 'Avaliadores', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
      { id: 'ranking-analista', label: 'Ranking', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
    ]},
  ],
  avaliador: [
    { section: 'Início', items: [
      { id: 'aval-dashboard', label: 'Início', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    ]},
    { section: 'Avaliação', items: [
      { id: 'aval-tarefas', label: 'Tarefas da Semana', icon: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
      { id: 'aval-links', label: 'Links & Avaliação', icon: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z' },
      { id: 'ranking-aval', label: 'Ranking', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
    ]},
  ]
};

function buildSidebar() {
  const role = currentUser.role;
  document.getElementById('sidebar-role').textContent = role === 'analista' ? 'Analista de Marketing' : 'Avaliador';
  document.getElementById('sidebar-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('sidebar-username').textContent = currentUser.name;
  document.getElementById('sidebar-userrole').textContent = role === 'analista' ? 'Analista' : 'Avaliador';
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = '';
  const menus = role === 'analista' ? MENUS.analista : MENUS.avaliador;
  menus.forEach(sec => {
    const secEl = document.createElement('div');
    secEl.className = 'nav-section';
    secEl.innerHTML = `<div class="nav-section-label">${sec.section}</div>`;
    sec.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'nav-item';
      el.dataset.page = item.id;
      el.innerHTML = `<svg viewBox="0 0 24 24"><path d="${item.icon}"/></svg>${item.label}`;
      el.onclick = () => navigateTo(item.id);
      secEl.appendChild(el);
    });
    nav.appendChild(secEl);
  });
}

function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add('active');
  // Render page
  if (pageId === 'dashboard') renderDashboard();
  else if (pageId === 'atividade') renderAtividades();
  else if (pageId === 'links-analista') renderLinksAnalista();
  else if (pageId === 'avaliadores') renderAvaliadores();
  else if (pageId === 'ranking-analista') renderRanking('ranking-list-analista');
  else if (pageId === 'aval-dashboard') renderAvalDashboard();
  else if (pageId === 'aval-tarefas') renderAvalTarefas();
  else if (pageId === 'aval-links') renderAvalLinks();
  else if (pageId === 'ranking-aval') renderRanking('ranking-list-aval');
}

// ==============================
// UTILS
// ==============================
function toast(msg, type = 'info') {
  const t = document.getElementById('toast');
  const icons = {
    success: '✓', error: '✕', info: '→'
  };
  t.innerHTML = `<span>${icons[type]||'→'}</span> ${msg}`;
  t.className = `show ${type}`;
  setTimeout(() => t.className = '', 3000);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function uid() { return Date.now() + '-' + Math.random().toString(36).substr(2,6); }

function getAvaliadores() {
  return (DB.get('users') || []).filter(u => u.role === 'avaliador');
}

function getAvaliacoes() { return DB.get('avaliacoes') || []; }

function getUserScore(userId) {
  const avals = getAvaliacoes().filter(a => a.userId === userId);
  return avals.reduce((sum, a) => sum + (a.total || 0), 0);
}

function getUserAvalCount(userId) {
  return getAvaliacoes().filter(a => a.userId === userId).length;
}

function hasUserEvaluatedLink(userId, linkId) {
  return getAvaliacoes().some(a => a.userId === userId && a.linkId === linkId);
}

// ==============================
// ANALISTA — DASHBOARD
// ==============================
function renderDashboard() {
  const avaliadores = getAvaliadores();
  const links = DB.get('links') || [];
  const atividades = DB.get('atividades') || [];
  const avals = getAvaliacoes();
  
  // Who responded this week (at least one evaluation)
  const respondidos = avaliadores.filter(av => avals.some(a => a.userId === av.id));
  const pendentes = avaliadores.filter(av => !avals.some(a => a.userId === av.id));

  document.getElementById('dashboard-stats').innerHTML = `
    <div class="stat-card highlight">
      <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>
      <div class="stat-value">${avaliadores.length}</div>
      <div class="stat-label">Avaliadores cadastrados</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
      <div class="stat-value">${respondidos.length}</div>
      <div class="stat-label">Responderam esta semana</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg></div>
      <div class="stat-value">${pendentes.length}</div>
      <div class="stat-label">Pendentes</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg></div>
      <div class="stat-value">${links.length}</div>
      <div class="stat-label">Links compartilhados</div>
    </div>
  `;

  // Responded list
  const rEl = document.getElementById('responded-list');
  if (!respondidos.length) {
    rEl.innerHTML = '<div class="empty-state" style="padding:24px"><p>Nenhum avaliador respondeu ainda</p></div>';
  } else {
    rEl.innerHTML = respondidos.map(av => `
      <div class="evaluator-row">
        <div class="evaluator-info">
          <div class="evaluator-avatar">${av.name.charAt(0)}</div>
          <div>
            <div style="font-size:14px;font-weight:600">${av.name}</div>
            <div style="font-size:12px;color:var(--text-muted)">${getUserAvalCount(av.id)} avaliação(ões)</div>
          </div>
        </div>
        <span class="badge badge-green">Respondeu</span>
      </div>`).join('');
  }

  // Pending list
  const pEl = document.getElementById('pending-list');
  if (!pendentes.length) {
    pEl.innerHTML = '<div class="empty-state" style="padding:24px"><p>Todos responderam! 🎉</p></div>';
  } else {
    pEl.innerHTML = pendentes.map(av => `
      <div class="evaluator-row">
        <div class="evaluator-info">
          <div class="evaluator-avatar" style="background:#ddd;color:#777">${av.name.charAt(0)}</div>
          <div>
            <div style="font-size:14px;font-weight:600">${av.name}</div>
            <div style="font-size:12px;color:var(--text-muted)">Sem avaliações</div>
          </div>
        </div>
        <span class="badge badge-gray">Pendente</span>
      </div>`).join('');
  }
}

// ==============================
// ANALISTA — ATIVIDADES
// ==============================
function saveAtividade() {
  const semana = document.getElementById('ativ-semana').value.trim();
  const titulo = document.getElementById('ativ-titulo').value.trim();
  const desc = document.getElementById('ativ-desc').value.trim();
  if (!semana || !titulo) { toast('Preencha semana e título', 'error'); return; }
  const atividades = DB.get('atividades') || [];
  atividades.unshift({ id: uid(), semana, titulo, desc, createdAt: new Date().toLocaleDateString('pt-BR') });
  DB.set('atividades', atividades);
  document.getElementById('ativ-semana').value = '';
  document.getElementById('ativ-titulo').value = '';
  document.getElementById('ativ-desc').value = '';
  toast('Atividade publicada com sucesso!', 'success');
  renderAtividades();
}

function renderAtividades() {
  const atividades = DB.get('atividades') || [];
  const el = document.getElementById('atividades-list');
  if (!atividades.length) {
    el.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg><h3>Nenhuma atividade publicada</h3><p>Crie a primeira atividade acima</p></div>';
    return;
  }
  el.innerHTML = atividades.map(a => `
    <div class="task-card">
      <div class="task-icon"><svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg></div>
      <div class="task-body" style="flex:1">
        <div class="task-week">${a.semana}</div>
        <div class="task-title">${a.titulo}</div>
        ${a.desc ? `<div class="task-desc">${a.desc}</div>` : ''}
        <div style="margin-top:8px;font-size:11px;color:#bbb">Publicado em ${a.createdAt}</div>
      </div>
      <button class="btn btn-ghost" style="flex-shrink:0;padding:7px 12px;font-size:12px" onclick="deleteAtividade('${a.id}')">Remover</button>
    </div>`).join('');
}

function deleteAtividade(id) {
  let atividades = DB.get('atividades') || [];
  atividades = atividades.filter(a => a.id !== id);
  DB.set('atividades', atividades);
  renderAtividades();
  toast('Atividade removida', 'info');
}

// ==============================
// ANALISTA — LINKS
// ==============================
function saveLink() {
  const semana = document.getElementById('link-semana').value.trim();
  const titulo = document.getElementById('link-titulo').value.trim();
  const url = document.getElementById('link-url').value.trim();
  if (!semana || !titulo || !url) { toast('Preencha todos os campos', 'error'); return; }
  const links = DB.get('links') || [];
  links.unshift({ id: uid(), semana, titulo, url, createdAt: new Date().toLocaleDateString('pt-BR') });
  DB.set('links', links);
  document.getElementById('link-semana').value = '';
  document.getElementById('link-titulo').value = '';
  document.getElementById('link-url').value = '';
  toast('Link compartilhado com sucesso!', 'success');
  renderLinksAnalista();
}

function renderLinksAnalista() {
  const links = DB.get('links') || [];
  const el = document.getElementById('links-analista-list');
  if (!links.length) {
    el.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg><h3>Nenhum link compartilhado</h3><p>Adicione o primeiro link acima</p></div>';
    return;
  }
  el.innerHTML = links.map(l => {
    const avals = getAvaliacoes().filter(a => a.linkId === l.id);
    return `
    <div class="link-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
        <div>
          <div class="link-week">${l.semana}</div>
          <div class="link-title">${l.titulo}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="badge badge-orange">${avals.length} avaliação(ões)</span>
          <button class="btn btn-ghost" style="padding:5px 10px;font-size:12px" onclick="deleteLink('${l.id}')">Remover</button>
        </div>
      </div>
      <div class="link-url">
        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:var(--brand);flex-shrink:0"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
        <a href="${l.url}" target="_blank">${l.url}</a>
      </div>
      <div style="font-size:11px;color:#bbb;margin-top:4px">Adicionado em ${l.createdAt}</div>
    </div>`;
  }).join('');
}

function deleteLink(id) {
  let links = DB.get('links') || [];
  links = links.filter(l => l.id !== id);
  DB.set('links', links);
  // also remove evaluations for this link
  let avals = getAvaliacoes().filter(a => a.linkId !== id);
  DB.set('avaliacoes', avals);
  renderLinksAnalista();
  toast('Link removido', 'info');
}

// ==============================
// ANALISTA — AVALIADORES
// ==============================
function saveAvaliador() {
  const nome = document.getElementById('aval-nome').value.trim();
  const username = document.getElementById('aval-user').value.trim().replace(/\s+/g, '');
  const password = document.getElementById('aval-pass').value.trim();
  if (!nome || !username || !password) { toast('Preencha todos os campos', 'error'); return; }
  const users = DB.get('users') || [];
  if (users.find(u => u.username === username)) { toast('Usuário já existe', 'error'); return; }
  users.push({ id: uid(), name: nome, username, password, role: 'avaliador' });
  DB.set('users', users);
  document.getElementById('aval-nome').value = '';
  document.getElementById('aval-user').value = '';
  document.getElementById('aval-pass').value = '';
  toast('Avaliador cadastrado!', 'success');
  renderAvaliadores();
}

function renderAvaliadores() {
  const avaliadores = getAvaliadores();
  const statsEl = document.getElementById('aval-stats');
  statsEl.innerHTML = `
    <div class="stat-card highlight">
      <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>
      <div class="stat-value">${avaliadores.length}</div>
      <div class="stat-label">Total de avaliadores</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
      <div class="stat-value">${avaliadores.filter(av => getUserAvalCount(av.id) > 0).length}</div>
      <div class="stat-label">Participaram</div>
    </div>
  `;

  const tbody = document.getElementById('avaliadores-table-body');
  if (!avaliadores.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px">Nenhum avaliador cadastrado</td></tr>';
    return;
  }
  tbody.innerHTML = avaliadores.map((av, i) => `
    <tr>
      <td><strong>${i+1}</strong></td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="evaluator-avatar" style="width:32px;height:32px;font-size:12px">${av.name.charAt(0)}</div>
          ${av.name}
        </div>
      </td>
      <td><code style="background:var(--surface2);padding:3px 8px;border-radius:4px;font-size:12px">${av.username}</code></td>
      <td><span class="badge ${getUserAvalCount(av.id) > 0 ? 'badge-green' : 'badge-gray'}">${getUserAvalCount(av.id)}</span></td>
      <td>
        <button class="btn btn-ghost" style="padding:5px 12px;font-size:12px" onclick="deleteAvaliador('${av.id}')">Remover</button>
      </td>
    </tr>`).join('');
}

function deleteAvaliador(id) {
  let users = DB.get('users') || [];
  users = users.filter(u => u.id !== id);
  DB.set('users', users);
  let avals = getAvaliacoes().filter(a => a.userId !== id);
  DB.set('avaliacoes', avals);
  renderAvaliadores();
  toast('Avaliador removido', 'info');
}

// ==============================
// RANKING
// ==============================
function renderRanking(containerId) {
  const links = DB.get('links') || [];
  const avals = getAvaliacoes();

  const el = document.getElementById(containerId);
  if (!links.length) {
    el.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg><h3>Ranking vazio</h3><p>Nenhum link foi compartilhado ainda</p></div>';
    return;
  }

  // Build per-link aggregated scores
  const ranked = links.map(l => {
    const linkAvals = avals.filter(a => a.linkId === l.id);
    const totalPts = linkAvals.reduce((s, a) => s + (a.total || 0), 0);
    const avgPrec = linkAvals.length ? (linkAvals.reduce((s,a)=>s+a.precificacao,0)/linkAvals.length).toFixed(1) : '—';
    const avgOrg  = linkAvals.length ? (linkAvals.reduce((s,a)=>s+a.organizacao,0)/linkAvals.length).toFixed(1) : '—';
    const avgExec = linkAvals.length ? (linkAvals.reduce((s,a)=>s+a.execucao,0)/linkAvals.length).toFixed(1) : '—';
    const avgCriat= linkAvals.length ? (linkAvals.reduce((s,a)=>s+a.criatividade,0)/linkAvals.length).toFixed(1) : '—';
    return { ...l, totalPts, count: linkAvals.length, avgPrec, avgOrg, avgExec, avgCriat };
  }).sort((a, b) => b.totalPts - a.totalPts);

  const maxPts = ranked[0].totalPts || 1;

  el.innerHTML = ranked.map((l, i) => {
    const posClass = i===0 ? 'pos-1' : i===1 ? 'pos-2' : i===2 ? 'pos-3' : 'pos-other';
    return `
    <div class="ranking-item" style="flex-direction:column;align-items:stretch;gap:0;padding:18px 20px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
        <div class="ranking-pos ${posClass}">${i+1}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:0.5px">${l.semana}</div>
          <div style="font-size:15px;font-weight:700;color:var(--text);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${l.titulo}</div>
          <a href="${l.url}" target="_blank" style="font-size:12px;color:var(--text-muted);word-break:break-all;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${l.url}</a>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div class="ranking-score">${l.totalPts} <span>pts totais</span></div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${l.count} avaliação(ões)</div>
        </div>
      </div>
      <div class="progress-bar" style="margin-bottom:12px">
        <div class="progress-fill" style="width:${maxPts > 0 ? (l.totalPts/maxPts*100) : 0}%"></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        ${[['Precificação', l.avgPrec],['Organização', l.avgOrg],['Execução', l.avgExec],['Criatividade', l.avgCriat]].map(([label, avg]) => `
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 10px;text-align:center">
          <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px">${label}</div>
          <div style="font-size:18px;font-weight:800;color:var(--brand)">${avg}</div>
          <div style="font-size:10px;color:#bbb">média</div>
        </div>`).join('')}
      </div>
    </div>`;
  }).join('');
}

function confirmZerarRanking() { openModal('modal-zerar'); }
function zerarRanking() {
  DB.set('links', []);
  DB.set('avaliacoes', []);
  closeModal('modal-zerar');
  toast('Ranking zerado e links apagados com sucesso!', 'success');
  renderRanking('ranking-list-analista');
  renderDashboard();
}

// ==============================
// AVALIADOR — DASHBOARD
// ==============================
function renderAvalDashboard() {
  document.getElementById('aval-welcome').textContent = `Olá, ${currentUser.name}! 👋`;
  const links = DB.get('links') || [];
  const pendentes = links.filter(l => !hasUserEvaluatedLink(currentUser.id, l.id));
  const avals = getAvaliacoes().filter(a => a.userId === currentUser.id);
  const myScore = getUserScore(currentUser.id);

  document.getElementById('aval-dashboard-stats').innerHTML = `
    <div class="stat-card highlight">
      <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg></div>
      <div class="stat-value">${myScore}</div>
      <div class="stat-label">Minha pontuação</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
      <div class="stat-value">${avals.length}</div>
      <div class="stat-label">Avaliações feitas</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.01 14H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V6h8v2z"/></svg></div>
      <div class="stat-value">${pendentes.length}</div>
      <div class="stat-label">Links para avaliar</div>
    </div>
  `;

  const atividades = (DB.get('atividades') || []).slice(0, 2);
  const el = document.getElementById('aval-tasks-preview');
  if (!atividades.length) {
    el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px">Nenhuma atividade publicada ainda</div>';
    return;
  }
  el.innerHTML = atividades.map(a => `
    <div class="task-card">
      <div class="task-icon"><svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg></div>
      <div class="task-body">
        <div class="task-week">${a.semana}</div>
        <div class="task-title">${a.titulo}</div>
        ${a.desc ? `<div class="task-desc">${a.desc}</div>` : ''}
      </div>
    </div>`).join('');
}

// ==============================
// AVALIADOR — TAREFAS
// ==============================
function renderAvalTarefas() {
  const atividades = DB.get('atividades') || [];
  const el = document.getElementById('aval-tarefas-list');
  if (!atividades.length) {
    el.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg><h3>Nenhuma atividade ainda</h3><p>A analista ainda não publicou atividades</p></div>';
    return;
  }
  el.innerHTML = atividades.map(a => `
    <div class="task-card" style="background:#fff;border:1.5px solid var(--border);border-radius:var(--radius);padding:20px 22px">
      <div class="task-icon"><svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg></div>
      <div class="task-body" style="flex:1">
        <div class="task-week">${a.semana}</div>
        <div class="task-title">${a.titulo}</div>
        ${a.desc ? `<div class="task-desc">${a.desc}</div>` : ''}
        <div style="margin-top:8px;font-size:11px;color:#bbb">Publicado em ${a.createdAt}</div>
      </div>
    </div>`).join('');
}

// ==============================
// AVALIADOR — LINKS & AVALIAÇÃO
// ==============================
function renderAvalLinks() {
  const links = DB.get('links') || [];
  const el = document.getElementById('aval-links-list');
  if (!links.length) {
    el.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg><h3>Nenhum link disponível</h3><p>Aguarde a analista compartilhar links</p></div>';
    return;
  }

  el.innerHTML = links.map(l => {
    const alreadyEval = hasUserEvaluatedLink(currentUser.id, l.id);
    const myEval = getAvaliacoes().find(a => a.userId === currentUser.id && a.linkId === l.id);

    let evalSection = '';
    if (alreadyEval && myEval) {
      evalSection = `
        <div class="avaliacao-already">
          <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          Você já avaliou este link! Pontuação: <strong>${myEval.total} pts</strong>
          (Precificação: ${myEval.precificacao}, Organização: ${myEval.organizacao}, Execução: ${myEval.execucao}, Criatividade: ${myEval.criatividade})
        </div>`;
    } else {
      evalSection = `
        <div class="criteria-grid" id="criteria-${l.id}">
          ${['precificacao','organizacao','execucao','criatividade'].map(crit => `
          <div class="criteria-item">
            <div class="criteria-label">${critLabel(crit)}</div>
            <div class="stars" id="stars-${l.id}-${crit}">
              ${[1,2,3,4,5].map(n => `<div class="star" onclick="setStar('${l.id}','${crit}',${n})" data-val="${n}">${n}</div>`).join('')}
            </div>
            <div class="criteria-score">0 a 5 pontos (+${5} máx)</div>
          </div>`).join('')}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px">
          <div style="font-size:13px;color:var(--text-muted)">Total máximo: <strong>20 pontos</strong></div>
          <button class="btn btn-brand" onclick="submitAvaliacao('${l.id}')">
            <svg viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            Enviar Avaliação
          </button>
        </div>`;
    }

    return `
    <div class="link-card" style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
        <div>
          <div class="link-week">${l.semana}</div>
          <div class="link-title">${l.titulo}</div>
        </div>
        ${alreadyEval ? '<span class="badge badge-green">Avaliado</span>' : '<span class="badge badge-orange">Pendente</span>'}
      </div>
      <div class="link-url">
        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:var(--brand);flex-shrink:0"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
        <a href="${l.url}" target="_blank">${l.url}</a>
      </div>
      <div class="divider"></div>
      <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px">
        ${alreadyEval ? 'Sua avaliação' : 'Avalie os critérios abaixo:'}
      </div>
      ${evalSection}
    </div>`;
  }).join('');

  // Init star scores tracker
  window._stars = window._stars || {};
}

function critLabel(c) {
  const m = { precificacao: 'Precificação', organizacao: 'Organização', execucao: 'Execução', criatividade: 'Criatividade' };
  return m[c] || c;
}

window._stars = {};

function setStar(linkId, crit, val) {
  if (!window._stars[linkId]) window._stars[linkId] = {};
  window._stars[linkId][crit] = val;
  // Update UI
  const container = document.getElementById(`stars-${linkId}-${crit}`);
  if (!container) return;
  container.querySelectorAll('.star').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.val) <= val);
  });
}

function submitAvaliacao(linkId) {
  const s = window._stars[linkId] || {};
  const prec = s.precificacao || 0;
  const org = s.organizacao || 0;
  const exec = s.execucao || 0;
  const criat = s.criatividade || 0;
  if (!prec && !org && !exec && !criat) { toast('Avalie pelo menos um critério', 'error'); return; }
  
  const avals = getAvaliacoes();
  avals.push({
    id: uid(),
    userId: currentUser.id,
    linkId,
    precificacao: prec,
    organizacao: org,
    execucao: exec,
    criatividade: criat,
    total: prec + org + exec + criat,
    createdAt: new Date().toLocaleDateString('pt-BR')
  });
  DB.set('avaliacoes', avals);
  delete window._stars[linkId];
  toast(`Avaliação enviada! +${prec+org+exec+criat} pontos`, 'success');
  renderAvalLinks();
}

// ==============================
// INIT
// ==============================
document.getElementById('login-user').focus();
