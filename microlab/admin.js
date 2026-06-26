'use strict';

// ===== Config =====
const ADMIN_EMAIL = 'microlab.community@gmail.com';
const ADMIN_PASSWORD = '$microlab2026';
const MEMBERS_KEY = 'ml_members';
const PROJECTS_KEY = 'ml_projects';
const MAX_MEMBERS = 15;

// ===== State =====
let currentPanel = 'members';
let editingMemberId = null;
let editingProjectId = null;
let deleteTarget = null;
let photoData = null;

// ============================================================
// FLUID CANVAS
// ============================================================
(function initCanvas() {
  const canvas = document.getElementById('fluidCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w, h;

  function resize() {
    w = canvas.width = canvas.clientWidth * dpr;
    h = canvas.height = canvas.clientHeight * dpr;
  }
  resize();
  window.addEventListener('resize', resize);

  const blobs = [
    { x:0.2, y:0.3, r:0.45, color:'#c8d400', speed:0.00018, phase:0 },
    { x:0.8, y:0.6, r:0.5,  color:'#f97316', speed:0.00013, phase:2.1 },
    { x:0.5, y:0.8, r:0.4,  color:'#dc2626', speed:0.00021, phase:4.2 },
    { x:0.15,y:0.75,r:0.35, color:'#3ab8b8', speed:0.00016, phase:1.1 },
  ];

  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0002,
    vy: (Math.random() - 0.5) * 0.0002 - 0.00005,
    r: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.25 + 0.05,
    color: ['#c8d400','#f97316','#3ab8b8','#ffffff'][Math.floor(Math.random() * 4)]
  }));

  let t = 0;
  function frame() {
    t++;
    ctx.fillStyle = 'rgba(12,12,16,0.2)';
    ctx.fillRect(0, 0, w, h);

    blobs.forEach(b => {
      const bx = (b.x + Math.sin(t * b.speed * Math.PI * 2 + b.phase) * 0.2) * w;
      const by = (b.y + Math.cos(t * b.speed * Math.PI * 2 + b.phase * 1.3) * 0.15) * h;
      const br = b.r * Math.min(w, h);
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, b.color + '1a');
      g.addColorStop(0.5, b.color + '0a');
      g.addColorStop(1, b.color + '00');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });

    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
      const alpha = Math.round(p.alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.r * dpr, 0, Math.PI * 2);
      ctx.fillStyle = p.color + alpha;
      ctx.fill();
    });

    const vig = ctx.createRadialGradient(w/2, h/2, w*0.2, w/2, h/2, w*0.75);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    requestAnimationFrame(frame);
  }
  frame();
})();

// ============================================================
// LOGIN
// ============================================================
var loginScreen = document.getElementById('loginScreen');
var dashboard = document.getElementById('dashboard');
var loginForm = document.getElementById('loginForm');
var lError = document.getElementById('lError');
var lBtn = document.getElementById('lBtn');
var lBtnLabel = document.getElementById('lBtnLabel');
var lPassword = document.getElementById('lPassword');
var pwToggle = document.getElementById('pwToggle');
var pwIcon = document.getElementById('pwIcon');

pwToggle.addEventListener('click', function () {
  var show = lPassword.type === 'password';
  lPassword.type = show ? 'text' : 'password';
  pwIcon.className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
});

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  var email = document.getElementById('lEmail').value.trim();
  var password = lPassword.value;

  lBtn.disabled = true;
  lBtnLabel.textContent = 'Authenticating…';
  lError.classList.remove('show');

  setTimeout(function () {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      loginScreen.style.display = 'none';
      dashboard.style.display = 'flex';
      document.getElementById('sbUser').textContent = email;
      initDashboard();
    } else {
      lError.textContent = 'Invalid credentials. Please try again.';
      lError.classList.add('show');
      lBtn.disabled = false;
      lBtnLabel.textContent = 'Sign In';
    }
  }, 700);
});

document.getElementById('logoutBtn').addEventListener('click', function () {
  dashboard.style.display = 'none';
  loginScreen.style.display = 'flex';
  loginForm.reset();
  lBtn.disabled = false;
  lBtnLabel.textContent = 'Sign In';
  lError.classList.remove('show');
});

// ============================================================
// DASHBOARD INIT
// ============================================================
function initDashboard() {
  renderMemberTable();
  renderProjectTable();

  // Sidebar nav
  document.querySelectorAll('.sb-item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentPanel = btn.dataset.panel;
      document.querySelectorAll('.sb-item').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
      document.getElementById('panel-' + currentPanel).classList.add('active');
      document.getElementById('dashTitle').textContent =
        currentPanel.charAt(0).toUpperCase() + currentPanel.slice(1);
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  document.getElementById('menuBtn').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.getElementById('btnAdd').addEventListener('click', function () {
    if (currentPanel === 'members') openMemberDrawer(null);
    else openProjectDrawer(null);
  });
}

// ============================================================
// STORAGE HELPERS
// ============================================================
function getMembers() {
  try { return JSON.parse(localStorage.getItem(MEMBERS_KEY)) || []; } catch (e) { return []; }
}
function saveMembers(arr) { localStorage.setItem(MEMBERS_KEY, JSON.stringify(arr)); }
function getProjects() {
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY)) || []; } catch (e) { return []; }
}
function saveProjects(arr) { localStorage.setItem(PROJECTS_KEY, JSON.stringify(arr)); }

// ============================================================
// HELPERS
// ============================================================
function getInitials(name) {
  return name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
}
function getInitialsColor(name) {
  var hues = [16, 25, 160, 200, 270, 340];
  var hash = 0;
  for (var i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return 'hsl(' + hues[Math.abs(hash) % hues.length] + ',65%,32%)';
}
function adminToast(msg, type) {
  var t = document.getElementById('adminToast');
  t.textContent = msg;
  t.className = 'admin-toast ' + (type || 'success') + ' show';
  setTimeout(function () { t.classList.remove('show'); }, 3000);
}

// ============================================================
// MEMBERS — TABLE
// ============================================================
function renderMemberTable() {
  var members = getMembers();
  var search = document.getElementById('memberSearch').value.toLowerCase();
  var filtered = members.filter(function (m) {
    return m.name.toLowerCase().includes(search) || m.role.toLowerCase().includes(search);
  });

  document.getElementById('memberBadge').textContent = members.length;
  document.getElementById('memberCount').textContent =
    filtered.length + ' member' + (filtered.length !== 1 ? 's' : '');

  var rows = document.getElementById('memberRows');
  var empty = document.getElementById('memberEmpty');
  var tableWrap = document.getElementById('memberTableWrap');

  if (!filtered.length) {
    rows.innerHTML = '';
    tableWrap.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  tableWrap.style.display = 'block';
  empty.style.display = 'none';

  rows.innerHTML = filtered.map(function (m) {
    var avatarHtml = m.image
      ? '<div class="tr-avatar"><img src="' + m.image + '" alt="' + m.name + '" onerror="this.parentNode.style.background=\'' + getInitialsColor(m.name) + '\';this.outerHTML=\'' + getInitials(m.name) + '\'"></div>'
      : '<div class="tr-avatar" style="background:' + getInitialsColor(m.name) + '">' + getInitials(m.name) + '</div>';

    var skillsHtml = (m.skills || []).slice(0, 3).map(function (s) {
      return '<span class="tr-skill">' + s + '</span>';
    }).join('');

    return '<div class="table-row member-row">' +
      avatarHtml +
      '<div class="tr-name">' + m.name + '</div>' +
      '<div class="tr-role">' + m.role + '</div>' +
      '<div class="tr-skills">' + skillsHtml + '</div>' +
      '<div class="tr-actions">' +
        '<button class="tr-btn" onclick="editMember(\'' + m.id + '\')"><i class="fas fa-pen"></i></button>' +
        '<button class="tr-btn danger" onclick="confirmDelete(\'member\',\'' + m.id + '\')"><i class="fas fa-trash"></i></button>' +
      '</div>' +
    '</div>';
  }).join('');
}

document.getElementById('memberSearch').addEventListener('input', renderMemberTable);

// ============================================================
// MEMBERS — DRAWER
// ============================================================
var memberDrawer = document.getElementById('memberDrawer');
var drawerOverlay = document.getElementById('drawerOverlay');

function openMemberDrawer(id) {
  editingMemberId = id;
  photoData = null;
  document.getElementById('memberForm').reset();
  resetPhotoUI();
  document.getElementById('mEditId').value = id || '';
  document.getElementById('drawerTitle').textContent = id ? 'Edit Member' : 'Add Member';
  document.getElementById('mSaveBtn').textContent = id ? 'Update Member' : 'Save Member';

  if (id) {
    var m = getMembers().find(function (x) { return x.id === id; });
    if (m) {
      document.getElementById('mName').value = m.name || '';
      document.getElementById('mRole').value = m.role || '';
      document.getElementById('mBio').value = m.bio || '';
      document.getElementById('mSkills').value = (m.skills || []).join(', ');
      document.getElementById('mGithub').value = (m.social && m.social.github) || '';
      document.getElementById('mLinkedin').value = (m.social && m.social.linkedin) || '';
      document.getElementById('mTwitter').value = (m.social && m.social.twitter) || '';
      document.getElementById('mWebsite').value = (m.social && m.social.website) || '';
      if (m.image) { photoData = m.image; setPhotoPreview(m.image); }
    }
  }

  memberDrawer.classList.add('active');
  drawerOverlay.classList.add('active');
}

function closeMemberDrawer() {
  memberDrawer.classList.remove('active');
  drawerOverlay.classList.remove('active');
  editingMemberId = null;
}

document.getElementById('drawerClose').addEventListener('click', closeMemberDrawer);
document.getElementById('drawerCancel').addEventListener('click', closeMemberDrawer);

drawerOverlay.addEventListener('click', function () {
  closeMemberDrawer();
  closeProjectDrawer();
});

// Photo
document.getElementById('photoBtn').addEventListener('click', function () {
  document.getElementById('photoInput').click();
});
document.getElementById('photoPreview').addEventListener('click', function () {
  document.getElementById('photoInput').click();
});
document.getElementById('photoInput').addEventListener('change', function (e) {
  var file = e.target.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { adminToast('Image too large (max 10MB)', 'error'); return; }
  var reader = new FileReader();
  reader.onload = function (ev) { photoData = ev.target.result; setPhotoPreview(photoData); };
  reader.readAsDataURL(file);
});
document.getElementById('photoRemove').addEventListener('click', function () {
  photoData = null;
  resetPhotoUI();
});

function setPhotoPreview(src) {
  document.getElementById('photoPreview').innerHTML = '<img src="' + src + '" alt="Preview">';
  document.getElementById('photoRemove').style.display = 'inline-flex';
}
function resetPhotoUI() {
  document.getElementById('photoPreview').innerHTML =
    '<div class="photo-placeholder"><i class="fas fa-camera"></i><span>Upload Photo</span></div>';
  document.getElementById('photoRemove').style.display = 'none';
  document.getElementById('photoInput').value = '';
}

// Save member
document.getElementById('memberForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var members = getMembers();

  if (!editingMemberId && members.length >= MAX_MEMBERS) {
    adminToast('Maximum ' + MAX_MEMBERS + ' members reached', 'error');
    return;
  }

  var member = {
    id: editingMemberId || ('ml-' + Date.now()),
    name: document.getElementById('mName').value.trim(),
    role: document.getElementById('mRole').value.trim(),
    bio: document.getElementById('mBio').value.trim(),
    image: photoData || '',
    skills: document.getElementById('mSkills').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
    social: {
      github: document.getElementById('mGithub').value.trim(),
      linkedin: document.getElementById('mLinkedin').value.trim(),
      twitter: document.getElementById('mTwitter').value.trim(),
      website: document.getElementById('mWebsite').value.trim()
    }
  };

  if (editingMemberId) {
    var idx = members.findIndex(function (m) { return m.id === editingMemberId; });
    if (idx > -1) members[idx] = member;
  } else {
    members.push(member);
  }

  saveMembers(members);
  renderMemberTable();
  closeMemberDrawer();
  adminToast(editingMemberId ? 'Member updated!' : 'Member added!', 'success');
});

window.editMember = function (id) { openMemberDrawer(id); };

// ============================================================
// PROJECTS — TABLE
// ============================================================
function renderProjectTable() {
  var projects = getProjects();
  var search = document.getElementById('projectSearch').value.toLowerCase();
  var filtered = projects.filter(function (p) {
    return p.title.toLowerCase().includes(search);
  });

  document.getElementById('projectBadge').textContent = projects.length;
  document.getElementById('projectCount').textContent =
    filtered.length + ' project' + (filtered.length !== 1 ? 's' : '');

  var rows = document.getElementById('projectRows');
  var empty = document.getElementById('projectEmpty');
  var tableWrap = document.getElementById('projectTableWrap');

  if (!filtered.length) {
    rows.innerHTML = '';
    tableWrap.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  tableWrap.style.display = 'block';
  empty.style.display = 'none';

  rows.innerHTML = filtered.map(function (p) {
    return '<div class="table-row project-row">' +
      '<div class="tr-name">' + p.title + '</div>' +
      '<div class="tr-role">' + (p.category || '—') + '</div>' +
      '<div><span class="tr-badge badge-' + (p.status || 'draft') + '">' + (p.status || 'Draft') + '</span></div>' +
      '<div class="tr-actions">' +
        '<button class="tr-btn" onclick="editProject(\'' + p.id + '\')"><i class="fas fa-pen"></i></button>' +
        '<button class="tr-btn danger" onclick="confirmDelete(\'project\',\'' + p.id + '\')"><i class="fas fa-trash"></i></button>' +
      '</div>' +
    '</div>';
  }).join('');
}

document.getElementById('projectSearch').addEventListener('input', renderProjectTable);

// ============================================================
// PROJECTS — DRAWER
// ============================================================
var projectDrawer = document.getElementById('projectDrawer');

function openProjectDrawer(id) {
  editingProjectId = id;
  document.getElementById('projectForm').reset();
  document.getElementById('pEditId').value = id || '';
  document.getElementById('pDrawerTitle').textContent = id ? 'Edit Project' : 'Add Project';
  document.getElementById('pSaveBtn').textContent = id ? 'Update Project' : 'Save Project';

  if (id) {
    var p = getProjects().find(function (x) { return x.id === id; });
    if (p) {
      document.getElementById('pTitle').value = p.title || '';
      document.getElementById('pCategory').value = p.category || 'web';
      document.getElementById('pStatus').value = p.status || 'draft';
      document.getElementById('pDesc').value = p.description || '';
      document.getElementById('pTech').value = (p.tech || []).join(', ');
      document.getElementById('pUrl').value = p.url || '';
    }
  }

  projectDrawer.classList.add('active');
  drawerOverlay.classList.add('active');
}

function closeProjectDrawer() {
  projectDrawer.classList.remove('active');
  drawerOverlay.classList.remove('active');
  editingProjectId = null;
}

document.getElementById('pDrawerClose').addEventListener('click', closeProjectDrawer);
document.getElementById('pDrawerCancel').addEventListener('click', closeProjectDrawer);

document.getElementById('projectForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var projects = getProjects();
  var project = {
    id: editingProjectId || ('mlp-' + Date.now()),
    title: document.getElementById('pTitle').value.trim(),
    category: document.getElementById('pCategory').value,
    status: document.getElementById('pStatus').value,
    description: document.getElementById('pDesc').value.trim(),
    tech: document.getElementById('pTech').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
    url: document.getElementById('pUrl').value.trim()
  };

  if (editingProjectId) {
    var idx = projects.findIndex(function (p) { return p.id === editingProjectId; });
    if (idx > -1) projects[idx] = project;
  } else {
    projects.push(project);
  }

  saveProjects(projects);
  renderProjectTable();
  closeProjectDrawer();
  adminToast(editingProjectId ? 'Project updated!' : 'Project added!', 'success');
});

window.editProject = function (id) { openProjectDrawer(id); };

// ============================================================
// CONFIRM DELETE
// ============================================================
window.confirmDelete = function (type, id) {
  deleteTarget = { type: type, id: id };
  document.getElementById('confirmOverlay').classList.add('show');
};

document.getElementById('confirmNo').addEventListener('click', function () {
  document.getElementById('confirmOverlay').classList.remove('show');
  deleteTarget = null;
});

document.getElementById('confirmYes').addEventListener('click', function () {
  if (!deleteTarget) return;
  if (deleteTarget.type === 'member') {
    saveMembers(getMembers().filter(function (m) { return m.id !== deleteTarget.id; }));
    renderMemberTable();
    adminToast('Member deleted', 'success');
  } else {
    saveProjects(getProjects().filter(function (p) { return p.id !== deleteTarget.id; }));
    renderProjectTable();
    adminToast('Project deleted', 'success');
  }
  document.getElementById('confirmOverlay').classList.remove('show');
  deleteTarget = null;
});