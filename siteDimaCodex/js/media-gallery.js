(() => {
  const galleries = document.querySelectorAll('[data-media-gallery]');

  galleries.forEach((gallery) => {
    const track = gallery.querySelector('.media-gallery-track');
    const slides = Array.from(gallery.querySelectorAll('.media-slide'));
    const prev = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const dots = Array.from(gallery.querySelectorAll('[data-gallery-dot]'));
    let index = 0;

    if (!track || slides.length < 2) return;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = `translateX(${-index * 100}%)`;
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
        dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
      });
    }

    prev?.addEventListener('click', () => show(index - 1));
    next?.addEventListener('click', () => show(index + 1));
    dots.forEach((dot, dotIndex) => dot.addEventListener('click', () => show(dotIndex)));

    show(0);
  });

  const zoomableImages = document.querySelectorAll(
    '.media-gallery img, .media-frame img, .sr-slide img, .pioneer-promo-visual img'
  );

  if (!zoomableImages.length) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'media-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.innerHTML = `
    <button class="media-lightbox-close" type="button" aria-label="Close">x</button>
    <img alt="">
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector('img');
  const closeButton = lightbox.querySelector('.media-lightbox-close');

  function openLightbox(image) {
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    lightboxImage.removeAttribute('src');
  }

  zoomableImages.forEach((image) => {
    image.classList.add('media-zoomable');
    image.addEventListener('click', () => openLightbox(image));
  });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
})();
