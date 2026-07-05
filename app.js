// ==============================
// CONFIGURAÇÃO DA API
// ==============================
// IMPORTANTE: troque pela URL pública do seu backend no Railway.
// Exemplo: 'https://seu-projeto-production.up.railway.app'
// (sem barra "/" no final)
const API_BASE_URL = 'https://avalia-o-de-marketing-production.up.railway.app';

async function apiRequest(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (e) {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua internet ou se a API está no ar.');
  }
  if (!res.ok) {
    let msg = `Erro ${res.status} ao falar com o servidor.`;
    try {
      const err = await res.json();
      if (err.detail) msg = typeof err.detail === 'string' ? err.detail : msg;
    } catch (e) { /* corpo vazio ou não-JSON */ }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  try { return await res.json(); } catch (e) { return null; }
}

function apiGet(path) { return apiRequest(path); }
function apiPost(path, body) {
  return apiRequest(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
}
function apiDelete(path) { return apiRequest(path, { method: 'DELETE' }); }

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR');
}

// ==============================
// AUTH
// ==============================
let currentUser = null;

async function doLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  if (!user || !pass) { errEl.textContent = 'Preencha usuário e senha.'; return; }

  try {
    const data = await apiPost('/api/login', { username: user, password: pass });
    currentUser = { id: data.id, name: data.nome, username: data.username, role: data.role };
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    buildSidebar();
    if (currentUser.role === 'analista') navigateTo('dashboard');
    else navigateTo('aval-dashboard');
  } catch (e) {
    errEl.textContent = e.message || 'Usuário ou senha incorretos.';
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

async function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add('active');
  // Render page
  if (pageId === 'dashboard') await renderDashboard();
  else if (pageId === 'atividade') await renderAtividades();
  else if (pageId === 'links-analista') await renderLinksAnalista();
  else if (pageId === 'avaliadores') await renderAvaliadores();
  else if (pageId === 'ranking-analista') await renderRanking('ranking-list-analista');
  else if (pageId === 'aval-dashboard') await renderAvalDashboard();
  else if (pageId === 'aval-tarefas') await renderAvalTarefas();
  else if (pageId === 'aval-links') await renderAvalLinks();
  else if (pageId === 'ranking-aval') await renderRanking('ranking-list-aval');
}

// ==============================
// UTILS
// ==============================
function toast(msg, type = 'info') {
  const t = document.getElementById('toast');
  const icons = { success: '✓', error: '✕', info: '→' };
  t.innerHTML = `<span>${icons[type]||'→'}</span> ${msg}`;
  t.className = `show ${type}`;
  setTimeout(() => t.className = '', 3000);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Helpers puros que operam sobre listas já buscadas da API
function calcUserAvalCount(avals, userId) { return avals.filter(a => a.avaliador_id === userId).length; }
function calcUserScore(avals, userId) { return avals.filter(a => a.avaliador_id === userId).reduce((s, a) => s + (a.total || 0), 0); }
function calcHasEvaluated(avals, userId, linkId) { return avals.some(a => a.avaliador_id === userId && a.link_id === linkId); }

// ==============================
// ANALISTA — DASHBOARD
// ==============================
async function renderDashboard() {
  try {
    const [avaliadores, links, avals] = await Promise.all([
      apiGet('/api/avaliadores'),
      apiGet('/api/links'),
      apiGet('/api/avaliacoes'),
    ]);

    const respondidos = avaliadores.filter(av => avals.some(a => a.avaliador_id === av.id));
    const pendentes = avaliadores.filter(av => !avals.some(a => a.avaliador_id === av.id));

    document.getElementById('dashboard-stats').innerHTML = `
      <div class="stat-card highlight clickable-card" onclick="navigateTo('avaliadores')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>
        <div class="stat-value">${avaliadores.length}</div>
        <div class="stat-label">Avaliadores cadastrados</div>
      </div>
      <div class="stat-card clickable-card" onclick="navigateTo('avaliadores')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
        <div class="stat-value">${respondidos.length}</div>
        <div class="stat-label">Responderam esta semana</div>
      </div>
      <div class="stat-card clickable-card" onclick="navigateTo('avaliadores')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg></div>
        <div class="stat-value">${pendentes.length}</div>
        <div class="stat-label">Pendentes</div>
      </div>
      <div class="stat-card clickable-card" onclick="navigateTo('links-analista')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg></div>
        <div class="stat-value">${links.length}</div>
        <div class="stat-label">Links compartilhados</div>
      </div>
    `;

    const rEl = document.getElementById('responded-list');
    if (!respondidos.length) {
      rEl.innerHTML = '<div class="empty-state" style="padding:24px"><p>Nenhum avaliador respondeu ainda</p></div>';
    } else {
      rEl.innerHTML = respondidos.map(av => `
        <div class="evaluator-row">
          <div class="evaluator-info">
            <div class="evaluator-avatar">${av.nome.charAt(0)}</div>
            <div>
              <div style="font-size:14px;font-weight:600">${av.nome}</div>
              <div style="font-size:12px;color:var(--text-muted)">${calcUserAvalCount(avals, av.id)} avaliação(ões)</div>
            </div>
          </div>
          <span class="badge badge-green">Respondeu</span>
        </div>`).join('');
    }

    const pEl = document.getElementById('pending-list');
    if (!pendentes.length) {
      pEl.innerHTML = '<div class="empty-state" style="padding:24px"><p>Todos responderam! 🎉</p></div>';
    } else {
      pEl.innerHTML = pendentes.map(av => `
        <div class="evaluator-row">
          <div class="evaluator-info">
            <div class="evaluator-avatar" style="background:#ddd;color:#777">${av.nome.charAt(0)}</div>
            <div>
              <div style="font-size:14px;font-weight:600">${av.nome}</div>
              <div style="font-size:12px;color:var(--text-muted)">Sem avaliações</div>
            </div>
          </div>
          <span class="badge badge-gray">Pendente</span>
        </div>`).join('');
    }
  } catch (e) {
    toast(e.message || 'Erro ao carregar o dashboard', 'error');
  }
}

// ==============================
// ANALISTA — ATIVIDADES
// ==============================
async function saveAtividade() {
  const semana = document.getElementById('ativ-semana').value.trim();
  const titulo = document.getElementById('ativ-titulo').value.trim();
  const desc = document.getElementById('ativ-desc').value.trim();
  if (!semana || !titulo) { toast('Preencha semana e título', 'error'); return; }
  try {
    await apiPost(`/api/atividades?criado_por=${currentUser.id}`, { semana, titulo, descricao: desc || null });
    document.getElementById('ativ-semana').value = '';
    document.getElementById('ativ-titulo').value = '';
    document.getElementById('ativ-desc').value = '';
    toast('Atividade publicada com sucesso!', 'success');
    renderAtividades();
  } catch (e) {
    toast(e.message || 'Erro ao publicar atividade', 'error');
  }
}

async function renderAtividades() {
  try {
    const atividades = await apiGet('/api/atividades');
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
          ${a.descricao ? `<div class="task-desc">${a.descricao}</div>` : ''}
          <div style="margin-top:8px;font-size:11px;color:#bbb">Publicado em ${formatDate(a.created_at)}</div>
        </div>
        <button class="btn btn-ghost" style="flex-shrink:0;padding:7px 12px;font-size:12px" onclick="deleteAtividade('${a.id}')">Remover</button>
      </div>`).join('');
  } catch (e) {
    toast(e.message || 'Erro ao carregar atividades', 'error');
  }
}

async function deleteAtividade(id) {
  try {
    await apiDelete(`/api/atividades/${id}`);
    renderAtividades();
    toast('Atividade removida', 'info');
  } catch (e) {
    toast(e.message || 'Erro ao remover atividade', 'error');
  }
}

// ==============================
// ANALISTA — LINKS
// ==============================
async function saveLink() {
  const semana = document.getElementById('link-semana').value.trim();
  const titulo = document.getElementById('link-titulo').value.trim();
  const url = document.getElementById('link-url').value.trim();
  if (!semana || !titulo || !url) { toast('Preencha todos os campos', 'error'); return; }
  try {
    await apiPost(`/api/links?criado_por=${currentUser.id}`, { semana, titulo, url });
    document.getElementById('link-semana').value = '';
    document.getElementById('link-titulo').value = '';
    document.getElementById('link-url').value = '';
    toast('Link compartilhado com sucesso!', 'success');
    renderLinksAnalista();
  } catch (e) {
    toast(e.message || 'Erro ao compartilhar link', 'error');
  }
}

async function renderLinksAnalista() {
  try {
    const links = await apiGet('/api/links');
    const el = document.getElementById('links-analista-list');
    if (!links.length) {
      el.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg><h3>Nenhum link compartilhado</h3><p>Adicione o primeiro link acima</p></div>';
      return;
    }
    el.innerHTML = links.map(l => `
      <div class="link-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div>
            <div class="link-week">${l.semana}</div>
            <div class="link-title">${l.titulo}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <span class="badge badge-orange">${l.total_avaliacoes} avaliação(ões)</span>
            <button class="btn btn-ghost" style="padding:5px 10px;font-size:12px" onclick="deleteLink('${l.id}')">Remover</button>
          </div>
        </div>
        <div class="link-url">
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:var(--brand);flex-shrink:0"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
          <a href="${l.url}" target="_blank">${l.url}</a>
        </div>
        <div style="font-size:11px;color:#bbb;margin-top:4px">Adicionado em ${formatDate(l.created_at)}</div>
      </div>`).join('');
  } catch (e) {
    toast(e.message || 'Erro ao carregar links', 'error');
  }
}

async function deleteLink(id) {
  try {
    await apiDelete(`/api/links/${id}`);
    renderLinksAnalista();
    toast('Link removido', 'info');
  } catch (e) {
    toast(e.message || 'Erro ao remover link', 'error');
  }
}

// ==============================
// ANALISTA — AVALIADORES
// ==============================
async function saveAvaliador() {
  const nome = document.getElementById('aval-nome').value.trim();
  const username = document.getElementById('aval-user').value.trim().replace(/\s+/g, '');
  const password = document.getElementById('aval-pass').value.trim();
  if (!nome || !username || !password) { toast('Preencha todos os campos', 'error'); return; }
  try {
    await apiPost('/api/avaliadores', { nome, username, password });
    document.getElementById('aval-nome').value = '';
    document.getElementById('aval-user').value = '';
    document.getElementById('aval-pass').value = '';
    toast('Avaliador cadastrado!', 'success');
    renderAvaliadores();
  } catch (e) {
    toast(e.message || 'Erro ao cadastrar avaliador', 'error');
  }
}

async function renderAvaliadores() {
  try {
    const avaliadores = await apiGet('/api/avaliadores');
    const statsEl = document.getElementById('aval-stats');
    statsEl.innerHTML = `
      <div class="stat-card highlight">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>
        <div class="stat-value">${avaliadores.length}</div>
        <div class="stat-label">Total de avaliadores</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
        <div class="stat-value">${avaliadores.filter(av => av.total_avaliacoes > 0).length}</div>
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
            <div class="evaluator-avatar" style="width:32px;height:32px;font-size:12px">${av.nome.charAt(0)}</div>
            ${av.nome}
          </div>
        </td>
        <td><code style="background:var(--surface2);padding:3px 8px;border-radius:4px;font-size:12px">${av.username}</code></td>
        <td><span class="badge ${av.total_avaliacoes > 0 ? 'badge-green' : 'badge-gray'}">${av.total_avaliacoes}</span></td>
        <td>
          <button class="btn btn-ghost" style="padding:5px 12px;font-size:12px" onclick="deleteAvaliador('${av.id}')">Remover</button>
        </td>
      </tr>`).join('');
  } catch (e) {
    toast(e.message || 'Erro ao carregar avaliadores', 'error');
  }
}

async function deleteAvaliador(id) {
  try {
    await apiDelete(`/api/avaliadores/${id}`);
    renderAvaliadores();
    toast('Avaliador removido', 'info');
  } catch (e) {
    toast(e.message || 'Erro ao remover avaliador', 'error');
  }
}

// ==============================
// RANKING
// ==============================
async function renderRanking(containerId) {
  try {
    const ranked = await apiGet('/api/ranking'); // já vem ordenado pela API
    const el = document.getElementById(containerId);
    if (!ranked.length) {
      el.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg><h3>Ranking vazio</h3><p>Nenhum link foi compartilhado ainda</p></div>';
      return;
    }

    const maxPts = ranked[0].total_pts || 1;

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
            <div class="ranking-score">${l.total_pts} <span>pts totais</span></div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${l.count} avaliação(ões)</div>
          </div>
        </div>
        <div class="progress-bar" style="margin-bottom:12px">
          <div class="progress-fill" style="width:${maxPts > 0 ? (l.total_pts/maxPts*100) : 0}%"></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
          ${[['Precificação', l.media_precificacao],['Organização', l.media_organizacao],['Execução', l.media_execucao],['Criatividade', l.media_criatividade]].map(([label, avg]) => `
          <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 10px;text-align:center">
            <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px">${label}</div>
            <div style="font-size:18px;font-weight:800;color:var(--brand)">${avg}</div>
            <div style="font-size:10px;color:#bbb">média</div>
          </div>`).join('')}
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    toast(e.message || 'Erro ao carregar o ranking', 'error');
  }
}

function confirmZerarRanking() { openModal('modal-zerar'); }

async function zerarRanking() {
  try {
    await apiPost('/api/ranking/zerar');
    closeModal('modal-zerar');
    toast('Ranking zerado e links apagados com sucesso!', 'success');
    renderRanking('ranking-list-analista');
    renderDashboard();
  } catch (e) {
    toast(e.message || 'Erro ao zerar ranking', 'error');
  }
}

// ==============================
// AVALIADOR — DASHBOARD
// ==============================
async function renderAvalDashboard() {
  document.getElementById('aval-welcome').textContent = `Olá, ${currentUser.name}! 👋`;
  try {
    const [links, avals, atividades] = await Promise.all([
      apiGet('/api/links'),
      apiGet(`/api/avaliacoes?avaliador_id=${currentUser.id}`),
      apiGet('/api/atividades'),
    ]);
    const pendentes = links.filter(l => !avals.some(a => a.link_id === l.id));
    const myScore = avals.reduce((s, a) => s + (a.total || 0), 0);

    document.getElementById('aval-dashboard-stats').innerHTML = `
      <div class="stat-card highlight clickable-card" onclick="navigateTo('ranking-aval')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg></div>
        <div class="stat-value">${myScore}</div>
        <div class="stat-label">Minha pontuação</div>
      </div>
      <div class="stat-card clickable-card" onclick="navigateTo('aval-links')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
        <div class="stat-value">${avals.length}</div>
        <div class="stat-label">Avaliações feitas</div>
      </div>
      <div class="stat-card clickable-card" onclick="navigateTo('aval-links')">
        <div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.01 14H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V6h8v2z"/></svg></div>
        <div class="stat-value">${pendentes.length}</div>
        <div class="stat-label">Links para avaliar</div>
      </div>
    `;

    const primeiras = atividades.slice(0, 2);
    const el = document.getElementById('aval-tasks-preview');
    if (!primeiras.length) {
      el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px">Nenhuma atividade publicada ainda</div>';
      return;
    }
    el.innerHTML = primeiras.map(a => `
      <div class="task-card">
        <div class="task-icon"><svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg></div>
        <div class="task-body">
          <div class="task-week">${a.semana}</div>
          <div class="task-title">${a.titulo}</div>
          ${a.descricao ? `<div class="task-desc">${a.descricao}</div>` : ''}
        </div>
      </div>`).join('');
  } catch (e) {
    toast(e.message || 'Erro ao carregar seu painel', 'error');
  }
}

// ==============================
// AVALIADOR — TAREFAS
// ==============================
async function renderAvalTarefas() {
  try {
    const atividades = await apiGet('/api/atividades');
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
          ${a.descricao ? `<div class="task-desc">${a.descricao}</div>` : ''}
          <div style="margin-top:8px;font-size:11px;color:#bbb">Publicado em ${formatDate(a.created_at)}</div>
        </div>
      </div>`).join('');
  } catch (e) {
    toast(e.message || 'Erro ao carregar tarefas', 'error');
  }
}

// ==============================
// AVALIADOR — LINKS & AVALIAÇÃO
// ==============================
async function renderAvalLinks() {
  try {
    const [links, myAvals] = await Promise.all([
      apiGet('/api/links'),
      apiGet(`/api/avaliacoes?avaliador_id=${currentUser.id}`),
    ]);
    const el = document.getElementById('aval-links-list');
    if (!links.length) {
      el.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg><h3>Nenhum link disponível</h3><p>Aguarde a analista compartilhar links</p></div>';
      return;
    }

    el.innerHTML = links.map(l => {
      const myEval = myAvals.find(a => a.link_id === l.id);
      const alreadyEval = !!myEval;

      let evalSection = '';
      if (alreadyEval) {
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

    window._stars = window._stars || {};
  } catch (e) {
    toast(e.message || 'Erro ao carregar links para avaliação', 'error');
  }
}

function critLabel(c) {
  const m = { precificacao: 'Precificação', organizacao: 'Organização', execucao: 'Execução', criatividade: 'Criatividade' };
  return m[c] || c;
}

window._stars = {};

function setStar(linkId, crit, val) {
  if (!window._stars[linkId]) window._stars[linkId] = {};
  window._stars[linkId][crit] = val;
  const container = document.getElementById(`stars-${linkId}-${crit}`);
  if (!container) return;
  container.querySelectorAll('.star').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.val) <= val);
  });
}

async function submitAvaliacao(linkId) {
  const s = window._stars[linkId] || {};
  const prec = s.precificacao || 0;
  const org = s.organizacao || 0;
  const exec_ = s.execucao || 0;
  const criat = s.criatividade || 0;
  if (!prec && !org && !exec_ && !criat) { toast('Avalie pelo menos um critério', 'error'); return; }

  try {
    const nova = await apiPost('/api/avaliacoes', {
      link_id: Number(linkId),
      avaliador_id: currentUser.id,
      precificacao: prec,
      organizacao: org,
      execucao: exec_,
      criatividade: criat,
    });
    delete window._stars[linkId];
    toast(`Avaliação enviada! +${nova.total} pontos`, 'success');
    renderAvalLinks();
  } catch (e) {
    toast(e.message || 'Erro ao enviar avaliação', 'error');
  }
}

// ==============================
// UI EXTRA — cards clicáveis
// ==============================
(function injectClickableCardStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .stat-card.clickable-card {
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .stat-card.clickable-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.08);
    }
    .stat-card.clickable-card:active {
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
})();

// ==============================
// INIT
// ==============================
document.getElementById('login-user').focus();
