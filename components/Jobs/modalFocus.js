export const trapModalFocus = (event, root) => {
  if (event.key !== "Tab" || !root) return;
  const items = Array.from(root.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter((element) => !element.hidden && !element.disabled);
  const first = items[0];
  const last = items[items.length - 1];
  if (!first) { event.preventDefault(); root.focus(); return; }
  if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
    event.preventDefault(); first.focus();
  }
};

export const restoreModalFocus = (element) => {
  if (element?.isConnected !== false && !element?.disabled) element?.focus?.();
};
