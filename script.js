/* =====================================================================
   1) PARTICULES LUMINEUSES + CŒURS DISCRETS (canvas)
   ===================================================================== */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let width, height;
function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// -- petites particules lumineuses qui flottent doucement --
const PARTICLE_COUNT = window.innerWidth < 600 ? 35 : 65;
const particles = [];

function randomParticleColor() {
  const colors = [
    'rgba(217, 169, 79,',   // or
    'rgba(232, 201, 138,',  // or clair
    'rgba(232, 163, 163,',  // rose
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function createParticle() {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.6 + 0.6,
    baseOpacity: Math.random() * 0.5 + 0.15,
    color: randomParticleColor(),
    vx: (Math.random() - 0.5) * 0.12,
    vy: -Math.random() * 0.18 - 0.03,
    flicker: Math.random() * Math.PI * 2,
  };
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());

// -- cœurs discrets qui apparaissent de temps en temps --
const hearts = [];

function spawnHeart() {
  hearts.push({
    x: Math.random() * width * 0.8 + width * 0.1,
    y: height + 20,
    size: Math.random() * 10 + 10,
    opacity: 0,
    maxOpacity: Math.random() * 0.22 + 0.12,
    vy: -(Math.random() * 0.25 + 0.15),
    drift: (Math.random() - 0.5) * 0.3,
    life: 0,
    fadeIn: true,
  });
}

// un cœur apparaît rarement, jamais en surcharge
setInterval(() => {
  if (hearts.length < 4) spawnHeart();
}, 3200);

function drawHeart(x, y, size, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#e8a3a3';
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
  ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  // particules
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.flicker += 0.02;

    if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;

    const flickerOpacity = p.baseOpacity * (0.7 + 0.3 * Math.sin(p.flicker));
    ctx.beginPath();
    ctx.fillStyle = p.color + flickerOpacity + ')';
    ctx.shadowColor = p.color + '0.8)';
    ctx.shadowBlur = 6;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // cœurs discrets
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    h.y += h.vy;
    h.x += h.drift;
    h.life += 1;

    if (h.fadeIn) {
      h.opacity += 0.004;
      if (h.opacity >= h.maxOpacity) h.fadeIn = false;
    } else if (h.life > 260) {
      h.opacity -= 0.004;
    }

    drawHeart(h.x, h.y, h.size, Math.max(h.opacity, 0));

    if (h.opacity <= 0 && h.life > 260 || h.y < -40) {
      hearts.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}
animate();


/* =====================================================================
   2) RÉVÉLATION PROGRESSIVE DU TEXTE D'ACCUEIL
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const lines = document.querySelectorAll('.line');
  const buttons = document.getElementById('buttons');

  const delays = [500, 2200, 3900]; // apparition douce et espacée
  lines.forEach((line, i) => {
    setTimeout(() => line.classList.add('visible'), delays[i] || 500 * (i + 1));
  });

  setTimeout(() => buttons.classList.add('visible'), 5600);
});


/* =====================================================================
   3) LOGIQUE DES BOUTONS
   ===================================================================== */
const btnOui = document.getElementById('btn-oui');
const btnAttendre = document.getElementById('btn-attendre');
const btnRetour = document.getElementById('btn-retour');
const reponseAttente = document.getElementById('reponse-attente');
const buttonsWrap = document.getElementById('buttons');

const screenIntro = document.getElementById('screen-intro');
const screenFinal = document.getElementById('screen-final');

btnOui.addEventListener('click', () => {
  // 1) fondu de sortie de l'écran d'accueil (reste dans le flux le temps du fondu)
  screenIntro.classList.add('fading');

  setTimeout(() => {
    // 2) on retire l'écran d'accueil du flux, on affiche l'écran final
    screenIntro.classList.remove('active');
    screenFinal.classList.add('active');
    screenFinal.setAttribute('aria-hidden', 'false');

    // 3) double rAF pour laisser le navigateur appliquer opacity:0 avant de déclencher la transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        screenFinal.classList.add('show');
        // remonte en haut de la nouvelle page pour que "Merci..." soit visible
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
      });
    });
  }, 900);
});

btnAttendre.addEventListener('click', () => {
  buttonsWrap.classList.add('fading-out');
  setTimeout(() => {
    buttonsWrap.style.display = 'none';
    reponseAttente.classList.add('visible');
  }, 350);
});

btnRetour.addEventListener('click', () => {
  reponseAttente.classList.remove('visible');
  setTimeout(() => {
    buttonsWrap.style.display = 'flex';
    buttonsWrap.classList.remove('fading-out');
  }, 300);
});