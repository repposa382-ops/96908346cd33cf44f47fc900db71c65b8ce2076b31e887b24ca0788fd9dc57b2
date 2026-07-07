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
function updateTickerTime(baseDate = new Date()) {
  const now = new Date(baseDate);
  const currentHour = now.getHours();
  
  // Вычисляем сдвиг в зависимости от времени суток
  if (currentHour >= 0 && currentHour < 15) {
    now.setHours(now.getHours() - 1);
    now.setMinutes(now.getMinutes() - 23);
  } else {
    now.setHours(now.getHours() - 3);
    now.setMinutes(now.getMinutes() - 47);
    now.setSeconds(now.getSeconds() - 21);
  }
  
  // Передаем измененную дату в общую функцию форматирования
  const timeStr = formatCleanDate(now);
  
  // Обновляем тикеры на странице
  const repeatingText = `Документ оновлено о ${timeStr} •&nbsp; `.repeat(16);
  document.querySelectorAll('.ticker-inner').forEach(ticker => {
    ticker.innerHTML = repeatingText;
  });
}

// Обновляем при загрузке (автоматически возьмет текущее время)
updateTickerTime();

// Переменная-флаг для защиты от повторных кликов
let isUpdating = false;

// Вспомогательная функция, которая просто красиво форматирует любую переданную дату БЕЗ вычитаний
function formatCleanDate(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${hours}:${minutes} | ${day}.${month}.${year}`;
}

function initFabUpdate() {
  // Находим кнопку строго по вашему ID из HTML
  const updateBtn = document.getElementById('fab-update');
  
  if (!updateBtn) {
    console.error("Кнопка с id='fab-update' не найдена в HTML!");
    return;
  }

  updateBtn.addEventListener('click', (event) => {
    // Останавливаем всплытие события, чтобы шторка не думала, что её свайпают
    event.stopPropagation();
    event.preventDefault();
    closeFab();

    if (isUpdating) return;
    isUpdating = true;

    const tickers = document.querySelectorAll('.ticker-inner');
    const updateTickers = document.querySelectorAll('.update-ticker');
    
    // Включаем режим обновления (меняем цвет и текст)
    tickers.forEach(ticker => {
      ticker.classList.add('ticker-updating');
      ticker.innerHTML =` Оновлюємо документ •&nbsp;Оновимо за годину •&nbsp;Дякуємо за терпіння! •&nbsp;`.repeat(7);
    });

    updateTickers.forEach(ticker => {
      ticker.classList.add('ticker-updating');
    });

    // Ждем ровно 1 минуту
    setTimeout(() => {
      // Возвращаем стандартный цвет тикера
      tickers.forEach(ticker => {
        ticker.classList.remove('ticker-updating');
      });
      updateTickers.forEach(ticker => {
      ticker.classList.remove('ticker-updating');

      // Получаем абсолютно чистое время НА МОМЕНТ ЗАВЕРШЕНИЯ
      const exactNow = new Date(); 
      const cleanTimeStr = formatCleanDate(exactNow);

      // Выводим в тикер актуальное время БЕЗ сдвигов
      const finalLines = `Документ оновлено о ${cleanTimeStr} •&nbsp; `.repeat(16);
      tickers.forEach(ticker => {
        ticker.innerHTML = finalLines;
      });
    });

      // Разблокируем кнопку для будущих нажатий
      isUpdating = false;
    }, 45000); // 45 
  });
}

initFabUpdate();

// ── Service worker ────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('/96908346cd33cf44f47fc900db71c65b8ce2076b31e887b24ca0788fd9dc57b2/sw.js').catch(() => {})
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