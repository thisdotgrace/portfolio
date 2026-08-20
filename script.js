(function () {
  'use strict';

  /* -----------------------------------------------------
     MOBILE NAV TOGGLE
  ----------------------------------------------------- */
  const navBtn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (navBtn && nav) {
    navBtn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      navBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* -----------------------------------------------------
     ABOUT PAGE CV PAGER
  ----------------------------------------------------- */
  const cvPanels = document.querySelectorAll('[data-cv-panel]');
  const cvStatus = document.getElementById('cv-status');
  const cvArrows = document.querySelectorAll('[data-cv-direction]');

  if (cvPanels.length && cvStatus && cvArrows.length) {
    const cvPinLiftDuration = 180;
    const cvPaperDuration = 320;
    const cvPinSettleDuration = 180;
    let currentCvPage = 1;
    let isCvChanging = false;

    function nextCvPage(direction) {
      const pageNumber = currentCvPage + direction;
      return pageNumber < 1 ? cvPanels.length : pageNumber > cvPanels.length ? 1 : pageNumber;
    }

    function showCvPage(pageNumber, direction) {
      if (isCvChanging || pageNumber === currentCvPage) return;

      const outgoing = [...cvPanels].find(panel => Number(panel.dataset.cvPanel) === currentCvPage);
      const incoming = [...cvPanels].find(panel => Number(panel.dataset.cvPanel) === pageNumber);
      if (!outgoing || !incoming) return;

      isCvChanging = true;
      const movement = direction || (pageNumber > currentCvPage ? 'next' : 'prev');
      const outgoingPin = outgoing.querySelector('.cv-paper-pin');
      const incomingPin = incoming.querySelector('.cv-paper-pin');

      if (outgoingPin) outgoingPin.classList.add('cv-pin--lifting');

      setTimeout(() => {
        incoming.hidden = false;
        outgoing.classList.add('cv-paper--leaving', `cv-paper--${movement}`);
        incoming.classList.add('cv-paper--entering', `cv-paper--${movement}`);

        if (incomingPin) {
          incomingPin.classList.add('cv-pin--landing');
        }
      }, cvPinLiftDuration);

      setTimeout(() => {
        if (incomingPin) incomingPin.classList.remove('cv-pin--landing');
      }, cvPinLiftDuration + cvPaperDuration);

      setTimeout(() => {
        outgoing.hidden = true;
        outgoing.classList.remove('cv-paper--active', 'cv-paper--leaving', `cv-paper--${movement}`);
        incoming.classList.remove('cv-paper--entering', `cv-paper--${movement}`);
        incoming.classList.add('cv-paper--active');
        if (outgoingPin) outgoingPin.classList.remove('cv-pin--lifting');
        isCvChanging = false;
      }, cvPinLiftDuration + cvPaperDuration + cvPinSettleDuration);

      currentCvPage = pageNumber;
      cvStatus.textContent = `Page ${currentCvPage} of ${cvPanels.length}`;
    }

    cvArrows.forEach(arrow => {
      arrow.addEventListener('click', () => {
        const direction = arrow.dataset.cvDirection === 'next' ? 1 : -1;
        showCvPage(nextCvPage(direction), direction === 1 ? 'next' : 'prev');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (!event.target.closest('.cv-paper')) return;
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      showCvPage(nextCvPage(direction), direction === 1 ? 'next' : 'prev');
    });
  }

  /* -----------------------------------------------------
     PROJECT NOTE -> MODAL (with pin fly-out/fly-back)
  ----------------------------------------------------- */
  const overlay = document.getElementById('noteModalOverlay');
  const modal = document.getElementById('noteModal');
  const modalBody = document.getElementById('modalBody');
  const modalPreview = document.getElementById('modalPreview');
  const modalPinSlot = document.getElementById('modalPinSlot');
  const modalCloseBtn = document.getElementById('modalClose');
  const notes = document.querySelectorAll('.notes-grid .post-it-note');

  let activeNotePin = null;   // the real <div class="pin"> hidden while modal is open
  let lastTrigger = null;     // note that was clicked, so we can restore focus
  let flyDX = 0, flyDY = 0;   // distance from the modal pin's resting spot to the note's pin
  let isModalOpen = false;

  if (overlay && modal && modalBody && modalPreview && modalPinSlot && modalCloseBtn) {

  function colorClassOf(note) {
    return [...note.classList].find(c => c.startsWith('note-') && c !== 'note');
  }

  function populateModal(note) {
    modalBody.innerHTML = '';

    const title = note.querySelector('h3');
    const desc = note.querySelector('p');
    const stickers = note.querySelector('.note-stickers');

    const h3 = document.createElement('h3');
    h3.id = 'noteModalTitle';
    h3.textContent = title ? title.textContent.trim() : 'Project';
    modalPreview.alt = title ? `${title.textContent.trim()} preview` : 'Project preview';
    modalBody.appendChild(h3);

    const p = document.createElement('p');
    p.textContent = desc ? desc.textContent.trim() : 'More details coming soon!';
    modalBody.appendChild(p);

    if (stickers) {
      modalBody.appendChild(stickers.cloneNode(true));
    }
  }

  function openModal(note) {
    if (isModalOpen) return;

    const pin = note.querySelector(':scope > .pin');
    if (!pin) return;

    // Reset any previous colour, then apply this note's colour
    modal.className = 'note-modal';
    const colorClass = colorClassOf(note);
    if (colorClass) modal.classList.add(colorClass);

    populateModal(note);

    // Hide the note's own pin - it's "moving" to the modal
    pin.style.opacity = '0';
    activeNotePin = pin;
    lastTrigger = note;
    isModalOpen = true;

    // Measure the note pin's position BEFORE the modal is shown
    const startRect = pin.getBoundingClientRect();
    const startCenter = {
      x: startRect.left + startRect.width / 2,
      y: startRect.top + startRect.height / 2
    };

    overlay.classList.add('open');
    overlay.classList.remove('closing');
    overlay.setAttribute('aria-hidden', 'false');

    const targetRect = modalPinSlot.getBoundingClientRect();
    const targetCenter = {
      x: targetRect.left + targetRect.width / 2,
      y: targetRect.top + targetRect.height / 2
    };

    flyDX = startCenter.x - targetCenter.x;
    flyDY = startCenter.y - targetCenter.y;

    // Snap the pin instantly to where the note's pin was, with no transition
    modalPinSlot.style.transition = 'none';
    modalPinSlot.style.opacity = '0';
    modalPinSlot.style.transform = `translate(${flyDX}px, ${flyDY}px) scale(0.75)`;
    void modalPinSlot.offsetWidth; // reflow

    requestAnimationFrame(() => {
      overlay.classList.add('visible');
      modalPinSlot.style.transition = 'transform 420ms cubic-bezier(.22,.85,.3,1.25), opacity 200ms ease';
      modalPinSlot.style.transform = 'translate(0, 0) scale(1)';
      modalPinSlot.style.opacity = '1';
    });

    document.addEventListener('keydown', onKeydown);
    modalCloseBtn.focus();
  }

  function closeModal() {
    if (!isModalOpen) return;

    // Drop the pin first; the modal closes after the pin reaches its lower position.
    modalPinSlot.style.transition = 'transform 420ms cubic-bezier(.4,0,.2,1)';
    modalPinSlot.style.transform = 'translateY(40px)';
    modalPinSlot.style.opacity = '1';

    const pinToRestore = activeNotePin;
    const triggerToRestore = lastTrigger;
    let modalCloseStarted = false;

    const finish = () => {
      modalPinSlot.removeEventListener('transitionend', onTransitionEnd);
      overlay.classList.remove('visible');
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      if (pinToRestore) pinToRestore.style.opacity = '';
      if (triggerToRestore) triggerToRestore.focus();
    };

    const startModalClose = () => {
      if (modalCloseStarted) return;
      modalCloseStarted = true;
      overlay.classList.add('closing');
      setTimeout(finish, 340);
    };

    function onTransitionEnd(e) {
      if (e.target !== modalPinSlot || e.propertyName !== 'transform') return;
      startModalClose();
    }
    modalPinSlot.addEventListener('transitionend', onTransitionEnd);
    // Safety net in case the pin transition does not fire.
    setTimeout(() => {
      if (overlay.classList.contains('open')) startModalClose();
    }, 500);

    document.removeEventListener('keydown', onKeydown);
    activeNotePin = null;
    lastTrigger = null;
    isModalOpen = false;
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeModal();
  }

  notes.forEach(note => {
    note.setAttribute('tabindex', '0');
    note.setAttribute('role', 'button');
    const titleText = note.querySelector('h3') ? note.querySelector('h3').textContent.trim() : 'project note';
    note.setAttribute('aria-label', `View details for ${titleText}`);

    note.addEventListener('click', () => openModal(note));
    note.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(note);
      }
    });

    // Let sticker links work without also popping the modal open
    const stickers = note.querySelector('.note-stickers');
    if (stickers) {
      stickers.addEventListener('click', (e) => e.stopPropagation());
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  modalCloseBtn.addEventListener('click', closeModal);

  }

  /* -----------------------------------------------------
     POLAROID: click multiple times OR drag to shake,
     swapping the photo once it's shaken enough
  ----------------------------------------------------- */
  const polaroid = document.querySelector('.polaroid');
  const polaroidImg = document.querySelector('.polaroid-img');

  if (polaroid && polaroidImg) {
    const images = (polaroidImg.dataset.images || polaroidImg.src)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    let imgIndex = 0;
    let shaking = false;

    function swapImage() {
      polaroidImg.classList.add('swapping');
      setTimeout(() => {
        imgIndex = (imgIndex + 1) % images.length;
        const next = images[imgIndex];
        // If an alt image is missing, fall back to the first image instead of breaking
        const fallback = images[0];
        polaroidImg.onerror = () => {
          polaroidImg.onerror = null;
          polaroidImg.src = fallback;
        };
        polaroidImg.src = next;
        polaroidImg.classList.remove('swapping');
      }, 150);
    }

    function triggerShake() {
      if (shaking) return;
      shaking = true;
      polaroid.classList.add('shaking');
      setTimeout(swapImage, 260);

      const onAnimEnd = (e) => {
        if (e.animationName !== 'polaroid-shake') return;
        polaroid.removeEventListener('animationend', onAnimEnd);
        polaroid.classList.remove('shaking');
        shaking = false;
      };
      polaroid.addEventListener('animationend', onAnimEnd);
    }

    // --- Trigger via rapid clicks ---
    let clickCount = 0;
    let clickTimer = null;
    polaroid.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
      if (clickCount >= 3) {
        clickCount = 0;
        triggerShake();
      }
    });

    // --- Trigger via physical drag wiggle ---
    let dragging = false;
    let lastX = 0;
    let lastDir = 0;
    let reversals = 0;

    polaroid.addEventListener('pointerdown', (e) => {
      dragging = true;
      lastX = e.clientX;
      lastDir = 0;
      reversals = 0;
      try { polaroid.setPointerCapture(e.pointerId); } catch (err) { /* no-op */ }
    });

    polaroid.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      if (Math.abs(dx) > 10) {
        const dir = dx > 0 ? 1 : -1;
        if (lastDir !== 0 && dir !== lastDir) {
          reversals++;
          if (reversals >= 3) {
            reversals = 0;
            dragging = false;
            triggerShake();
          }
        }
        lastDir = dir;
        lastX = e.clientX;
      }
    });

    const endDrag = () => { dragging = false; };
    polaroid.addEventListener('pointerup', endDrag);
    polaroid.addEventListener('pointercancel', endDrag);
    polaroid.addEventListener('pointerleave', endDrag);
  }
})();