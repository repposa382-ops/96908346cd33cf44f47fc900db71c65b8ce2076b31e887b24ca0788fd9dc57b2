'use strict';

// ── Screens ──────────────────────────────────────────────────
const screens = {
  main:          document.getElementById('screen-main'),
  notifications: document.getElementById('screen-notifications'),
  document:      document.getElementById('screen-document'),
  pdf:           document.getElementById('screen-pdf'),
  services:      document.getElementById('screen-services'),
  vacancies:     document.getElementById('screen-vacancies'),
  menu:          document.getElementById('screen-menu'),
};

let current  = 'main';
let previous = null;

function navigateTo(name) {
  if (!screens[name] || name === current) return;
  screens[current].classList.remove('active');
  screens[name].classList.add('active');
  previous = current;
  current  = name;
  window.scrollTo(0, 0);

  // Update navbar active state
  document.querySelectorAll('.nav-item[data-screen]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === name);
  });
}

function goBack() { navigateTo(previous || 'main'); }

// ── Navbar ───────────────────────────────────────────────────
document.querySelectorAll('.nav-item[data-screen]').forEach(btn =>
  btn.addEventListener('click', () => navigateTo(btn.dataset.screen))
);

// ── Back buttons ─────────────────────────────────────────────
document.querySelectorAll('[data-back]').forEach(btn =>
  btn.addEventListener('click', goBack)
);

// ── Notifications button ─────────────────────────────────────
document.getElementById('btn-notifications')
  .addEventListener('click', () => navigateTo('notifications'));

// ── FAB ──────────────────────────────────────────────────────
const fab        = document.getElementById('fab-btn');
const fabOptions = document.getElementById('fab-options');
const fabOverlay = document.getElementById('fab-overlay');

function openFab() {
  fabOptions.classList.remove('hidden');
  fabOverlay.classList.remove('hidden');
  fab.classList.add('open');
}
function closeFab() {
  fabOptions.classList.add('hidden');
  fabOverlay.classList.add('hidden');
  fab.classList.remove('open');
}

fab.addEventListener('click', () => {
  fabOptions.classList.contains('hidden') ? openFab() : closeFab();
});
fabOverlay.addEventListener('click', closeFab);

document.getElementById('fab-view-doc').addEventListener('click', () => {
  closeFab(); navigateTo('document');
});
document.getElementById('fab-gen-pdf').addEventListener('click', () => {
  closeFab(); navigateTo('pdf');
});
document.getElementById('fab-update').addEventListener('click', () => {
  closeFab(); showToast('Дані оновлено з реєстру Оберіг');
});

// ── Menu items ───────────────────────────────────────────────
document.getElementById('menu-doc')
  .addEventListener('click', () => navigateTo('document'));
document.getElementById('menu-pdf')
  .addEventListener('click', () => navigateTo('pdf'));
document.getElementById('menu-notif')
  .addEventListener('click', () => navigateTo('notifications'));

// ── Doc → PDF ────────────────────────────────────────────────
document.getElementById('doc-pdf-btn')
  .addEventListener('click', () => navigateTo('pdf'));


// ── Generate PDF ─────────────────────────────────────────────
const genBtn  = document.getElementById('generate-pdf-btn');
const progress = document.getElementById('pdf-progress');
const fill    = document.getElementById('progress-fill');
const ptext   = document.getElementById('progress-text');

const steps = [
  [25,  'Отримання даних з реєстру...'],
  [50,  'Формування документа...'],
  [75,  'Генерація QR-коду...'],
  [100, 'Готово!'],
];

genBtn.addEventListener('click', () => {
  if (genBtn.disabled) return;
  genBtn.disabled = true;
  progress.classList.remove('hidden');
  fill.style.width = '0%';
  let i = 0;
  const iv = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(iv);
      setTimeout(() => {
        genBtn.disabled = false;
        progress.classList.add('hidden');
        showToast('PDF успішно згенеровано!');
      }, 500);
      return;
    }
    fill.style.width  = steps[i][0] + '%';
    ptext.textContent = steps[i][1];
    i++;
  }, 800);
});



// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(8px);
    background:#222;color:#fff;padding:12px 22px;border-radius:12px;
    font-size:14px;font-weight:600;white-space:nowrap;z-index:9999;
    opacity:0;transition:opacity .25s,transform .25s;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, 2500);
}

// ── Update ticker time ────────────────────────────────────────
function updateTickerTime() {
  const now = new Date();
  // Вычитаем 3 часа 47 минут 21 секунду
  now.setHours(now.getHours() - 3);
  now.setMinutes(now.getMinutes() - 47);
  now.setSeconds(now.getSeconds() - 21);
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  
  const timeStr = `${hours}:${minutes} | ${day}.${month}.${year}`;
  
  // Обновляем всі ticker'и на странице
  document.querySelectorAll('.ticker-inner').forEach(ticker => {
    ticker.innerHTML = `Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp; Документ оновлено о ${timeStr} •&nbsp;`;
  });
}

// Обновляем при загрузке
updateTickerTime();

// ── Service worker ────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  );
}

// ── PIN ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const pinScreen = document.getElementById("screen-pin");
  const dots = document.querySelectorAll(".pin-dot");
  const numButtons = document.querySelectorAll(".num-btn");
  const backspaceBtn = document.getElementById("pin-backspace");
  const faceIdBtn = document.getElementById("pin-faceid");
  const forgotBtn = document.getElementById("pin-forgot");

  let currentPin = "";

  // Функция разблокировки
function unlockApp() {
  if (!pinScreen) return;
  
  // 1. Показываем основной контейнер приложения, удаляя класс 'hidden'
  const appContainer = document.getElementById("app");
  if (appContainer) {
    appContainer.classList.remove("hidden");
  }
  
  // Включаем CSS-анимацию растворения для ПИН-экрана
  pinScreen.classList.add("unlocked");
  
  // Через 300мс полностью убираем блок из разметки, чтобы открыть главный экран
  setTimeout(() => {
    pinScreen.style.setProperty("display", "none", "important");
  }, 300);
}

  function updateDots() {
    dots.forEach((dot, index) => {
      if (index < currentPin.length) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  // Клики по цифрам
  numButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPin.length < 4) {
        currentPin += button.getAttribute("data-value");
        updateDots();

        if (currentPin.length === 4) {
          unlockApp();
        }
      }
    });
  });

  // Клик по крестику (стереть)
  if (backspaceBtn) {
    backspaceBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPin.length > 0) {
        currentPin = currentPin.slice(0, -1);
        updateDots();
      }
    });
  }

  // Быстрый вход через FaceID / кнопку "Не пам'ятаю"
  if (faceIdBtn) {
    faceIdBtn.addEventListener("click", (e) => {
      e.preventDefault();
      unlockApp();
    });
  }

  if (forgotBtn) {
    forgotBtn.addEventListener("click", (e) => {
      e.preventDefault();
      unlockApp();
    });
  }
});