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

// ===== EmailJS =====
emailjs.init('ikJRYjhBaT2c3Buc2');
var EMAILJS_SERVICE = 'service_pb4rcpk';
var EMAILJS_TEMPLATE = 'template_vibta1q';


// ===== Typing Animation =====
var typeWords = ['developers', 'designers', 'engineers', 'problem solvers', 'builders'];
var wordIndex = 0, charIndex = 0, deleting = false;
var typeEl = document.getElementById('typeText');

function type() {
  if (!typeEl) return;
  var word = typeWords[wordIndex];
  typeEl.textContent = deleting ? word.slice(0, charIndex--) : word.slice(0, charIndex++);
  if (!deleting && charIndex > word.length) { deleting = true; setTimeout(type, 1400); return; }
  if (deleting && charIndex < 0) { deleting = false; wordIndex = (wordIndex + 1) % typeWords.length; }
  setTimeout(type, deleting ? 50 : 90);
}
type();

// ===== Hero Canvas =====
(function () {
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w, h;
  var COLORS = ['#c8d400', '#f97316', '#dc2626', '#2a8a8a', '#3ab8b8'];

  function resize() {
    w = canvas.width = canvas.clientWidth * dpr;
    h = canvas.height = canvas.clientHeight * dpr;
  }
  resize();
  window.addEventListener('resize', resize);

  var dots = [];
  for (var i = 0; i < 55; i++) {
    dots.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  var mx = w / 2, my = h / 2;
  window.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mx = (e.clientX - rect.left) * dpr;
    my = (e.clientY - rect.top) * dpr;
  });

  function draw() {
    ctx.clearRect(0, 0, w, h);
    var bg = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.5, h * 0.5, w * 0.8);
    bg.addColorStop(0, 'rgba(200,212,0,0.04)');
    bg.addColorStop(0.5, 'rgba(249,115,22,0.03)');
    bg.addColorStop(1, 'rgba(11,11,14,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0) d.x = w; if (d.x > w) d.x = 0;
      if (d.y < 0) d.y = h; if (d.y > h) d.y = 0;
      var dx = mx - d.x, dy = my - d.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 160 * dpr) { d.x += dx * 0.012; d.y += dy * 0.012; }
    }

    for (var i = 0; i < dots.length; i++) {
      for (var j = i + 1; j < dots.length; j++) {
        var dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var maxDist = 140 * dpr;
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = 'rgba(249,115,22,' + ((1 - dist / maxDist) * 0.12) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var alphaHex = Math.round(d.alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * dpr, 0, Math.PI * 2);
      ctx.fillStyle = d.color + alphaHex;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== Scroll Progress =====
var progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', function () {
  var pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  if (progressBar) progressBar.style.width = pct + '%';
});

// ===== Navbar =====
var navbar = document.getElementById('navbar');
var navToggle = document.getElementById('navToggle');
var navLinksEl = document.getElementById('navLinks');

window.addEventListener('scroll', function () {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveLink();
});

navToggle.addEventListener('click', function () {
  navToggle.classList.toggle('active');
  navLinksEl.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(function (link) {
  link.addEventListener('click', function () {
    navToggle.classList.remove('active');
    navLinksEl.classList.remove('active');
  });
});

function updateActiveLink() {
  var sections = document.querySelectorAll('section[id]');
  var current = '';
  sections.forEach(function (s) { if (window.scrollY >= s.offsetTop - 110) current = s.id; });
  document.querySelectorAll('.nav-link').forEach(function (l) {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
}

// ===== Reveal =====
var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

// ===== Counter =====
function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(function (el) {
    var target = parseInt(el.dataset.count);
    var current = 0;
    var inc = target / (1800 / 16);
    function tick() {
      current += inc;
      if (current < target) { el.textContent = Math.floor(current); requestAnimationFrame(tick); }
      else el.textContent = target;
    }
    tick();
  });
}
var heroObs = new IntersectionObserver(function (entries) {
  if (entries[0].isIntersecting) { animateCounters(); heroObs.disconnect(); }
}, { threshold: 0.4 });
var heroSection = document.querySelector('.hero');
if (heroSection) heroObs.observe(heroSection);

// ===== Members from Firestore =====
function getInitialsColor(name) {
  var hues = [16, 25, 160, 200, 270, 340];
  var hash = 0;
  for (var i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return 'hsl(' + hues[Math.abs(hash) % hues.length] + ',70%,35%)';
}

function getInitials(name) {
  return name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
}

function renderMembers(members) {
  var grid = document.getElementById('membersGrid');
  var empty = document.getElementById('membersEmpty');

  if (!members.length) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  grid.style.display = 'grid';
  empty.style.display = 'none';

  grid.innerHTML = members.map(function (m, i) {
    var imgHtml = m.image
      ? '<img src="' + m.image + '" alt="' + m.name + '">'
      : '<div class="member-initials-avatar" style="background:' + getInitialsColor(m.name) + '">' + getInitials(m.name) + '</div>';

    var skillsHtml = (m.skills || []).slice(0, 4).map(function (s) {
      return '<span class="skill-tag">' + s + '</span>';
    }).join('');
    if ((m.skills || []).length > 4) skillsHtml += '<span class="skill-tag">+' + (m.skills.length - 4) + '</span>';

    var socialHtml = '';
    if (m.social) {
      if (m.social.github) socialHtml += '<a href="' + m.social.github + '" target="_blank" rel="noopener" onclick="event.stopPropagation()"><i class="fab fa-github"></i></a>';
      if (m.social.linkedin) socialHtml += '<a href="' + m.social.linkedin + '" target="_blank" rel="noopener" onclick="event.stopPropagation()"><i class="fab fa-linkedin-in"></i></a>';
      if (m.social.twitter) socialHtml += '<a href="' + m.social.twitter + '" target="_blank" rel="noopener" onclick="event.stopPropagation()"><i class="fab fa-twitter"></i></a>';
      if (m.social.website) socialHtml += '<a href="' + m.social.website + '" target="_blank" rel="noopener" onclick="event.stopPropagation()"><i class="fas fa-globe"></i></a>';
    }

    return '<div class="member-card" data-id="' + m.id + '" style="animation-delay:' + (i * 0.08) + 's">' +
      '<div class="member-img-wrap">' + imgHtml + '<div class="member-img-overlay"></div>' +
      '<span class="member-role-badge">' + m.role + '</span></div>' +
      '<div class="member-info">' +
        '<h3 class="member-name">' + m.name + '</h3>' +
        '<p class="member-role">' + m.role + '</p>' +
        '<p class="member-bio">' + m.bio + '</p>' +
        '<div class="member-skills">' + skillsHtml + '</div>' +
      '</div>' +
      '<div class="member-social">' + socialHtml + '</div>' +
    '</div>';
  }).join('');

  grid.querySelectorAll('.member-card').forEach(function (card) {
    card.addEventListener('click', function () { openModal(card.dataset.id, members); });
  });
}

function loadMembers() {
  db.collection('members').orderBy('createdAt').get().then(function (snapshot) {
    var members = [];
    snapshot.forEach(function (doc) {
      members.push(Object.assign({ id: doc.id }, doc.data()));
    });
    renderMembers(members);
  }).catch(function () {
    renderMembers([]);
  });
}

// ===== Modal =====
var modal = document.getElementById('memberModal');
var modalBody = document.getElementById('modalBody');
var modalClose = document.getElementById('modalClose');

function openModal(id, members) {
  var m = members.find(function (x) { return x.id === id; });
  if (!m) return;

  var imgHtml = m.image
    ? '<img src="' + m.image + '" alt="' + m.name + '">'
    : '<div class="member-initials-avatar" style="background:' + getInitialsColor(m.name) + ';height:190px;border-radius:0;font-size:3rem">' + getInitials(m.name) + '</div>';

  var avatarHtml = m.image
    ? '<img src="' + m.image + '" alt="' + m.name + '">'
    : '<div class="member-initials-avatar" style="background:' + getInitialsColor(m.name) + ';height:100%">' + getInitials(m.name) + '</div>';

  var skillsHtml = (m.skills || []).map(function (s) { return '<span class="modal-skill">' + s + '</span>'; }).join('');

  var linksHtml = '';
  if (m.social) {
    if (m.social.github) linksHtml += '<a href="' + m.social.github + '" target="_blank" rel="noopener" class="modal-link"><i class="fab fa-github"></i> GitHub</a>';
    if (m.social.linkedin) linksHtml += '<a href="' + m.social.linkedin + '" target="_blank" rel="noopener" class="modal-link"><i class="fab fa-linkedin-in"></i> LinkedIn</a>';
    if (m.social.twitter) linksHtml += '<a href="' + m.social.twitter + '" target="_blank" rel="noopener" class="modal-link"><i class="fab fa-twitter"></i> Twitter</a>';
    if (m.social.website) linksHtml += '<a href="' + m.social.website + '" target="_blank" rel="noopener" class="modal-link"><i class="fas fa-globe"></i> Website</a>';
  }

  modalBody.innerHTML =
    '<div class="modal-header">' + imgHtml +
    '<div class="modal-header-overlay"></div>' +
    '<div class="modal-avatar">' + avatarHtml + '</div></div>' +
    '<div class="modal-info">' +
      '<h2 class="modal-name">' + m.name + '</h2>' +
      '<p class="modal-role">' + m.role + '</p>' +
      '<p class="modal-bio">' + m.bio + '</p>' +
      '<div class="modal-section"><h4>Skills</h4><div class="modal-skills">' + skillsHtml + '</div></div>' +
      '<div class="modal-section"><h4>Connect</h4><div class="modal-links">' + linksHtml + '</div></div>' +
    '</div>';

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() { modal.classList.remove('active'); document.body.style.overflow = ''; }
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', function (e) {
  if (e.target === modal || e.target.classList.contains('modal-backdrop')) closeModal();
});
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

// ===== Contact Form =====
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var btn = document.getElementById('submitBtn');
  var original = btn.innerHTML;
  btn.innerHTML = '<span>Sending\u2026</span><i class="fas fa-spinner fa-spin"></i>';
  btn.disabled = true;

  emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    name: document.getElementById('fname').value,
    time: new Date().toLocaleString(),
    message:
      'Email: ' + document.getElementById('femail').value + '\n' +
      'Inquiry: ' + document.getElementById('finquiry').value + '\n\n' +
      document.getElementById('fmessage').value
  }).then(function () {
    showToast('Message sent! We\'ll get back to you soon.');
    document.getElementById('contactForm').reset();
  }, function () {
    showToast('Something went wrong. Please try again.');
  }).then(function () {
    btn.innerHTML = original;
    btn.disabled = false;
  });
});

// ===== Toast =====
function showToast(msg) {
  var toast = document.getElementById('toast');
  toast.querySelector('.toast-message').textContent = msg;
  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, 3500);
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', function () {
  loadMembers();
});
