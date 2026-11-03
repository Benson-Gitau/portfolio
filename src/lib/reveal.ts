/**
 * Reveals: a rise of 12px and a fade over 400ms as content enters the viewport.
 * Content is visible by default. Only elements still below the fold are hidden, only
 * by this running script, and they are revealed well before they reach the eye line,
 * so scrolling never meets a blank gap or a half-loaded heading.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduced && 'IntersectionObserver' in window) {
  const show = (el: HTMLElement, delay: number) => {
    if (delay) el.style.transitionDelay = `${delay}ms`;
    el.dataset.rv = 'in';
    window.setTimeout(() => {
      delete el.dataset.rv;
      el.style.removeProperty('transition-delay');
    }, delay + 600);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      let index = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        // Passed by an anchor jump: show at once.
        const passed = entry.boundingClientRect.bottom < 0;
        show(el, passed ? 0 : Math.min(index++, 3) * 60);
      }
    },
    // Fires slightly before the element enters, so the fade is under way as it arrives.
    { rootMargin: '1000000px 0px 10% 0px' },
  );

  document.querySelectorAll<HTMLElement>('main [data-reveal]').forEach((el) => {
    if (el.getBoundingClientRect().top <= window.innerHeight * 1.1) return;
    el.dataset.rv = 'out';
    observer.observe(el);
  });

  window.addEventListener('beforeprint', () => {
    document.querySelectorAll<HTMLElement>('[data-rv]').forEach((el) => delete el.dataset.rv);
  });
}

export {};
