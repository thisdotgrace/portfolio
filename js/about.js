(function () {
  'use strict';

  const panels = document.querySelectorAll('[data-cv-panel]');
  const status = document.getElementById('cv-status');
  const arrows = document.querySelectorAll('[data-cv-direction]');

  if (!panels.length || !status || !arrows.length) return;

  const pinLiftDuration = 180;
  const paperDuration = 320;
  const pinSettleDuration = 180;
  let currentPage = 1;
  let isChanging = false;

  const getPanel = pageNumber => [...panels]
    .find(panel => Number(panel.dataset.cvPanel) === pageNumber);

  const nextPage = direction => {
    const pageNumber = currentPage + direction;
    return pageNumber < 1 ? panels.length : pageNumber > panels.length ? 1 : pageNumber;
  };

  function showPage(pageNumber, direction) {
    if (isChanging || pageNumber === currentPage) return;

    const outgoing = getPanel(currentPage);
    const incoming = getPanel(pageNumber);
    if (!outgoing || !incoming) return;

    isChanging = true;
    const movement = direction || (pageNumber > currentPage ? 'next' : 'prev');
    const outgoingPin = outgoing.querySelector('.cv-paper-pin');
    const incomingPin = incoming.querySelector('.cv-paper-pin');

    outgoingPin?.classList.add('cv-pin--lifting');

    setTimeout(() => {
      incoming.hidden = false;
      outgoing.classList.add('cv-paper--leaving', `cv-paper--${movement}`);
      incoming.classList.add('cv-paper--entering', `cv-paper--${movement}`);
      incomingPin?.classList.add('cv-pin--landing');
    }, pinLiftDuration);

    setTimeout(() => {
      incomingPin?.classList.remove('cv-pin--landing');
    }, pinLiftDuration + paperDuration);

    setTimeout(() => {
      outgoing.hidden = true;
      outgoing.classList.remove('cv-paper--active', 'cv-paper--leaving', `cv-paper--${movement}`);
      incoming.classList.remove('cv-paper--entering', `cv-paper--${movement}`);
      incoming.classList.add('cv-paper--active');
      outgoingPin?.classList.remove('cv-pin--lifting');
      isChanging = false;
    }, pinLiftDuration + paperDuration + pinSettleDuration);

    currentPage = pageNumber;
    status.textContent = `Page ${currentPage} of ${panels.length}`;
  }

  arrows.forEach(arrow => {
    arrow.addEventListener('click', () => {
      const direction = arrow.dataset.cvDirection === 'next' ? 1 : -1;
      showPage(nextPage(direction), direction === 1 ? 'next' : 'prev');
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (!event.target.closest('.cv-paper')) return;
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    showPage(nextPage(direction), direction === 1 ? 'next' : 'prev');
  });
})();
