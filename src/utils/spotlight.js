/**
 * Updates CSS custom properties (--spot-x, --spot-y) on the hovered card
 * for a subtle GPU-friendly cursor spotlight without React re-renders.
 */
export function handleSpotlightMove(e) {
  const el = e.currentTarget;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
  el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
}
