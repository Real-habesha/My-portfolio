// ===========================
// BACKGROUND CANVAS — mixed grid + particles + glow orbs
// ===========================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, mouseX = 0, mouseY = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// particles
const particles = Array.from({ length: 55 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  r: Math.random() * 1.5 + 0.3,
  vx: (Math.random() - 0.5) * 0.18,
  vy: (Math.random() - 0.5) * 0.18,
  alpha: Math.random() * 0.5 + 0.1,
  color: Math.random() > 0.6 ? '#00ff9d' : Math.random() > 0.5 ? '#7b5ea7' : '#4466ff'
}));

// orbs
const orbs = [
  { x: 0.15, y: 0.2, r: 280, color: 'rgba(0,255,157,0.055)' },
  { x: 0.82, y: 0.75, r: 320, color: 'rgba(123,94,167,0.07)' },
  { x: 0.5, y: 0.5, r: 200, color: 'rgba(30,80,255,0.04)' },
];

let frameCount = 0;

function drawBG() {
  ctx.clearRect(0, 0, W, H);

  // orbs
  orbs.forEach(o => {
    const grd = ctx.createRadialGradient(o.x * W, o.y * H, 0, o.x * W, o.y * H, o.r);
    grd.addColorStop(0, o.color);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(o.x * W, o.y * H, o.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // mouse glow
  const mgrd = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 180);
  mgrd.addColorStop(0, 'rgba(0,255,157,0.045)');
  mgrd.addColorStop(1, 'transparent');
  ctx.fillStyle = mgrd;
  ctx.beginPath();
  ctx.arc(mouseX, mouseY, 180, 0, Math.PI * 2);
  ctx.fill();

  // grid
  const spacing = 60;
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // particles
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  frameCount++;
  requestAnimationFrame(drawBG);
}

drawBG();

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ===========================
// ROBOT EYE TRACKING
// ===========================
const leftPupil = document.getElementById('left-pupil');
const leftInner = document.getElementById('left-pupil-inner');
const rightPupil = document.getElementById('right-pupil');
const rightInner = document.getElementById('right-pupil-inner');
const robotSvg = document.getElementById('robot-svg');

// eye socket centers in SVG coords
const LEFT_EYE_CENTER  = { x: 122, y: 92 };
const RIGHT_EYE_CENTER = { x: 178, y: 92 };
const EYE_RANGE = 5; // max pixel movement inside socket

function trackEyes(e) {
  const rect = robotSvg.getBoundingClientRect();

  // robot center in screen coords
  const robotCX = rect.left + rect.width / 2;
  const robotCY = rect.top + rect.height / 2;

  // direction from robot center to cursor
  const dx = e.clientX - robotCX;
  const dy = e.clientY - robotCY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  const nx = dx / dist;
  const ny = dy / dist;

  const lx = LEFT_EYE_CENTER.x  + nx * EYE_RANGE;
  const ly = LEFT_EYE_CENTER.y  + ny * EYE_RANGE;
  const rx = RIGHT_EYE_CENTER.x + nx * EYE_RANGE;
  const ry = RIGHT_EYE_CENTER.y + ny * EYE_RANGE;

  leftPupil.setAttribute('cx', lx);
  leftPupil.setAttribute('cy', ly);
  leftInner.setAttribute('cx', lx);
  leftInner.setAttribute('cy', ly);

  rightPupil.setAttribute('cx', rx);
  rightPupil.setAttribute('cy', ry);
  rightInner.setAttribute('cx', rx);
  rightInner.setAttribute('cy', ry);
}

window.addEventListener('mousemove', trackEyes);

// touch support
window.addEventListener('touchmove', e => {
  trackEyes(e.touches[0]);
}, { passive: true });

// ===========================
// TYPING ANIMATION
// ===========================
const phrases = [
  "Hi, I'm Amanuel Abeje.",
  "I write code that works.",
  "Hi, I'm Amanuel Abeje.",
];

const el = document.getElementById('typed-text');
let phraseIndex = 0, charIndex = 0, isDeleting = false, isPaused = false;

function type() {
  const current = phrases[phraseIndex];

  if (isPaused) { setTimeout(type, 1500); isPaused = false; return; }

  if (!isDeleting) {
    el.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) { isPaused = true; isDeleting = true; }
    setTimeout(type, 75);
  } else {
    el.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      if (phraseIndex === 0) { el.textContent = phrases[0]; return; }
    }
    setTimeout(type, 38);
  }
}

window.addEventListener('load', () => setTimeout(type, 900));

// ===========================
// SCROLL REVEAL
// ===========================
const revealEls = document.querySelectorAll(
  '.fact-card, .skill-item, .project-card, .contact-card, .about-text, .about-facts, .section-title, .section-label, .contact-intro'
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = Array.from(revealEls).indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), 70 * (idx % 7));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));

// ===========================
// NAVBAR
// ===========================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.background = window.scrollY > 50
    ? 'rgba(8,8,15,0.97)'
    : 'rgba(8,8,15,0.8)';
});

// ===========================
// MOBILE MENU
// ===========================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
document.querySelectorAll('.mob-link').forEach(l => l.addEventListener('click', () => mobileMenu.classList.remove('open')));

// ===========================
// ACTIVE NAV HIGHLIGHT
// ===========================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 120) current = sec.id; });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--accent)' : '';
  });
});
