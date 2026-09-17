const frame = document.querySelector('#terminal-test-frame');
const loadingMessage = document.querySelector('#loading-message');

frame.addEventListener('load', () => {
  try {
    const frameDocument = frame.contentDocument;
    if (!frameDocument?.head) throw new Error('Terminal preview is unavailable.');

    frameDocument.documentElement.classList.add('terminal-test-variant');
    const stylesheet = frameDocument.createElement('link');
    stylesheet.rel = 'stylesheet';
    const stylesheetUrl = new URL('/prototype-ui-test/terminal-test.css', window.location.origin);
    stylesheetUrl.searchParams.set('variant', 'subtle-colors-v3');
    stylesheet.href = stylesheetUrl.href;
    stylesheet.dataset.terminalTestStyles = 'true';
    stylesheet.addEventListener('load', () => {
      document.body.classList.add('is-ready');
      frame.contentWindow.focus();
    }, { once: true });
    stylesheet.addEventListener('error', () => showError('The test stylesheet could not be loaded.'), { once: true });
    frameDocument.head.append(stylesheet);
  } catch (error) {
    showError(error.message);
  }
});

function showError(message) {
  loadingMessage.textContent = `${message} Open this preview through the Vite development server.`;
  document.body.classList.add('has-error');
}
