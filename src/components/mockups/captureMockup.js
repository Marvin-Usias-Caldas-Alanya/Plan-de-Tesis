import { toPng } from 'html-to-image';

/**
 * Convierte un nodo DOM visible en PNG y lo descarga.
 * @param {HTMLElement} node
 * @param {string} fileName
 */
export async function captureMockupAsPng(node, fileName) {
  if (!node) return;

  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#0a0e12',
  });

  const link = document.createElement('a');
  link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  link.href = dataUrl;
  link.click();
}

export function printMockupsGallery() {
  window.print();
}
