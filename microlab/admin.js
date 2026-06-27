'use strict';

// ===== Firebase =====
var firebaseConfig = {
  apiKey: "AIzaSyDv9NLCcWMu--g9YRsHdfteH8Ekm_9kdN4",
  authDomain: "microlabb.firebaseapp.com",
  projectId: "microlabb",
  storageBucket: "microlabb.firebasestorage.app",
  messagingSenderId: "916155789810",
  appId: "1:916155789810:web:4c6b99643e2d6d653abb6b",
  measurementId: "G-FQ3D9HCGJ9"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// ===== Credentials =====
var ADMIN_EMAIL = 'microlab.community@gmail.com';
var ADMIN_PASSWORD = '$microlab2026';
var MAX_MEMBERS = 15;

// ===== State =====
var currentPanel = 'members';
var editingMemberId = null;
var editingProjectId = null;
var deleteTarget = null;
var photoData = null;
var allMembers = [];
var allProjects = [];

// ============================================================
// FLUID CANVAS
// ============================================================
(function initCanvas() {
  var canvas = document.getElementById('fluidCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w, h;

  function resize() {
    w = canvas.width = canvas.clientWidth * dpr;
    h = canvas.height = canvas.clientHeight * dpr;
  }
  resize();
  window.addEventListener('resize', resize);

  var blobs = [
    { x:0.2, y:0.3, r:0.45, color:'#c8d400', speed:0.00018, phase:0 },
    { x:0.8, y:0.6, r:0.5,  color:'#f97316', speed:0.00013, phase:2.1 },
    { x:0.5, y:0.8, r:0.4,  color:'#dc2626', speed:0.00021, phase:4.2 },
    { x:0.15,y:0.75,r:0.35, color:'#3ab8b8', speed:0.00016, phase:1.1 }
  ];

  var particles = [];
  for (var i = 0; i < 100; i++) {
    particles.push({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0002,
      vy: (Math.random() - 0.5) * 0.0002 - 0.00005,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.25 + 0.05,
      color: ['#c8d400','#f97316','#3ab8b8','#ffffff'][Math.floor(Math.random() * 4)]
    });
  }

  var t = 0;
  function frame() {
    t++;
    ctx.fillStyle = 'rgba(12,12,16,0.2)';
    ctx.fillRect(0, 0, w, h);

    blobs.forEach(function (b) {
      var bx = (b.x + Math.sin(t * b.speed * Math.PI * 2 + b.phase) * 0.2) * w;
      var by = (b.y + Math.cos(t * b.speed * Math.PI * 2 + b.phase * 1.3) * 0.15) * h;
      var br = b.r * Math.min(w, h);
      var g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, b.color + '1a');
      g.addColorStop(0.5, b.color + '0a');
      g.addColorStop(1, b.color + '00');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });

    particles.forEach(function (p) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
      var alpha = Math.round(p.alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.r * dpr, 0, Math.PI * 2);
      ctx.fillStyle = p.color + alpha;
      ctx.fill();
    });

    var vig = ctx.createRadialGradient(w/2, h/2, w*0.2, w/2, h/2, w*0.75);
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
  lBtnLabel.textContent = 'Authenticating\u2026';
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
// DASHBOARD
// ============================================================
function initDashboard() {
  loadMembers();
  loadProjects();

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
// MEMBERS — LOAD & RENDER
// ============================================================
function loadMembers() {
  db.collection('members').orderBy('createdAt').get().then(function (snapshot) {
    allMembers = [];
    snapshot.forEach(function (doc) {
      allMembers.push(Object.assign({ id: doc.id }, doc.data()));
    });
    renderMemberTable();
  }).catch(function (err) {
    adminToast('Failed to load members', 'error');
  });
}

function renderMemberTable() {
  var search = document.getElementById('memberSearch').value.toLowerCase();
  var filtered = allMembers.filter(function (m) {
    return m.name.toLowerCase().includes(search) || m.role.toLowerCase().includes(search);
  });

  document.getElementById('memberBadge').textContent = allMembers.length;
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
      ? '<div class="tr-avatar"><img src="' + m.image + '" alt="' + m.name + '"></div>'
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
  document.getElementById('mImage').value = '';
  document.getElementById('mEditId').value = id || '';
  document.getElementById('drawerTitle').textContent = id ? 'Edit Member' : 'Add Member';
  document.getElementById('mSaveBtn').textContent = id ? 'Update Member' : 'Save Member';

  if (id) {
    var m = allMembers.find(function (x) { return x.id === id; });
    if (m) {
      document.getElementById('mName').value = m.name || '';
      document.getElementById('mRole').value = m.role || '';
      document.getElementById('mBio').value = m.bio || '';
      document.getElementById('mSkills').value = (m.skills || []).join(', ');
      document.getElementById('mGithub').value = (m.social && m.social.github) || '';
      document.getElementById('mLinkedin').value = (m.social && m.social.linkedin) || '';
      document.getElementById('mTwitter').value = (m.social && m.social.twitter) || '';
      document.getElementById('mWebsite').value = (m.social && m.social.website) || '';
      document.getElementById('mImage').value = m.image || '';
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


// Save member
document.getElementById('memberForm').addEventListener('submit', function (e) {
  e.preventDefault();

  if (!editingMemberId && allMembers.length >= MAX_MEMBERS) {
    adminToast('Maximum ' + MAX_MEMBERS + ' members reached', 'error');
    return;
  }

  var btn = document.getElementById('mSaveBtn');
  btn.disabled = true;
  btn.textContent = 'Saving\u2026';

  var member = {
    name: document.getElementById('mName').value.trim(),
    role: document.getElementById('mRole').value.trim(),
    bio: document.getElementById('mBio').value.trim(),
    image: document.getElementById('mImage').value.trim(),
    skills: document.getElementById('mSkills').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
    social: {
      github: document.getElementById('mGithub').value.trim(),
      linkedin: document.getElementById('mLinkedin').value.trim(),
      twitter: document.getElementById('mTwitter').value.trim(),
      website: document.getElementById('mWebsite').value.trim()
    }
  };

  var promise;
  if (editingMemberId) {
    promise = db.collection('members').doc(editingMemberId).update(member);
  } else {
    member.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    promise = db.collection('members').add(member);
  }

  promise.then(function () {
    adminToast(editingMemberId ? 'Member updated!' : 'Member added!', 'success');
    closeMemberDrawer();
    loadMembers();
  }).catch(function () {
    adminToast('Something went wrong. Try again.', 'error');
  }).then(function () {
    btn.disabled = false;
    btn.textContent = editingMemberId ? 'Update Member' : 'Save Member';
  });
});

window.editMember = function (id) { openMemberDrawer(id); };

// ============================================================
// PROJECTS — LOAD & RENDER
// ============================================================
function loadProjects() {
  db.collection('projects').orderBy('createdAt').get().then(function (snapshot) {
    allProjects = [];
    snapshot.forEach(function (doc) {
      allProjects.push(Object.assign({ id: doc.id }, doc.data()));
    });
    renderProjectTable();
  }).catch(function () {
    adminToast('Failed to load projects', 'error');
  });
}

function renderProjectTable() {
  var search = document.getElementById('projectSearch').value.toLowerCase();
  var filtered = allProjects.filter(function (p) {
    return p.title.toLowerCase().includes(search);
  });

  document.getElementById('projectBadge').textContent = allProjects.length;
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
      '<div class="tr-role">' + (p.category || '\u2014') + '</div>' +
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
    var p = allProjects.find(function (x) { return x.id === id; });
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

  var btn = document.getElementById('pSaveBtn');
  btn.disabled = true;
  btn.textContent = 'Saving\u2026';

  var project = {
    title: document.getElementById('pTitle').value.trim(),
    category: document.getElementById('pCategory').value,
    status: document.getElementById('pStatus').value,
    description: document.getElementById('pDesc').value.trim(),
    tech: document.getElementById('pTech').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
    url: document.getElementById('pUrl').value.trim()
  };

  var promise;
  if (editingProjectId) {
    promise = db.collection('projects').doc(editingProjectId).update(project);
  } else {
    project.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    promise = db.collection('projects').add(project);
  }

  promise.then(function () {
    adminToast(editingProjectId ? 'Project updated!' : 'Project added!', 'success');
    closeProjectDrawer();
    loadProjects();
  }).catch(function () {
    adminToast('Something went wrong. Try again.', 'error');
  }).then(function () {
    btn.disabled = false;
    btn.textContent = editingProjectId ? 'Update Project' : 'Save Project';
  });
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
  var collection = deleteTarget.type === 'member' ? 'members' : 'projects';
  db.collection(collection).doc(deleteTarget.id).delete().then(function () {
    adminToast((deleteTarget.type === 'member' ? 'Member' : 'Project') + ' deleted', 'success');
    if (deleteTarget.type === 'member') loadMembers();
    else loadProjects();
  }).catch(function () {
    adminToast('Delete failed. Try again.', 'error');
  });
  document.getElementById('confirmOverlay').classList.remove('show');
  deleteTarget = null;
});
