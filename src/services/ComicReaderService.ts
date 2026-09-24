import JSZip from 'jszip';
import { LoggerService } from './LoggerService';
import type { ComicBook } from '@/types/Comic';

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|bmp)$/i;
const MAX_FILE_SIZE = 900 * 1024 * 1024; // 900MB

export class ComicReaderService {
  static isSupported(file: File): boolean {
    const name = file.name.toLowerCase();
    return (
      name.endsWith('.cbz') ||
      name.endsWith('.zip') ||
      name.endsWith('.pdf') ||
      IMAGE_EXT.test(name)
    );
  }

  static async loadComic(files: File[], onProgress?: (p: number) => void): Promise<ComicBook> {
    if (files.length === 0) throw new Error('Sin archivos.');
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        throw new Error(`"${f.name}" supera 900MB.`);
      }
    }

    // Varias imágenes sueltas (o una sola) -> cómic de imágenes
    if (files.length > 1 || IMAGE_EXT.test(files[0].name)) {
      const ordered = [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      const pages = ordered.map((f) => URL.createObjectURL(f));
      LoggerService.info('Comic', `${ordered.length} imágenes sueltas`);
      return { title: ordered[0].name.replace(/\.[^.]+$/, ''), pages, format: 'images' };
    }

    const file = files[0];
    const name = file.name.toLowerCase();
    if (name.endsWith('.cbz') || name.endsWith('.zip')) return this.loadCbz(file);
    if (name.endsWith('.pdf')) return this.loadPdf(file, onProgress);
    throw new Error(`Formato no soportado: ${file.name}. Usa CBZ, PDF o imágenes.`);
  }

  private static async loadCbz(file: File): Promise<ComicBook> {
    const end = LoggerService.start('Comic', `CBZ ${file.name}`);
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const names = Object.keys(zip.files).filter(
      (n) => IMAGE_EXT.test(n) && !n.includes('__MACOSX') && !n.endsWith('/'),
    );
    if (names.length === 0) throw new Error(`"${file.name}" no contiene imágenes.`);
    names.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const pages: string[] = [];
    for (const n of names) {
      const blob = await zip.file(n)!.async('blob');
      pages.push(URL.createObjectURL(new Blob([blob], { type: this.mimeFor(n) })));
    }
    LoggerService.info('Comic', `CBZ ${file.name}: ${pages.length} páginas`);
    end();
    return { title: file.name.replace(/\.(cbz|zip)$/i, ''), pages, format: 'cbz' };
  }

  private static async loadPdf(file: File, onProgress?: (p: number) => void): Promise<ComicBook> {
    const end = LoggerService.start('Comic', `PDF ${file.name}`);
    const { pdfjs } = await import('react-pdf');
    // Worker local (public/pdf.worker.min.mjs vía postinstall): funciona sin internet.
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas no disponible.');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error(`Página ${i} sin imagen`))), 'image/png');
      });
      pages.push(URL.createObjectURL(blob));
      onProgress?.((i / pdf.numPages) * 100);
    }
    LoggerService.info('Comic', `PDF ${file.name}: ${pages.length} páginas`);
    end();
    return { title: file.name.replace(/\.pdf$/i, ''), pages, format: 'pdf' };
  }

  static revokeComic(book: ComicBook | null): void {
    book?.pages.forEach((u) => URL.revokeObjectURL(u));
  }

  private static mimeFor(name: string): string {
    const n = name.toLowerCase();
    if (n.endsWith('.png')) return 'image/png';
    if (n.endsWith('.webp')) return 'image/webp';
    if (n.endsWith('.gif')) return 'image/gif';
    if (n.endsWith('.avif')) return 'image/avif';
    if (n.endsWith('.bmp')) return 'image/bmp';
    return 'image/jpeg';
  }
}
