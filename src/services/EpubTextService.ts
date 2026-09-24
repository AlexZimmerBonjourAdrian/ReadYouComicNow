import JSZip from 'jszip';
import { LoggerService } from './LoggerService';
import type { EpubChapter } from '@/types/Comic';

export interface EpubTextResult {
  title: string;
  chapters: EpubChapter[];
  images: string[];
}

const TEXT_THRESHOLD = 5000;
const DROP_COMFY = 'script,style,link,meta,title,object,embed,audio,video,form,button,input,select,textarea,canvas,noscript,template';
const DROP_FAITHFUL = 'script,meta,title,object,embed,audio,video,form,button,input,select,textarea,canvas,noscript,template';

export class EpubTextService {
  /** Libro de texto (novela) o null si el EPUB es de imágenes (cómic). */
  static async loadTextBook(file: File): Promise<EpubTextResult | null> {
    const end = LoggerService.start('EPUB', `texto ${file.name}`);
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const opfPath = await this.findOpfPath(zip);
    if (!opfPath) return null;
    const opfDir = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';
    const opfFile = zip.file(opfPath);
    if (!opfFile) return null;
    const opf = new DOMParser().parseFromString(await opfFile.async('string'), 'application/xml');

    const title =
      opf.getElementsByTagName('dc:title')[0]?.textContent?.trim() ||
      file.name.replace(/\.epub$/i, '');

    const manifest = new Map<string, { href: string; type: string; props: string }>();
    for (const it of Array.from(opf.getElementsByTagName('item'))) {
      const id = it.getAttribute('id');
      const href = it.getAttribute('href');
      if (id && href) {
        manifest.set(id, {
          href,
          type: it.getAttribute('media-type') ?? '',
          props: it.getAttribute('properties') ?? '',
        });
      }
    }
    const spinePaths = Array.from(opf.getElementsByTagName('itemref'))
      .map((r) => r.getAttribute('idref') ?? '')
      .filter(Boolean)
      .map((id) => this.norm(opfDir + (manifest.get(id)?.href ?? '')))
      .filter((p) => /\.(x?html?)$/i.test(p));

    const raws: { path: string; raw: string }[] = [];
    let textLength = 0;
    for (const p of spinePaths) {
      const f = zip.file(p) ?? zip.file(decodeURIComponent(p));
      if (!f) continue;
      const raw = await f.async('string');
      raws.push({ path: p, raw });
      textLength += raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().length;
    }
    if (textLength < TEXT_THRESHOLD) return null;

    const urlCache = new Map<string, string>();
    const textCache = new Map<string, string>();
    const images: string[] = [];
    const getUrl = async (zipPath: string): Promise<string | null> => {
      const hit = urlCache.get(zipPath);
      if (hit) return hit;
      const f = zip.file(zipPath) ?? zip.file(decodeURIComponent(zipPath));
      if (!f) return null;
      const blob = await f.async('blob');
      const url = URL.createObjectURL(new Blob([blob], { type: this.mimeFor(zipPath) }));
      urlCache.set(zipPath, url);
      images.push(url);
      return url;
    };
    const getText = async (zipPath: string): Promise<string | null> => {
      const hit = textCache.get(zipPath);
      if (hit !== undefined) return hit;
      const f = zip.file(zipPath) ?? zip.file(decodeURIComponent(zipPath));
      if (!f) return null;
      const text = await f.async('string');
      textCache.set(zipPath, text);
      return text;
    };

    const indexByPath = new Map(raws.map((r, i) => [r.path, i]));
    const chapters: EpubChapter[] = [];
    for (let i = 0; i < raws.length; i++) {
      const { path, raw } = raws[i];
      const dir = path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : '';
      chapters.push({
        title: this.chapterTitle(raw, i),
        html: await this.cleanChapter(raw, dir, getUrl, getText, indexByPath, false),
        originalHtml: await this.cleanChapter(raw, dir, getUrl, getText, indexByPath, true),
      });
    }
    this.applyToc(await this.readToc(zip, manifest, opfDir), indexByPath, chapters);

    LoggerService.info('EPUB', `${file.name}: novela, ${chapters.length} capítulos, ${textLength} chars`);
    end();
    return { title, chapters, images };
  }

  static revoke(result: EpubTextResult | null | undefined): void {
    result?.images.forEach((u) => URL.revokeObjectURL(u));
  }

  private static async findOpfPath(zip: JSZip): Promise<string | null> {
    const container = zip.file('META-INF/container.xml');
    if (container) {
      try {
        const xml = new DOMParser().parseFromString(await container.async('string'), 'application/xml');
        const rootfile = xml.getElementsByTagName('rootfile')[0]?.getAttribute('full-path');
        if (rootfile) return rootfile;
      } catch {
        // fallback abajo
      }
    }
    const opf = Object.keys(zip.files).find((n) => n.endsWith('.opf') && !n.includes('META-INF'));
    return opf ?? null;
  }

  private static norm(p: string): string {
    const parts: string[] = [];
    for (const seg of p.replace(/\\/g, '/').split('/')) {
      if (!seg || seg === '.') continue;
      if (seg === '..') parts.pop();
      else parts.push(seg);
    }
    return parts.join('/');
  }

  /** href relativo al capítulo -> ruta dentro del zip (sin fragmento). Null si externo. */
  private static resolvePath(dir: string, href: string): string | null {
    const clean = href.split('#')[0].trim();
    if (!clean || /^(https?:|mailto:|data:|javascript:)/i.test(clean)) return null;
    try {
      return this.norm(dir + decodeURIComponent(clean));
    } catch {
      return null;
    }
  }

  private static chapterTitle(raw: string, i: number): string {
    try {
      const doc = new DOMParser().parseFromString(raw, 'text/html');
      const h = doc.querySelector('h1,h2,h3')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 80);
      if (h) return h;
    } catch {
      // título por defecto
    }
    return `Capítulo ${i + 1}`;
  }

  private static async cleanChapter(
    raw: string,
    dir: string,
    getUrl: (zipPath: string) => Promise<string | null>,
    getText: (zipPath: string) => Promise<string | null>,
    indexByPath: Map<string, number>,
    faithful: boolean,
  ): Promise<string> {
    let doc: Document;
    try {
      doc = new DOMParser().parseFromString(raw, 'application/xhtml+xml');
      if (doc.querySelector('parsererror')) throw new Error('xhtml malformado');
    } catch {
      doc = new DOMParser().parseFromString(raw, 'text/html');
    }
    const holder = document.createElement('div');
    holder.innerHTML = doc.body?.innerHTML ?? doc.documentElement.innerHTML;

    // Modo Fiel: se inyectan las hojas de estilo originales (con urls resueltas)
    if (faithful) {
      for (const link of Array.from(holder.getElementsByTagName('link'))) {
        const rel = (link.getAttribute('rel') ?? '').toLowerCase();
        const href = link.getAttribute('href') ?? '';
        if (rel.includes('stylesheet') && href) {
          const target = this.resolvePath(dir, href);
          const css = target ? await getText(target) : null;
          if (css) {
            const cssDir = target!.includes('/') ? target!.slice(0, target!.lastIndexOf('/') + 1) : '';
            const style = document.createElement('style');
            style.textContent = await this.rewriteCssUrls(css, cssDir, getUrl);
            link.replaceWith(style);
            continue;
          }
        }
        link.remove();
      }
      for (const style of Array.from(holder.getElementsByTagName('style'))) {
        style.textContent = await this.rewriteCssUrls(style.textContent ?? '', dir, getUrl);
      }
    }

    holder.querySelectorAll(faithful ? DROP_FAITHFUL : DROP_COMFY).forEach((el) => el.remove());

    for (const el of Array.from(holder.getElementsByTagName('*'))) {
      for (const attr of Array.from(el.attributes)) {
        if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
      }
      if (!faithful) el.removeAttribute('style');
      const tag = el.tagName.toLowerCase();
      if (tag === 'a') {
        const href = el.getAttribute('href') ?? '';
        if (/^javascript:/i.test(href)) {
          el.replaceWith(...Array.from(el.childNodes));
          continue;
        }
        if (href && !href.startsWith('#')) {
          const target = this.resolvePath(dir, href);
          const idx = target ? indexByPath.get(target) : undefined;
          if (idx !== undefined) {
            el.setAttribute('data-chapter', String(idx));
            const frag = href.split('#')[1];
            if (frag) el.setAttribute('data-frag', decodeURIComponent(frag));
            el.removeAttribute('href');
            el.setAttribute('class', 'epub-xref');
          } else if (!/^(https?:|mailto:)/i.test(href)) {
            el.replaceWith(...Array.from(el.childNodes));
          } else {
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener');
          }
        }
      }
    }

    for (const img of Array.from(holder.getElementsByTagName('img'))) {
      const src = img.getAttribute('src') ?? '';
      const target = this.resolvePath(dir, src);
      const url = target ? await getUrl(target) : null;
      if (url) {
        img.setAttribute('src', url);
        img.removeAttribute('srcset');
      } else {
        img.replaceWith(document.createTextNode(img.getAttribute('alt') ?? ''));
      }
    }

    return holder.innerHTML;
  }

  /** TOC en orden: nav EPUB3, o NCX, o vacío (se usan los títulos de capítulos). */
  private static async readToc(
    zip: JSZip,
    manifest: Map<string, { href: string; type: string; props: string }>,
    opfDir: string,
  ): Promise<{ label: string; path: string }[]> {
    const load = async (href: string): Promise<string | null> => {
      const p = this.norm(opfDir + href);
      const f = zip.file(p) ?? zip.file(decodeURIComponent(p));
      return f ? f.async('string') : null;
    };

    const nav = [...manifest.values()].find((m) => m.props.split(/\s+/).includes('nav'));
    if (nav) {
      const raw = await load(nav.href);
      if (raw) {
        try {
          const doc = new DOMParser().parseFromString(raw, 'text/html');
          const tocNav =
            Array.from(doc.getElementsByTagName('nav')).find((n) =>
              (n.getAttribute('epub:type') ?? '').split(/\s+/).includes('toc'),
            ) ?? Array.from(doc.getElementsByTagName('nav'))[0];
          if (tocNav) {
            const entries = Array.from(tocNav.getElementsByTagName('a')).map((a) => ({
              label: a.textContent ?? '',
              path: this.norm(opfDir + (a.getAttribute('href') ?? '').split('#')[0]),
            }));
            if (entries.length) return entries;
          }
        } catch {
          // fallback NCX
        }
      }
    }

    const ncx = [...manifest.values()].find((m) => m.type === 'application/x-dtbncx+xml');
    if (ncx) {
      const raw = await load(ncx.href);
      if (raw) {
        try {
          const xml = new DOMParser().parseFromString(raw, 'application/xml');
          const points = Array.from(xml.getElementsByTagName('navPoint'));
          const entries = points.map((np) => ({
            label: np.getElementsByTagName('text')[0]?.textContent ?? '',
            path: this.norm(
              opfDir + (np.getElementsByTagName('content')[0]?.getAttribute('src') ?? '').split('#')[0],
            ),
          }));
          if (entries.length) return entries;
        } catch {
          // sin TOC
        }
      }
    }
    return [];
  }

  private static applyToc(
    toc: { label: string; path: string }[],
    indexByPath: Map<string, number>,
    chapters: EpubChapter[],
  ): void {
    for (const entry of toc) {
      const clean = entry.label.replace(/\s+/g, ' ').trim().slice(0, 100);
      if (!clean) continue;
      const idx = indexByPath.get(entry.path) ?? indexByPath.get(decodeURIComponent(entry.path));
      if (idx === undefined) continue;
      if (/^Capítulo \d+$/.test(chapters[idx].title)) chapters[idx].title = clean;
    }
  }

  /** Reescribe url(...) de un CSS con blob URLs del zip. */
  private static async rewriteCssUrls(
    css: string,
    baseDir: string,
    getUrl: (zipPath: string) => Promise<string | null>,
  ): Promise<string> {
    const matches = Array.from(css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi));
    let out = css;
    for (const m of matches) {
      const ref = m[2].trim();
      if (!ref || /^(data:|https?:|mailto:|#)/i.test(ref)) continue;
      const target = this.resolvePath(baseDir, ref);
      const url = target ? await getUrl(target) : null;
      if (url) out = out.split(m[0]).join(`url("${url}")`);
    }
    return out;
  }

  private static mimeFor(name: string): string {
    const n = name.toLowerCase();
    if (n.endsWith('.png')) return 'image/png';
    if (n.endsWith('.webp')) return 'image/webp';
    if (n.endsWith('.gif')) return 'image/gif';
    if (n.endsWith('.avif')) return 'image/avif';
    if (n.endsWith('.bmp')) return 'image/bmp';
    if (n.endsWith('.svg')) return 'image/svg+xml';
    if (n.endsWith('.css')) return 'text/css';
    if (n.endsWith('.woff2')) return 'font/woff2';
    if (n.endsWith('.woff')) return 'font/woff';
    if (n.endsWith('.ttf')) return 'font/ttf';
    if (n.endsWith('.otf')) return 'font/otf';
    return 'image/jpeg';
  }
}
