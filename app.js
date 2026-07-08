'use strict';

// ── Screens ──────────────────────────────────────────────────
const screens = {
  main:          document.getElementById('screen-main'),
  notifications: document.getElementById('screen-notifications'),
  document:      document.getElementById('screen-document'),
  services:      document.getElementById('screen-services'),
  vacancies:     document.getElementById('screen-vacancies'),
  menu:          document.getElementById('screen-menu'),
};

let current  = 'main';
let previous = null;
window.lastTickerTimeStr = "";

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
  const tickerWrapper = document.querySelector('#document-scroll-container .update-ticker');

if (tickerWrapper) {
  const tickerInner = tickerWrapper.querySelector('.ticker-inner');
  
  if (tickerInner) {
    // Создаем чистую копию элемента
    const newTickerInner = document.createElement('div');
    newTickerInner.className = tickerInner.className; 
    newTickerInner.innerHTML = tickerInner.innerHTML; 
    
    // Перезаписываем HTML, чтобы сбросить внутренний ступор браузера
    tickerWrapper.innerHTML = '';
    tickerWrapper.appendChild(newTickerInner);
  }
}
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
  
  window.lastTickerTimeStr = timeStr;
  // Обновляем тикеры на странице
  const repeatingText = `Документ оновлено о ${timeStr} •&nbsp; `.repeat(16);
  document.querySelectorAll('.ticker-inner').forEach(ticker => {
    ticker.innerHTML = repeatingText;
  });

  return timeStr; 
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

    // Таймер на 45 секунд
    setTimeout(() => {
      // !!! КРИТИЧЕСКИЙ ШАГ: Находим тикеры ЗАНОВО, так как старые могли быть удалены при переоткрытии шторки
      const freshTickers = document.querySelectorAll('.ticker-inner');
      const freshUpdateTickers = document.querySelectorAll('.update-ticker');

      // Возвращаем стандартный цвет фона
      freshUpdateTickers.forEach(ticker => {
        ticker.classList.remove('ticker-updating');
      });

      // Формируем актуальное время окончания
      const exactNow = new Date(); 
      const cleanTimeStr = formatCleanDate(exactNow);
      window.lastTickerTimeStr = cleanTimeStr;
      const finalLines = `Документ оновлено о ${cleanTimeStr} •&nbsp; `.repeat(16);

      // Записываем финальный текст в РЕАЛЬНО существующие элементы
      freshTickers.forEach(ticker => {
        ticker.classList.remove('ticker-updating');
        ticker.innerHTML = finalLines;
      });

      isUpdating = false;
    }, 45000);
  });
}

initFabUpdate();

function initCardFlip() {
  const card = document.getElementById('main-card');
  if (!card) return;

  card.addEventListener('click', (event) => {
    // Список классов и ID, клик по которым НЕ должен переворачивать карту
    const isFabClick = event.target.closest('#fab-options') || 
                       event.target.closest('.fab-btn') || 
                       event.target.closest('#fab-btn') || // Исключаем сам плюс
                       event.target.closest('.action-fab') || // Исключаем класс плюса
                       event.target.closest('.fab-opt-item') ||
                       event.target.closest('.update-ticker');

    // Если кликнули на элемент FAB или тикер — выходим из функции
    if (isFabClick) return;
    
    // В противном случае — переворачиваем карту
    card.classList.toggle('flipped');
  });
}

initCardFlip();

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

// Логика свайпа шторки вниз
const docSheet = document.getElementById('document-sheet');
const dragZone = document.getElementById('document-drag-zone');

let startY = 0;
let currentY = 0;
let isDragging = false;

// Слушатели для тач-событий
dragZone.addEventListener('touchstart', dragStart, { passive: true });
dragZone.addEventListener('touchmove', dragMove, { passive: false });
dragZone.addEventListener('touchend', dragEnd);

// Поддержка десктопной мыши
dragZone.addEventListener('mousedown', dragStart);
window.addEventListener('mousemove', dragMove);
window.addEventListener('mouseup', dragEnd);

function dragStart(e) {
  startY = e.touches ? e.touches[0].clientY : e.clientY;
  isDragging = true;
  docSheet.style.transition = 'none';
}

function dragMove(e) {
  if (!isDragging) return;
  
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const deltaY = clientY - startY;
  
  if (deltaY > 0) {
    if (e.cancelable) e.preventDefault();
    docSheet.style.transform = `translateY(${deltaY}px)`;
    currentY = deltaY;
  }
}

function dragEnd() {
  if (!isDragging) return;
  isDragging = false;
  docSheet.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
  
  if (currentY > 140) {
    // Анимация ухода вниз
    docSheet.style.transform = 'translateY(100%)';
    setTimeout(() => {
      // Клик по кнопке назад вашего приложения для очистки роутинга
      const backBtn = docSheet.querySelector('[data-back]');
      if (backBtn) {
        backBtn.click();
      } else {
        document.getElementById('screen-document').style.display = 'none';
      }
      docSheet.style.transform = 'translateY(0px)';
    }, 300);
  } else {
    // Возврат шторки на место
    docSheet.style.transform = 'translateY(0px)';
  }
  currentY = 0;
}

function initPdfViewer() {
  const pdfViewer = document.getElementById('pdf-viewer');
  const pdfGeneratedDate = document.getElementById('pdf-generated-date');

  document.addEventListener('click', (event) => {
    const target = event.target.closest('#fab-gen-pdf');
    
    if (target) {
      event.stopPropagation();
      event.preventDefault();

      // 1. Закрываем FAB-меню
      if (typeof closeFab === 'function') {
        closeFab();
      }

      // 2. БЕРЕМ ДАННЫЕ ИЗ ГЛОБАЛЬНОЙ ПЕРЕМЕННОЙ
      if (pdfGeneratedDate) {
        // Если переменная пустая (вдруг не успела рассчитаться), берем текущее время как запасной вариант
        const finalTime = window.lastTickerTimeStr || formatCleanDate(new Date());
        pdfGeneratedDate.innerHTML = `Сформовано: ${finalTime}`;
      }

      // 3. Открываем PDF экран
      if (pdfViewer) {
        pdfViewer.classList.add('active');
      }
    }
  });

  // Кнопка закрытия Done
  const pdfCloseBtn = document.getElementById('pdf-close-btn');
  if (pdfCloseBtn) {
    pdfCloseBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (pdfViewer) pdfViewer.classList.remove('active');
    });
  }
}

initPdfViewer();