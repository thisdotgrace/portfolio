(function () {
  'use strict';

  const navButton = document.querySelector('.nav-toggle');
  const navigation = document.getElementById('primary-nav');

  if (navButton && navigation) {
    navButton.addEventListener('click', () => {
      const isOpen = navigation.classList.toggle('open');
      navButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const polaroid = document.querySelector('.polaroid');
  const polaroidImage = document.querySelector('.polaroid-img');

  if (!polaroid || !polaroidImage) return;

  const images = (polaroidImage.dataset.images || polaroidImage.src)
    .split(',')
    .map(image => image.trim())
    .filter(Boolean);
  let imageIndex = 0;
  let isShaking = false;

  function swapImage() {
    polaroidImage.classList.add('swapping');
    setTimeout(() => {
      imageIndex = (imageIndex + 1) % images.length;
      const fallback = images[0];
      polaroidImage.onerror = () => {
        polaroidImage.onerror = null;
        polaroidImage.src = fallback;
      };
      polaroidImage.src = images[imageIndex];
      polaroidImage.classList.remove('swapping');
    }, 150);
  }

  function triggerShake() {
    if (isShaking) return;
    isShaking = true;
    polaroid.classList.add('shaking');
    setTimeout(swapImage, 260);

    const finishShake = event => {
      if (event.animationName !== 'polaroid-shake') return;
      polaroid.removeEventListener('animationend', finishShake);
      polaroid.classList.remove('shaking');
      isShaking = false;
    };
    polaroid.addEventListener('animationend', finishShake);
  }

  let clickCount = 0;
  let clickTimer = null;
  polaroid.addEventListener('click', () => {
    clickCount += 1;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
    if (clickCount >= 3) {
      clickCount = 0;
      triggerShake();
    }
  });

  let isDragging = false;
  let lastX = 0;
  let lastDirection = 0;
  let reversals = 0;

  polaroid.addEventListener('pointerdown', event => {
    isDragging = true;
    lastX = event.clientX;
    lastDirection = 0;
    reversals = 0;
    try { polaroid.setPointerCapture(event.pointerId); } catch (error) { /* no-op */ }
  });

  polaroid.addEventListener('pointermove', event => {
    if (!isDragging) return;
    const deltaX = event.clientX - lastX;
    if (Math.abs(deltaX) <= 10) return;

    const direction = deltaX > 0 ? 1 : -1;
    if (lastDirection !== 0 && direction !== lastDirection) {
      reversals += 1;
      if (reversals >= 3) {
        reversals = 0;
        isDragging = false;
        triggerShake();
      }
    }
    lastDirection = direction;
    lastX = event.clientX;
  });

  const endDrag = () => { isDragging = false; };
  polaroid.addEventListener('pointerup', endDrag);
  polaroid.addEventListener('pointercancel', endDrag);
  polaroid.addEventListener('pointerleave', endDrag);
})();
