// ==============================
// CONFIGURAÇÃO DA API
// ==============================
const API_BASE = 'http://localhost:8000';

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let detail = 'Erro na requisição';
    try { const err = await res.json(); detail = err.detail || detail; } catch (e) {}
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ==============================
// AUTH
// ==============================
let currentUser = null;

async function doLogin() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value.trim();
  const erroEl   = document.getElementById('login-error');
  erroEl.textContent = '';
  if (!username || !password) { erroEl.textContent = 'Preencha usuário e senha.'; return; }
  try {
    const usuario = await apiFetch('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    currentUser = usuario;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    buildSidebar();
    if (usuario.role === 'analista') navigateTo('dashboard');
    else navigateTo('aval-dashboard');
  } catch (e) {
    erroEl.textContent = e.message || 'Usuário ou senha incorretos.';
  }
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
// "Compartilhar Links" removido do menu da analista —
// os links agora vivem dentro de cada atividade
// ==============================
const MENUS = {
  analista: [
    { section: 'Principal', items: [
      { id: 'dashboard',        label: 'Visão Geral',        icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    ]},
    { section: 'Gestão', items: [
      { id: 'atividade',        label: 'Atividade da Semana', icon: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
      { id: 'avaliadores',      label: 'Avaliadores',         icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
      { id: 'ranking-analista', label: 'Ranking',              icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
    ]},
  ],
  avaliador: [
    { section: 'Início', items: [
      { id: 'aval-dashboard', label: 'Início',            icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    ]},
    { section: 'Avaliação', items: [
      { id: 'aval-tarefas',   label: 'Tarefas da Semana', icon: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
      { id: 'aval-links',     label: 'Links & Avaliação',  icon: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z' },
      { id: 'ranking-aval',   label: 'Ranking',             icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
    ]},
  ]
};

function buildSidebar() {
  const role = currentUser.role;
  document.getElementById('sidebar-role').textContent     = role === 'analista' ? 'Analista de Marketing' : 'Avaliador';
  document.getElementById('sidebar-avatar').textContent   = currentUser.nome.charAt(0).toUpperCase();
  document.getElementById('sidebar-username').textContent = currentUser.nome;
  document.getElementById('sidebar-userrole').textContent = role === 'analista' ? 'Analista' : 'Avaliador';
  const nav   = document.getElementById('sidebar-nav');
  nav.innerHTML = '';
  const menus = role === 'analista' ? MENUS.analista : MENUS.avaliador;
  menus.forEach(sec => {
    const secEl = document.createElement('div');
    secEl.className = 'nav-section';
    secEl.innerHTML = `<div class="nav-section-label">${sec.section}</div>`;
    sec.items.forEach(item => {
      const el = document.createElement('div');
      el.className    = 'nav-item';
      el.dataset.page = item.id;
      el.innerHTML    = `<svg viewBox="0 0 24 24"><path d="${item.icon}"/></svg>${item.label}`;
      el.onclick      = () => navigateTo(item.id);
      secEl.appendChild(el);
    });
    nav.appendChild(secEl);
  });
}

function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page    = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add('active');

  if      (pageId === 'dashboard')         renderDashboard();
  else if (pageId === 'atividade')         renderAtividades();
  else if (pageId === 'avaliadores')       renderAvaliadores();
  else if (pageId === 'ranking-analista')  renderRanking('ranking-list-analista');
  else if (pageId === 'aval-dashboard')    renderAvalDashboard();
  else if (pageId === 'aval-tarefas')      renderAvalTarefas();
  else if (pageId === 'aval-links')        renderAvalLinks();
  else if (pageId === 'ranking-aval')      renderRanking('ranking-list-aval');
}

// ==============================
// UTILS
// ==============================
function toast(msg, type = 'info') {
  const t = document.getElementById('toast');
  const icons = { success: '✓', error: '✕', info: '→' };
  t.innerHTML  = `<span>${icons[type] || '→'}</span> ${msg}`;
  t.className  = `show ${type}`;
  setTimeout(() => t.className = '', 3000);
}
function openModal(id)  { document.getElementById(id).classList.add('open');    }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ==============================
// ANALISTA — DASHBOARD
// Cards clicáveis navegam para a aba correta
// ==============================
async function renderDashboard() {
  try {
    const [avaliadores, links] = await Promise.all([
      apiFetch('/api/avaliadores'),
      apiFetch('/api/links'),
    ]);
    const respondidos = avaliadores.filter(av => av.total_avaliacoes > 0);
    const pendentes   = avaliadores.filter(av => av.total_avaliacoes === 0);

    document.getElementById('dashboard-stats').innerHTML = `
      <div class="stat-card highlight" style="cursor:pointer" title="Ver avaliadores" onclick="navigateTo('avaliadores')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>
        <div class="stat-value">${avaliadores.length}</div>
        <div class="stat-label">Avaliadores cadastrados</div>
      </div>
      <div class="stat-card" style="cursor:pointer" title="Ver respondidos" onclick="navigateTo('avaliadores')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
        <div class="stat-value">${respondidos.length}</div>
        <div class="stat-label">Responderam esta semana</div>
      </div>
      <div class="stat-card" style="cursor:pointer" title="Ver pendentes" onclick="navigateTo('avaliadores')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg></div>
        <div class="stat-value">${pendentes.length}</div>
        <div class="stat-label">Pendentes</div>
      </div>
      <div class="stat-card" style="cursor:pointer" title="Ver atividades" onclick="navigateTo('atividade')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg></div>
        <div class="stat-value">${links.length}</div>
        <div class="stat-label">Links compartilhados</div>
      </div>`;

    document.getElementById('responded-list').innerHTML = !respondidos.length
      ? '<div class="empty-state" style="padding:24px"><p>Nenhum avaliador respondeu ainda</p></div>'
      : respondidos.map(av => `
        <div class="evaluator-row">
          <div class="evaluator-info">
            <div class="evaluator-avatar">${av.nome.charAt(0)}</div>
            <div><div style="font-size:14px;font-weight:600">${av.nome}</div>
            <div style="font-size:12px;color:var(--text-muted)">${av.total_avaliacoes} avaliação(ões)</div></div>
          </div>
          <span class="badge badge-green">Respondeu</span>
        </div>`).join('');

    document.getElementById('pending-list').innerHTML = !pendentes.length
      ? '<div class="empty-state" style="padding:24px"><p>Todos responderam! 🎉</p></div>'
      : pendentes.map(av => `
        <div class="evaluator-row">
          <div class="evaluator-info">
            <div class="evaluator-avatar" style="background:#ddd;color:#777">${av.nome.charAt(0)}</div>
            <div><div style="font-size:14px;font-weight:600">${av.nome}</div>
            <div style="font-size:12px;color:var(--text-muted)">Sem avaliações</div></div>
          </div>
          <span class="badge badge-gray">Pendente</span>
        </div>`).join('');
  } catch (e) { toast('Erro ao carregar dashboard: ' + e.message, 'error'); }
}

// ==============================
// ANALISTA — ATIVIDADES
// Cada atividade publicada é clicável e abre um painel
// inline para adicionar links diretamente nela.
// "Semana de referência" foi removido do form de link
// pois herda da atividade pai.
// ==============================

// Controla qual atividade está com o painel de links aberto
let openAtividadeId = null;

async function saveAtividade() {
  const semana    = document.getElementById('ativ-semana').value.trim();
  const titulo    = document.getElementById('ativ-titulo').value.trim();
  const descricao = document.getElementById('ativ-desc').value.trim();
  if (!semana || !titulo) { toast('Preencha semana e título', 'error'); return; }
  try {
    await apiFetch(`/api/atividades?criado_por=${currentUser.id}`, {
      method: 'POST', body: JSON.stringify({ semana, titulo, descricao }),
    });
    document.getElementById('ativ-semana').value = '';
    document.getElementById('ativ-titulo').value = '';
    document.getElementById('ativ-desc').value   = '';
    toast('Atividade publicada!', 'success');
    renderAtividades();
  } catch (e) { toast('Erro ao publicar: ' + e.message, 'error'); }
}

async function renderAtividades() {
  try {
    const [atividades, links] = await Promise.all([
      apiFetch('/api/atividades'),
      apiFetch('/api/links'),
    ]);
    const el = document.getElementById('atividades-list');
    if (!atividades.length) {
      el.innerHTML = `<div class="empty-state">
        <svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
        <h3>Nenhuma atividade publicada</h3><p>Crie a primeira atividade acima</p></div>`;
      return;
    }

    el.innerHTML = atividades.map(a => {
      // Links que pertencem a esta atividade (mesma semana)
      const atLinks = links.filter(l => l.semana === a.semana);
      const isOpen  = openAtividadeId === a.id;

      return `
      <!-- Card da atividade — clicável para expandir links -->
      <div class="atividade-card ${isOpen ? 'atividade-open' : ''}" id="ativ-card-${a.id}">
        <!-- Cabeçalho clicável -->
        <div class="atividade-header" onclick="toggleAtividade(${a.id})">
          <div style="display:flex;align-items:center;gap:14px;flex:1;min-width:0">
            <div class="task-icon" style="flex-shrink:0">
              <svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
            </div>
            <div style="flex:1;min-width:0">
              <div class="task-week">${a.semana}</div>
              <div class="task-title">${a.titulo}</div>
              ${a.descricao ? `<div class="task-desc">${a.descricao}</div>` : ''}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
            <span class="badge badge-orange">${atLinks.length} link(s)</span>
            <!-- Ícone chevron que rotaciona quando aberto -->
            <div class="chevron-icon ${isOpen ? 'rotated' : ''}">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
            </div>
          </div>
        </div>

        <!-- Painel expansível com links e form para novo link -->
        <div class="atividade-body ${isOpen ? 'open' : ''}">
          <div style="padding:18px 20px;border-top:1px solid var(--border)">

            <!-- Form para adicionar link nesta atividade -->
            <div class="link-add-form">
              <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;display:flex;align-items:center;gap:6px">
                <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:var(--brand)"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Adicionar link nesta atividade
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
                <div class="form-field" style="margin:0">
                  <label>Título do link</label>
                  <input type="text" id="link-titulo-${a.id}" placeholder="Ex: Story do concorrente A"/>
                </div>
                <div class="form-field" style="margin:0">
                  <label>URL</label>
                  <input type="url" id="link-url-${a.id}" placeholder="https://"/>
                </div>
              </div>
              <button class="btn btn-brand" style="width:100%" onclick="saveLink(${a.id}, '${a.semana}')">
                <svg viewBox="0 0 24 24" fill="white"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                Compartilhar Link
              </button>
            </div>

            <!-- Lista de links desta atividade -->
            ${atLinks.length ? `
            <div style="margin-top:16px">
              <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">
                Links publicados (${atLinks.length})
              </div>
              ${atLinks.map(l => `
              <div class="link-card" style="margin-bottom:10px;padding:14px 16px">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
                  <div style="flex:1;min-width:0">
                    <div class="link-title" style="font-size:13px">${l.titulo}</div>
                    <div class="link-url" style="margin:6px 0 0;padding:6px 10px">
                      <svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:var(--brand);flex-shrink:0"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                      <a href="${l.url}" target="_blank" style="font-size:12px">${l.url}</a>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
                    <span class="badge badge-orange" style="font-size:10px">${l.total_avaliacoes} aval.</span>
                    <button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" onclick="deleteLink(${l.id})">Remover</button>
                  </div>
                </div>
              </div>`).join('')}
            </div>` : `
            <div style="margin-top:14px;padding:16px;background:var(--surface2);border-radius:var(--radius-sm);text-align:center;font-size:13px;color:var(--text-muted)">
              Nenhum link publicado ainda nesta atividade
            </div>`}

            <!-- Botão remover atividade -->
            <div style="margin-top:16px;text-align:right">
              <button class="btn btn-ghost" style="font-size:12px;color:#D32F2F;border-color:#f5b8b8" onclick="deleteAtividade(${a.id})">
                <svg viewBox="0 0 24 24" style="fill:#D32F2F"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                Remover atividade
              </button>
            </div>
          </div>
        </div>
      </div>`;
    }).join('');
  } catch (e) { toast('Erro ao carregar atividades: ' + e.message, 'error'); }
}

// Abre/fecha o painel de links de uma atividade
function toggleAtividade(id) {
  openAtividadeId = openAtividadeId === id ? null : id;
  renderAtividades();
}

async function deleteAtividade(id) {
  try {
    await apiFetch(`/api/atividades/${id}`, { method: 'DELETE' });
    if (openAtividadeId === id) openAtividadeId = null;
    renderAtividades();
    toast('Atividade removida', 'info');
  } catch (e) { toast('Erro ao remover: ' + e.message, 'error'); }
}

// ==============================
// LINKS (agora vivem dentro das atividades)
// A semana é herdada da atividade — não precisa mais
// de campo separado no formulário.
// ==============================
async function saveLink(atividadeId, semana) {
  const titulo = document.getElementById(`link-titulo-${atividadeId}`).value.trim();
  const url    = document.getElementById(`link-url-${atividadeId}`).value.trim();
  if (!titulo || !url) { toast('Preencha título e URL', 'error'); return; }
  try {
    await apiFetch(`/api/links?criado_por=${currentUser.id}`, {
      method: 'POST',
      body: JSON.stringify({ semana, titulo, url }),
    });
    toast('Link compartilhado!', 'success');
    renderAtividades(); // re-renderiza para mostrar o novo link
  } catch (e) { toast('Erro ao compartilhar: ' + e.message, 'error'); }
}

async function deleteLink(id) {
  try {
    await apiFetch(`/api/links/${id}`, { method: 'DELETE' });
    renderAtividades();
    toast('Link removido', 'info');
  } catch (e) { toast('Erro ao remover: ' + e.message, 'error'); }
}

// ==============================
// ANALISTA — AVALIADORES
// ==============================
async function saveAvaliador() {
  const nome     = document.getElementById('aval-nome').value.trim();
  const username = document.getElementById('aval-user').value.trim().replace(/\s+/g, '');
  const password = document.getElementById('aval-pass').value.trim();
  if (!nome || !username || !password) { toast('Preencha todos os campos', 'error'); return; }
  try {
    await apiFetch('/api/avaliadores', { method: 'POST', body: JSON.stringify({ nome, username, password }) });
    document.getElementById('aval-nome').value = '';
    document.getElementById('aval-user').value = '';
    document.getElementById('aval-pass').value = '';
    toast('Avaliador cadastrado!', 'success');
    renderAvaliadores();
  } catch (e) { toast('Erro ao cadastrar: ' + e.message, 'error'); }
}

async function renderAvaliadores() {
  try {
    const avaliadores = await apiFetch('/api/avaliadores');
    document.getElementById('aval-stats').innerHTML = `
      <div class="stat-card highlight">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>
        <div class="stat-value">${avaliadores.length}</div>
        <div class="stat-label">Total de avaliadores</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
        <div class="stat-value">${avaliadores.filter(av => av.total_avaliacoes > 0).length}</div>
        <div class="stat-label">Participaram</div>
      </div>`;
    const tbody = document.getElementById('avaliadores-table-body');
    if (!avaliadores.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px">Nenhum avaliador cadastrado</td></tr>';
      return;
    }
    tbody.innerHTML = avaliadores.map((av, i) => `
      <tr>
        <td><strong>${i + 1}</strong></td>
        <td><div style="display:flex;align-items:center;gap:10px">
          <div class="evaluator-avatar" style="width:32px;height:32px;font-size:12px">${av.nome.charAt(0)}</div>${av.nome}
        </div></td>
        <td><code style="background:var(--surface2);padding:3px 8px;border-radius:4px;font-size:12px">${av.username}</code></td>
        <td><span class="badge ${av.total_avaliacoes > 0 ? 'badge-green' : 'badge-gray'}">${av.total_avaliacoes}</span></td>
        <td><button class="btn btn-ghost" style="padding:5px 12px;font-size:12px" onclick="deleteAvaliador(${av.id})">Remover</button></td>
      </tr>`).join('');
  } catch (e) { toast('Erro ao carregar avaliadores: ' + e.message, 'error'); }
}

async function deleteAvaliador(id) {
  try {
    await apiFetch(`/api/avaliadores/${id}`, { method: 'DELETE' });
    renderAvaliadores(); toast('Avaliador removido', 'info');
  } catch (e) { toast('Erro ao remover: ' + e.message, 'error'); }
}

// ==============================
// RANKING
// ==============================
async function renderRanking(containerId) {
  try {
    const ranking = await apiFetch('/api/ranking');
    const el = document.getElementById(containerId);
    if (!ranking.length) {
      el.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg><h3>Ranking vazio</h3><p>Nenhum link foi avaliado ainda</p></div>';
      return;
    }
    const maxPts = ranking[0].total_pts || 1;
    el.innerHTML = ranking.map((l, i) => {
      const posClass = i === 0 ? 'pos-1' : i === 1 ? 'pos-2' : i === 2 ? 'pos-3' : 'pos-other';
      return `
      <div class="ranking-item" style="flex-direction:column;align-items:stretch;gap:0;padding:18px 20px">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
          <div class="ranking-pos ${posClass}">${i + 1}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:0.5px">${l.semana}</div>
            <div style="font-size:15px;font-weight:700;color:var(--text);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${l.titulo}</div>
            <a href="${l.url}" target="_blank" style="font-size:12px;color:var(--text-muted);word-break:break-all;text-decoration:none">${l.url}</a>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div class="ranking-score">${l.total_pts} <span>pts totais</span></div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${l.count} avaliação(ões)</div>
          </div>
        </div>
        <div class="progress-bar" style="margin-bottom:12px">
          <div class="progress-fill" style="width:${(l.total_pts / maxPts * 100)}%"></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
          ${[['Precificação',l.media_precificacao],['Organização',l.media_organizacao],['Execução',l.media_execucao],['Criatividade',l.media_criatividade]].map(([label,avg])=>`
          <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 10px;text-align:center">
            <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px">${label}</div>
            <div style="font-size:18px;font-weight:800;color:var(--brand)">${avg}</div>
            <div style="font-size:10px;color:#bbb">média</div>
          </div>`).join('')}
        </div>
      </div>`;
    }).join('');
  } catch (e) { toast('Erro ao carregar ranking: ' + e.message, 'error'); }
}

function confirmZerarRanking() { openModal('modal-zerar'); }

async function zerarRanking() {
  try {
    await apiFetch('/api/ranking/zerar', { method: 'POST' });
    closeModal('modal-zerar');
    toast('Ranking zerado!', 'success');
    renderRanking('ranking-list-analista');
    renderDashboard();
  } catch (e) { toast('Erro ao zerar: ' + e.message, 'error'); }
}

// ==============================
// AVALIADOR — DASHBOARD
// Cards clicáveis
// ==============================
async function renderAvalDashboard() {
  document.getElementById('aval-welcome').textContent = `Olá, ${currentUser.nome}! 👋`;
  try {
    const [links, minhasAvaliacoes, atividades] = await Promise.all([
      apiFetch('/api/links'),
      apiFetch(`/api/avaliacoes?avaliador_id=${currentUser.id}`),
      apiFetch('/api/atividades'),
    ]);
    const linksAvaliadosIds = new Set(minhasAvaliacoes.map(a => a.link_id));
    const pendentes = links.filter(l => !linksAvaliadosIds.has(l.id));
    const myScore   = minhasAvaliacoes.reduce((sum, a) => sum + a.total, 0);

    document.getElementById('aval-dashboard-stats').innerHTML = `
      <div class="stat-card highlight" style="cursor:pointer" onclick="navigateTo('ranking-aval')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg></div>
        <div class="stat-value">${myScore}</div>
        <div class="stat-label">Minha pontuação</div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="navigateTo('aval-links')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
        <div class="stat-value">${minhasAvaliacoes.length}</div>
        <div class="stat-label">Avaliações feitas</div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="navigateTo('aval-links')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.01 14H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V6h8v2z"/></svg></div>
        <div class="stat-value">${pendentes.length}</div>
        <div class="stat-label">Links para avaliar</div>
      </div>`;

    const el = document.getElementById('aval-tasks-preview');
    if (!atividades.length) {
      el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px">Nenhuma atividade publicada ainda</div>';
      return;
    }
    el.innerHTML = atividades.slice(0, 2).map(a => `
      <div class="task-card" style="cursor:pointer;border-color:var(--border)" onclick="navigateTo('aval-tarefas')">
        <div class="task-icon"><svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg></div>
        <div class="task-body">
          <div class="task-week">${a.semana}</div>
          <div class="task-title">${a.titulo}</div>
          ${a.descricao ? `<div class="task-desc">${a.descricao}</div>` : ''}
        </div>
      </div>`).join('');
  } catch (e) { toast('Erro ao carregar painel: ' + e.message, 'error'); }
}

// ==============================
// AVALIADOR — TAREFAS DA SEMANA
// Cada atividade é clicável. Ao clicar, navega para
// a página de links daquela atividade específica.
// ==============================
async function renderAvalTarefas() {
  try {
    const atividades = await apiFetch('/api/atividades');
    const el = document.getElementById('aval-tarefas-list');
    if (!atividades.length) {
      el.innerHTML = `<div class="empty-state">
        <svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
        <h3>Nenhuma atividade ainda</h3><p>A analista ainda não publicou atividades</p></div>`;
      return;
    }
    el.innerHTML = atividades.map(a => `
      <div class="task-card task-card-clickable"
           onclick="openAtividadeLinks(${a.id}, '${escapeStr(a.semana)}', '${escapeStr(a.titulo)}')"
           title="Ver links desta atividade">
        <div class="task-icon">
          <svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
        </div>
        <div class="task-body" style="flex:1">
          <div class="task-week">${a.semana}</div>
          <div class="task-title">${a.titulo}</div>
          ${a.descricao ? `<div class="task-desc">${a.descricao}</div>` : ''}
          <div style="margin-top:8px;font-size:11px;color:#bbb">
            Publicado em ${new Date(a.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
        <!-- Seta indicando que é clicável -->
        <div style="display:flex;align-items:center;color:var(--brand);flex-shrink:0;padding-left:8px">
          <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
        </div>
      </div>`).join('');
  } catch (e) { toast('Erro ao carregar tarefas: ' + e.message, 'error'); }
}

// Escape para usar em atributos HTML
function escapeStr(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ==============================
// AVALIADOR — PÁGINA DE LINKS DA ATIVIDADE
// Mostra apenas os links para visualização.
// O avaliador precisa marcar todos como "vistos"
// antes de poder ir para a avaliação.
// ==============================

// Controla os links já visualizados nesta sessão
let linksVistos = new Set();
let atividadeAtualId   = null;
let atividadeAtualSemana = null;

async function openAtividadeLinks(atividadeId, semana, titulo) {
  atividadeAtualId     = atividadeId;
  atividadeAtualSemana = semana;
  linksVistos          = new Set(); // reset ao abrir nova atividade

  // Busca links desta semana
  try {
    const links = await apiFetch('/api/links');
    const atLinks = links.filter(l => l.semana === semana);

    const el = document.getElementById('aval-links-visualizacao');

    if (!atLinks.length) {
      el.innerHTML = `
        <div class="page-header">
          <h2>${titulo}</h2>
          <p>${semana}</p>
        </div>
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5z"/></svg>
          <h3>Nenhum link nesta atividade</h3>
          <p>A analista ainda não compartilhou links aqui</p>
        </div>
        <button class="btn btn-ghost" onclick="navigateTo('aval-tarefas')" style="margin-top:16px">
          ← Voltar para atividades
        </button>`;
    } else {
      el.innerHTML = `
        <div class="page-header">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px">
            <button class="btn btn-ghost" style="padding:6px 12px;font-size:12px" onclick="navigateTo('aval-tarefas')">
              <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Voltar
            </button>
          </div>
          <h2>${titulo}</h2>
          <p>${semana} · ${atLinks.length} link(s) para visualizar</p>
        </div>

        <!-- Barra de progresso de visualização -->
        <div class="card" style="margin-bottom:20px;padding:16px 20px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <div style="font-size:13px;font-weight:600;color:var(--text)">
              📋 Visualize todos os links antes de avaliar
            </div>
            <div style="font-size:12px;color:var(--text-muted)" id="vistos-contador">
              0 / ${atLinks.length} vistos
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" id="vistos-progress" style="width:0%"></div>
          </div>
        </div>

        <!-- Lista de links para visualização -->
        <div id="links-visualizacao-list">
          ${atLinks.map(l => `
          <div class="link-visualizacao-card" id="link-vis-${l.id}">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
              <div style="flex:1;min-width:0">
                <div class="link-title">${l.titulo}</div>
                <div class="link-url" style="margin-top:8px">
                  <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:var(--brand);flex-shrink:0"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5z"/></svg>
                  <a href="${l.url}" target="_blank" onclick="marcarVisto(${l.id}, ${atLinks.length})">${l.url}</a>
                </div>
              </div>
              <!-- Botão "Marcar como visto" / check quando já visto -->
              <button class="btn-visto" id="btn-visto-${l.id}"
                onclick="marcarVisto(${l.id}, ${atLinks.length}); window.open('${l.url}','_blank')"
                title="Abrir e marcar como visto">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                Abrir link
              </button>
            </div>
          </div>`).join('')}
        </div>

        <!-- Botão para ir à avaliação — aparece só quando todos os links foram vistos -->
        <div id="btn-ir-avaliar-wrap" style="display:none;margin-top:24px">
          <div style="background:linear-gradient(135deg,var(--brand-pale) 0%,#fff 100%);border:2px solid var(--brand-light);border-radius:var(--radius);padding:20px;text-align:center">
            <div style="font-size:22px;margin-bottom:8px">✅</div>
            <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">Você visualizou todos os links!</div>
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Agora você pode avaliar as publicações</div>
            <button class="btn btn-brand" style="width:100%;font-size:15px;padding:14px;justify-content:center" onclick="navigateTo('aval-links')">
              <svg viewBox="0 0 24 24" fill="white"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              Ir para Avaliação
            </button>
          </div>
        </div>`;
    }

    // Muda para a página de visualização
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-aval-links-visualizacao').classList.add('active');

  } catch (e) { toast('Erro ao carregar links: ' + e.message, 'error'); }
}

// Marca um link como visto e atualiza a barra de progresso
function marcarVisto(linkId, total) {
  linksVistos.add(linkId);

  // Atualiza visual do card
  const card = document.getElementById(`link-vis-${linkId}`);
  if (card) card.classList.add('link-visto');

  const btn = document.getElementById(`btn-visto-${linkId}`);
  if (btn) {
    btn.classList.add('btn-visto-done');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Visto`;
  }

  // Atualiza barra de progresso
  const vistos = linksVistos.size;
  const pct    = Math.round((vistos / total) * 100);
  const contador = document.getElementById('vistos-contador');
  const progress = document.getElementById('vistos-progress');
  if (contador) contador.textContent = `${vistos} / ${total} vistos`;
  if (progress)  progress.style.width = pct + '%';

  // Libera botão de avaliação quando todos vistos
  if (vistos >= total) {
    const wrap = document.getElementById('btn-ir-avaliar-wrap');
    if (wrap) wrap.style.display = 'block';
  }
}

// ==============================
// AVALIADOR — LINKS & AVALIAÇÃO
// Mantém estrutura original + campo de observação
// quando critério recebe nota ≤ 3
// ==============================
async function renderAvalLinks() {
  try {
    const [links, minhasAvaliacoes] = await Promise.all([
      apiFetch('/api/links'),
      apiFetch(`/api/avaliacoes?avaliador_id=${currentUser.id}`),
    ]);
    const el = document.getElementById('aval-links-list');
    if (!links.length) {
      el.innerHTML = `<div class="empty-state">
        <svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5z"/></svg>
        <h3>Nenhum link disponível</h3><p>Aguarde a analista compartilhar links</p></div>`;
      return;
    }

    el.innerHTML = links.map(l => {
      const myEval      = minhasAvaliacoes.find(a => a.link_id === l.id);
      const alreadyEval = !!myEval;
      let evalSection   = '';

      if (alreadyEval) {
        evalSection = `
          <div class="avaliacao-already">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            Você já avaliou este link! Pontuação: <strong>${myEval.total} pts</strong>
            (Precificação: ${myEval.precificacao}, Organização: ${myEval.organizacao}, Execução: ${myEval.execucao}, Criatividade: ${myEval.criatividade})
          </div>`;
      } else {
        // Critérios com campo de observação quando nota ≤ 3
        const criteriosHTML = ['precificacao','organizacao','execucao','criatividade'].map(crit => `
          <div class="criteria-item">
            <div class="criteria-label">${critLabel(crit)}</div>
            <div class="stars" id="stars-${l.id}-${crit}">
              ${[1,2,3,4,5].map(n => `
                <div class="star" onclick="setStar(${l.id},'${crit}',${n})" data-val="${n}">${n}</div>
              `).join('')}
            </div>
            <div class="criteria-score">0 a 5 pontos (+5 máx)</div>
            <!-- Campo de observação — aparece só quando nota ≤ 3 -->
            <div class="obs-field" id="obs-wrap-${l.id}-${crit}" style="display:none;margin-top:8px">
              <textarea
                id="obs-${l.id}-${crit}"
                placeholder="Observação (opcional)..."
                rows="2"
                style="width:100%;padding:8px 10px;border:1.5px solid var(--brand-pale2);border-radius:var(--radius-sm);font-size:12px;font-family:var(--font);resize:vertical;outline:none;background:#fffaf8;color:var(--text)"
                onfocus="this.style.borderColor='var(--brand)'"
                onblur="this.style.borderColor='var(--brand-pale2)'"
              ></textarea>
              <div style="font-size:10px;color:var(--brand);margin-top:3px;font-weight:600">
                ⚠ Nota baixa — descreva o que pode melhorar
              </div>
            </div>
          </div>`).join('');

        evalSection = `
          <div class="criteria-grid" id="criteria-${l.id}">${criteriosHTML}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px">
            <div style="font-size:13px;color:var(--text-muted)">Total máximo: <strong>20 pontos</strong></div>
            <button class="btn btn-brand" onclick="submitAvaliacao(${l.id})">
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
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:var(--brand);flex-shrink:0"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5z"/></svg>
          <a href="${l.url}" target="_blank">${l.url}</a>
        </div>
        <div class="divider"></div>
        <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px">
          ${alreadyEval ? 'Sua avaliação' : 'Avalie os critérios abaixo:'}
        </div>
        ${evalSection}
      </div>`;
    }).join('');

    window._stars = window._stars || {};
  } catch (e) { toast('Erro ao carregar avaliações: ' + e.message, 'error'); }
}

function critLabel(c) {
  const m = { precificacao:'Precificação', organizacao:'Organização', execucao:'Execução', criatividade:'Criatividade' };
  return m[c] || c;
}

window._stars = {};

// setStar agora também controla visibilidade do campo de observação
function setStar(linkId, crit, val) {
  if (!window._stars[linkId]) window._stars[linkId] = {};
  window._stars[linkId][crit] = val;

  // Atualiza visual dos botões
  const container = document.getElementById(`stars-${linkId}-${crit}`);
  if (container) {
    container.querySelectorAll('.star').forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.val) <= val);
    });
  }

  // Mostra/esconde campo de observação: aparece se nota ≤ 3
  const obsWrap = document.getElementById(`obs-wrap-${linkId}-${crit}`);
  if (obsWrap) {
    obsWrap.style.display = val <= 3 ? 'block' : 'none';
    // Limpa obs se nota for alta
    if (val > 3) {
      const obsField = document.getElementById(`obs-${linkId}-${crit}`);
      if (obsField) obsField.value = '';
    }
  }
}

async function submitAvaliacao(linkId) {
  const s            = window._stars[linkId] || {};
  const precificacao = s.precificacao || 0;
  const organizacao  = s.organizacao  || 0;
  const execucao     = s.execucao     || 0;
  const criatividade = s.criatividade || 0;
  if (!precificacao && !organizacao && !execucao && !criatividade) {
    toast('Avalie pelo menos um critério', 'error'); return;
  }
  try {
    await apiFetch('/api/avaliacoes', {
      method: 'POST',
      body: JSON.stringify({ link_id: linkId, avaliador_id: currentUser.id, precificacao, organizacao, execucao, criatividade }),
    });
    delete window._stars[linkId];
    toast(`Avaliação enviada! +${precificacao+organizacao+execucao+criatividade} pontos`, 'success');
    renderAvalLinks();
  } catch (e) { toast('Erro ao enviar avaliação: ' + e.message, 'error'); }
}

// ==============================
// INIT
// ==============================
document.getElementById('login-user').focus();
