// Presentation only: question text is always inserted as text, never HTML.
// Unknown or incomplete media is ignored so the question remains usable.
export function renderQuizMedia(root, media) {
  root.replaceChildren();
  root.hidden = true;
  root.parentElement?.classList.remove('has-media');
  if (!media || typeof media !== 'object') return;
  const doc = root.ownerDocument;
  const element = (tag, className, text) => {
    const node = doc.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  };
  let content;
  switch (media.type) {
    case 'image': {
      if (typeof media.src !== 'string' || !media.src.trim()) return;
      let url;
      try { url = new URL(media.src, doc.baseURI); } catch { return; }
      if (!['http:', 'https:'].includes(url.protocol)) return;
      content = element('img', 'quiz-media-image');
      content.alt = typeof media.alt === 'string' ? media.alt : '';
      content.addEventListener('error', () => {
        // Ignore a late load error after the next question has replaced this image.
        if (!root.contains(content)) return;
        root.replaceChildren(element('p', 'quiz-media-text',
          content.alt ? `Imagem indisponível: ${content.alt}` : 'Imagem indisponível.'));
      }, { once: true });
      content.src = url.href;
      break;
    }
    case 'table': {
      if (!Array.isArray(media.columns) || !media.columns.length ||
          !Array.isArray(media.rows) || !media.rows.every(Array.isArray)) return;
      content = element('table', 'quiz-media-table');
      const head = element('thead', '');
      const headings = element('tr', '');
      for (const column of media.columns) {
        const cell = element('th', '', column ?? '');
        cell.scope = 'col';
        headings.append(cell);
      }
      head.append(headings);
      const body = element('tbody', '');
      for (const row of media.rows) {
        const cells = element('tr', '');
        for (let index = 0; index < media.columns.length; index++) {
          cells.append(element('td', '', row[index] ?? ''));
        }
        body.append(cells);
      }
      content.append(head, body);
      break;
    }
    case 'text':
      if (typeof media.content !== 'string') return;
      content = element('p', 'quiz-media-text', media.content);
      break;
    case 'code': {
      if (typeof media.content !== 'string') return;
      content = element('pre', 'quiz-media-code');
      const code = element('code', '', media.content);
      if (typeof media.language === 'string') code.dataset.language = media.language;
      content.append(code);
      break;
    }
    default: return;
  }
  root.append(content);
  root.hidden = false;
  root.parentElement?.classList.add('has-media');
}
