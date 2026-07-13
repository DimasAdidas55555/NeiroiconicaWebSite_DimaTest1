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
})();
