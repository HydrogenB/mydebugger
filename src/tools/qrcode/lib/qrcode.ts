/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { jsPDF } from 'jspdf';

export type QRDownloadFormat = 'png' | 'svg' | 'pdf';

export const blobToDataURL = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to read blob'));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export const convertPngToPdf = async (png: Blob): Promise<Blob> => {
  const dataUrl = await blobToDataURL(png);
  const img = new Image();
  const loaded = new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('Image load error'));
  });
  img.src = dataUrl;
  await loaded;
  // eslint-disable-next-line new-cap
  const pdf = new jsPDF({ unit: 'pt', format: [img.width, img.height] });
  pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
  return pdf.output('blob');
};
