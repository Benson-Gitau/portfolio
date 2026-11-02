/**
 * Section reveals, in reading order. Only content still below the fold is hidden, and only
 * by this script once it is running, so a failed script or reduced motion leaves everything
 * visible and nothing already on screen can flicker.
 */
const TARGETS = [
  'main h2',
  'main .statement',
  'main .closing',
  'main .other',
  'main figure',
  'main details',
  'main :is(ul, ol) > li:not(.chip, .ledger li, .tools li, [data-diagram] li)',
].join(',');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduced) {
  const step = window.matchMedia('(min-width: 768px)').matches ? 70 : 40;

  const show = (el: HTMLElement, delay: number) => {
    el.style.transitionDelay = `${delay}ms`;
    el.style.setProperty('--rv-delay', `${delay}ms`);
    el.dataset.rv = 'in';
    window.setTimeout(() => {
      delete el.dataset.rv;
      el.style.removeProperty('transition-delay');
      el.style.removeProperty('--rv-delay');
    }, delay + 900);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      let index = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        // Passed by an anchor jump: show it at once, so scrolling back never finds a gap.
        const passed = entry.boundingClientRect.bottom < 0;
        show(el, passed ? 0 : Math.min(index++, 4) * step);
      }
    },
    // The huge top margin counts everything above the viewport as reached.
    { rootMargin: '1000000px 0px -8% 0px' },
  );

  document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
    if (el.getBoundingClientRect().top <= window.innerHeight) return;
    el.dataset.rv = 'out';
    observer.observe(el);
  });

  window.addEventListener('beforeprint', () => {
    document.querySelectorAll<HTMLElement>('[data-rv]').forEach((el) => delete el.dataset.rv);
  });
}

export {};
