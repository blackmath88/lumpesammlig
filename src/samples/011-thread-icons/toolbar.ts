/**
 * 011 — Thread Icons: the toolbar and specimen behaviour.
 *
 * Native buttons carry every interaction. The stitched icons are static SVG
 * <use> instances; state is expressed with attributes and CSS. Nothing
 * animates on its own.
 */

export function mountThreadIcons(root: HTMLElement): () => void {
  const surface = root.querySelector<HTMLButtonElement>('[data-surface-toggle]');
  const tools = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tool]'));
  const upload = root.querySelector<HTMLButtonElement>('[data-upload]');
  const status = root.querySelector<HTMLElement>('[data-tool-status]');
  const enlargeInputs = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="enlarge-icon"]'));
  const enlarged = root.querySelector<SVGUseElement>('[data-enlarged-use]');
  const enlargedLabel = root.querySelector<HTMLElement>('[data-enlarged-label]');

  const say = (text: string) => {
    if (status && status.textContent !== text) status.textContent = text;
  };

  const onSurface = () => {
    if (!surface) return;
    const dark = root.dataset.surface !== 'dark';
    root.dataset.surface = dark ? 'dark' : 'light';
    surface.setAttribute('aria-pressed', String(dark));
  };

  const onTool = (event: Event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const pressed = button.getAttribute('aria-pressed') === 'true';
    for (const other of tools) other.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-pressed', String(!pressed));
    const name = button.querySelector('.vh')?.textContent ?? button.dataset.tool ?? 'tool';
    say(pressed ? `${name} deselected.` : `${name} selected.`);
  };

  const onUpload = () => {
    if (!upload) return;
    // The state changes now. The badge may animate briefly; the change does not wait for it.
    const done = upload.dataset.state === 'done';
    upload.dataset.state = done ? 'idle' : 'done';
    say(done ? 'Simulated upload reset.' : 'Simulated upload complete. Nothing was sent.');
  };

  const onEnlarge = () => {
    const picked = enlargeInputs.find((i) => i.checked);
    if (!picked || !enlarged) return;
    enlarged.setAttribute('href', `#ti-${picked.value}-detail`);
    if (enlargedLabel) enlargedLabel.textContent = picked.dataset.label ?? picked.value;
  };

  surface?.addEventListener('click', onSurface);
  for (const tool of tools) tool.addEventListener('click', onTool);
  upload?.addEventListener('click', onUpload);
  for (const input of enlargeInputs) input.addEventListener('change', onEnlarge);

  const dispose = () => {
    surface?.removeEventListener('click', onSurface);
    for (const tool of tools) tool.removeEventListener('click', onTool);
    upload?.removeEventListener('click', onUpload);
    for (const input of enlargeInputs) input.removeEventListener('change', onEnlarge);
    window.removeEventListener('pagehide', dispose);
  };
  window.addEventListener('pagehide', dispose);
  return dispose;
}
