/**
 * © 2026 MyDebugger Contributors – MIT License
 */

// Break text into lines that fit maxWidth; URLs have no spaces, so wrap per character.
export const wrapText = (
  text: string,
  maxWidth: number,
  measure: (s: string) => number,
): string[] => {
  const lines: string[] = [];
  let line = '';
  for (const ch of text) {
    if (line && measure(line + ch) > maxWidth) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
};

// Render the QR image on a white card with the caption underneath, as a PNG blob.
export const renderQrCard = async (qrSrc: string, caption: string): Promise<Blob> => {
  const img = new Image();
  img.src = qrSrc;
  await img.decode();

  const pad = 24;
  const fontSize = 14;
  const lineHeight = 20;
  const width = img.naturalWidth + pad * 2;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const font = `${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.font = font;
  const lines = caption ? wrapText(caption, img.naturalWidth, (s) => ctx.measureText(s).width) : [];
  const textBlock = lines.length ? pad / 2 + lines.length * lineHeight : 0;
  canvas.width = width;
  canvas.height = img.naturalHeight + pad * 2 + textBlock;

  // Resizing the canvas resets context state, so set styles after.
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, pad, pad);
  ctx.font = font;
  ctx.fillStyle = '#6B7280';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const textTop = pad + img.naturalHeight + pad / 2;
  lines.forEach((l, i) => ctx.fillText(l, width / 2, textTop + i * lineHeight));

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encode failed'))), 'image/png');
  });
};
