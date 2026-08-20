(function () {
  'use strict';

  const overlay = document.getElementById('noteModalOverlay');
  const modal = document.getElementById('noteModal');
  const modalBody = document.getElementById('modalBody');
  const modalPreview = document.getElementById('modalPreview');
  const modalPinSlot = document.getElementById('modalPinSlot');
  const closeButton = document.getElementById('modalClose');
  const notes = document.querySelectorAll('.notes-grid .post-it-note');

  if (!overlay || !modal || !modalBody || !modalPreview || !modalPinSlot || !closeButton) return;

  let activeNotePin = null;
  let lastTrigger = null;
  let flyDX = 0;
  let flyDY = 0;
  let isOpen = false;

  const noteColors = new Set([
    'note-yellow', 'note-pink', 'note-blue', 'note-green',
    'note-orange', 'note-gold', 'note-purple', 'note-greenyellow'
  ]);

  const getColorClass = note => [...note.classList]
    .find(className => noteColors.has(className));

  function populateModal(note) {
    modalBody.innerHTML = '';
    const title = note.querySelector('h3');
    const description = note.querySelector('p');
    const stickers = note.querySelector('.note-stickers');

    const heading = document.createElement('h3');
    heading.id = 'noteModalTitle';
    heading.textContent = title?.textContent.trim() || 'Project';
    modalPreview.alt = title ? `${heading.textContent} preview` : 'Project preview';
    modalBody.appendChild(heading);

    const paragraph = document.createElement('p');
    paragraph.textContent = description?.textContent.trim() || 'More details coming soon!';
    modalBody.appendChild(paragraph);

    if (stickers) modalBody.appendChild(stickers.cloneNode(true));
  }

  function openModal(note) {
    if (isOpen) return;
    const pin = note.querySelector(':scope > .pin');
    if (!pin) return;

    modal.className = 'note-modal';
    const colorClass = getColorClass(note);
    if (colorClass) modal.classList.add(colorClass);
    populateModal(note);

    pin.style.opacity = '0';
    activeNotePin = pin;
    lastTrigger = note;
    isOpen = true;

    const startRect = pin.getBoundingClientRect();
    const targetRect = modalPinSlot.getBoundingClientRect();
    flyDX = startRect.left + startRect.width / 2 - (targetRect.left + targetRect.width / 2);
    flyDY = startRect.top + startRect.height / 2 - (targetRect.top + targetRect.height / 2);

    overlay.classList.add('open');
    overlay.classList.remove('closing');
    overlay.setAttribute('aria-hidden', 'false');
    modalPinSlot.style.transition = 'none';
    modalPinSlot.style.opacity = '0';
    modalPinSlot.style.transform = `translate(${flyDX}px, ${flyDY}px) scale(0.75)`;
    void modalPinSlot.offsetWidth;

    requestAnimationFrame(() => {
      overlay.classList.add('visible');
      modalPinSlot.style.transition = 'transform 420ms cubic-bezier(.22,.85,.3,1.25), opacity 200ms ease';
      modalPinSlot.style.transform = 'translate(0, 0) scale(1)';
      modalPinSlot.style.opacity = '1';
    });

    document.addEventListener('keydown', handleKeydown);
    closeButton.focus();
  }

  function closeModal() {
    if (!isOpen) return;

    modalPinSlot.style.transition = 'transform 420ms cubic-bezier(.4,0,.2,1)';
    modalPinSlot.style.transform = 'translateY(40px)';
    modalPinSlot.style.opacity = '1';

    const pinToRestore = activeNotePin;
    const triggerToRestore = lastTrigger;
    let closeStarted = false;

    const finish = () => {
      modalPinSlot.removeEventListener('transitionend', handleTransitionEnd);
      overlay.classList.remove('visible', 'open');
      overlay.setAttribute('aria-hidden', 'true');
      if (pinToRestore) pinToRestore.style.opacity = '';
      triggerToRestore?.focus();
    };

    const startClose = () => {
      if (closeStarted) return;
      closeStarted = true;
      overlay.classList.add('closing');
      setTimeout(finish, 340);
    };

    function handleTransitionEnd(event) {
      if (event.target === modalPinSlot && event.propertyName === 'transform') startClose();
    }

    modalPinSlot.addEventListener('transitionend', handleTransitionEnd);
    setTimeout(() => {
      if (overlay.classList.contains('open')) startClose();
    }, 500);

    document.removeEventListener('keydown', handleKeydown);
    activeNotePin = null;
    lastTrigger = null;
    isOpen = false;
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') closeModal();
  }

  notes.forEach(note => {
    note.setAttribute('tabindex', '0');
    note.setAttribute('role', 'button');
    const title = note.querySelector('h3');
    note.setAttribute('aria-label', `View details for ${title?.textContent.trim() || 'project note'}`);
    note.addEventListener('click', () => openModal(note));
    note.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openModal(note);
    });

    note.querySelector('.note-stickers')?.addEventListener('click', event => event.stopPropagation());
  });

  overlay.addEventListener('click', event => {
    if (event.target === overlay) closeModal();
  });
  closeButton.addEventListener('click', closeModal);
})();
