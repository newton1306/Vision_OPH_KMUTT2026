// Vision Workshop Suite - Main Menu Controller
(function () {
  'use strict';

  let isActivated = false;
  let initialMousePos = null;
  const MOVE_THRESHOLD = 5; // Pixels to distinguish true mouse movement from initial placement

  function activateMenu() {
    if (isActivated) return;
    isActivated = true;
    document.body.classList.add('active-menu');
  }

  // Detect mouse movement to blur background and show options
  window.addEventListener('mousemove', (e) => {
    if (isActivated) return;
    if (!initialMousePos) {
      initialMousePos = { x: e.clientX, y: e.clientY };
      return;
    }
    const dist = Math.hypot(e.clientX - initialMousePos.x, e.clientY - initialMousePos.y);
    if (dist > MOVE_THRESHOLD) {
      activateMenu();
    }
  });

  // Also activate on click or key press for instant responsiveness
  window.addEventListener('mousedown', () => activateMenu());
  window.addEventListener('keydown', (e) => {
    // Check Alt + C for authorized supervisor exit (supports physical KeyC, uppercase, lowercase, and Thai layout)
    const isKeyC = e.code === 'KeyC' || e.key === 'c' || e.key === 'C' || e.key === 'แ' || e.key === 'ฉ';
    if (e.altKey && isKeyC) {
      e.preventDefault();
      if (window.electronAPI && window.electronAPI.forceQuit) {
        window.electronAPI.forceQuit();
      }
      return;
    }

    if (!isActivated) {
      activateMenu();
      return;
    }

    // Keyboard navigation between the 2 cards
    const fruitCard = document.querySelector('.fruit-card');
    const cvCard = document.querySelector('.cv-card');
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      cvCard.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      fruitCard.focus();
    } else if (e.key === 'Enter') {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.dataset && activeEl.dataset.app) {
        launchApp(activeEl.dataset.app);
      }
    }
  });

  // Launch target app
  function launchApp(appId) {
    if (window.electronAPI && window.electronAPI.switchMode) {
      window.electronAPI.switchMode(appId);
    } else {
      console.log(`[MENU] Launching ${appId}`);
    }
  }

  // Wire card click listeners
  const cards = document.querySelectorAll('.menu-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const appId = card.getAttribute('data-app');
      if (appId) {
        launchApp(appId);
      }
    });
  });
})();
