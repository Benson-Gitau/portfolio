/**
 * Click-to-load YouTube. A `[data-yt]` element holds the youtube-nocookie embed URL; its
 * `[data-yt-play]` button swaps `[data-yt-frame]`'s contents for the iframe. Nothing loads
 * from YouTube before that click, and nothing autoplays without it.
 */
document.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-yt-play]');
  if (!button) return;
  const root = button.closest<HTMLElement>('[data-yt]');
  if (!root) return;
  const src = root.dataset.yt;
  const status = root.querySelector<HTMLElement>('[data-yt-status]');
  if (!src) {
    if (status) status.textContent = 'This video is not available yet.';
    return;
  }
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = root.dataset.ytTitle ?? 'Video';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  const frame = root.querySelector<HTMLElement>('[data-yt-frame]') ?? root;
  frame.replaceChildren(iframe);
  iframe.focus();
});

export {};
