'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { EpubChapter } from '@/types/Comic';

interface EpubBookViewerProps {
  title: string;
  chapters: EpubChapter[];
  onLoadOther: (files: File[]) => void;
  onClear: () => void;
}

const ACCEPT = '.cbz,.zip,.pdf,.epub,.jpg,.jpeg,.png,.webp,.gif,.avif,.bmp';

function storedNumber(key: string, fallback: number, min: number, max: number): number {
  try {
    const v = Number(window.localStorage.getItem(key));
    if (Number.isFinite(v)) return Math.min(max, Math.max(min, v));
  } catch {
    // sin localStorage
  }
  return fallback;
}

export default function EpubBookViewer({ title, chapters, onLoadOther, onClear }: EpubBookViewerProps) {
  const total = chapters.length;
  const [chapter, setChapter] = useState(() => storedNumber(`rycn-pos::${title}`, 0, 0, Math.max(0, total - 1)));
  const [font, setFont] = useState(() => storedNumber('rycn-font', 1, 0.85, 1.5));
  const [faithful, setFaithful] = useState(() => {
    try {
      return window.localStorage.getItem('rycn-bookmode') === 'fiel';
    } catch {
      return false;
    }
  });
  const contentRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const pendingFrag = useRef<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(`rycn-pos::${title}`, String(chapter));
    } catch {
      // sin localStorage
    }
    contentRef.current?.scrollTo({ top: 0 });
    if (pendingFrag.current) {
      const frag = pendingFrag.current;
      pendingFrag.current = null;
      requestAnimationFrame(() => {
        contentRef.current
          ?.querySelector(`#${CSS.escape(frag)}, a[name="${CSS.escape(frag)}"]`)
          ?.scrollIntoView({ block: 'start' });
      });
    }
  }, [chapter, title]);

  useEffect(() => {
    try {
      window.localStorage.setItem('rycn-font', String(font));
    } catch {
      // sin localStorage
    }
  }, [font]);

  useEffect(() => {
    try {
      window.localStorage.setItem('rycn-bookmode', faithful ? 'fiel' : 'comodo');
    } catch {
      // sin localStorage
    }
  }, [faithful]);

  const safeChapter = Math.min(chapter, Math.max(0, total - 1));

  const gotoChapter = (idx: number, frag: string | null) => {
    if (!Number.isInteger(idx) || idx < 0 || idx >= total) return;
    pendingFrag.current = frag;
    setChapter(idx);
  };

  const onContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const link = (e.target as HTMLElement).closest('[data-chapter]');
    if (!link) return;
    e.preventDefault();
    gotoChapter(Number(link.getAttribute('data-chapter')), link.getAttribute('data-frag'));
  };

  const faithfulDoc = useMemo(
    () =>
      `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${chapters[safeChapter]?.originalHtml ?? ''}</body></html>`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chapters, safeChapter],
  );

  const onFrameLoad = () => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    doc.querySelectorAll('[data-chapter]').forEach((a) => {
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        gotoChapter(
          Number((a as HTMLElement).getAttribute('data-chapter')),
          (a as HTMLElement).getAttribute('data-frag'),
        );
      });
    });
    if (pendingFrag.current) {
      const frag = pendingFrag.current;
      pendingFrag.current = null;
      doc.querySelector(`#${CSS.escape(frag)}, a[name="${CSS.escape(frag)}"]`)?.scrollIntoView({ block: 'start' });
    }
  };

  return (
    <div className="flex-1 min-h-0 bg-[#0f0f0f] flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 min-h-[48px] bg-[#1a1a1a] border-b border-[#2A2E33] shrink-0 flex-wrap">
        <span className="text-[11px] font-mono text-[#9CA3AF] truncate min-w-0 basis-full sm:basis-auto sm:flex-1" title={title}>
          {title} · Libro · {total} cap.
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setChapter((c) => Math.max(0, c - 1))}
            disabled={safeChapter === 0}
            className="px-2.5 py-[6px] text-[12px] bg-[#25282B] border border-[#2A2E33] text-white rounded-[8px] disabled:opacity-40"
          >
            ← Cap.
          </button>
          <select
            value={safeChapter}
            onChange={(e) => setChapter(Number(e.target.value))}
            aria-label="Capítulo"
            className="max-w-[160px] sm:max-w-[240px] px-2 py-[6px] text-[12px] bg-[#25282B] border border-[#2A2E33] text-white rounded-[8px]"
          >
            {chapters.map((c, i) => (
              <option key={i} value={i}>
                {i + 1}. {c.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => setChapter((c) => Math.min(total - 1, c + 1))}
            disabled={safeChapter >= total - 1}
            className="px-2.5 py-[6px] text-[12px] bg-[#25282B] border border-[#2A2E33] text-white rounded-[8px] disabled:opacity-40"
          >
            Cap. →
          </button>
        </div>
        <div className="flex items-center rounded-[8px] overflow-hidden border border-[#2A2E33] shrink-0" title="Vista del libro">
          <button
            onClick={() => setFaithful(false)}
            title="Cómodo: texto adaptado a la app"
            className={`px-2.5 py-[6px] text-[12px] transition-colors ${!faithful ? 'bg-white text-[#0f0f0f] font-medium' : 'bg-[#25282B] text-[#9CA3AF] hover:text-white'}`}
          >
            Cómodo
          </button>
          <button
            onClick={() => setFaithful(true)}
            title="Fiel: formato editorial original del EPUB"
            className={`px-2.5 py-[6px] text-[12px] transition-colors ${faithful ? 'bg-white text-[#0f0f0f] font-medium' : 'bg-[#25282B] text-[#9CA3AF] hover:text-white'}`}
          >
            Fiel
          </button>
        </div>
        <div className="flex items-center rounded-[8px] overflow-hidden border border-[#2A2E33] shrink-0" title={faithful ? 'El tamaño de letra solo aplica al modo Cómodo' : 'Tamaño de letra'}>
          <button
            onClick={() => setFont((f) => Math.max(0.85, Math.round((f - 0.1) * 100) / 100))}
            disabled={faithful}
            className="px-2.5 py-[6px] text-[12px] bg-[#25282B] text-[#9CA3AF] hover:text-white disabled:opacity-40"
          >
            A−
          </button>
          <button
            onClick={() => setFont((f) => Math.min(1.5, Math.round((f + 0.1) * 100) / 100))}
            disabled={faithful}
            className="px-2.5 py-[6px] text-[12px] bg-[#25282B] text-[#9CA3AF] hover:text-white disabled:opacity-40"
          >
            A+
          </button>
        </div>
        <label className="px-3 py-[6px] bg-[#C0392B] text-white rounded-[8px] hover:bg-[#A93226] transition-colors cursor-pointer text-[12px] font-medium shrink-0">
          Cargar otro
          <input
            type="file"
            multiple
            accept={ACCEPT}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) onLoadOther(files);
              e.target.value = '';
            }}
            className="hidden"
          />
        </label>
        <button
          onClick={onClear}
          className="px-3 py-[6px] bg-[#25282B] border border-[#2A2E33] text-[#9CA3AF] rounded-[8px] hover:border-[#3A3E44] hover:text-white transition-colors text-[12px] shrink-0"
        >
          Limpiar
        </button>
      </div>

      {faithful ? (
        <div className="flex-1 min-h-0 flex flex-col bg-[#0f0f0f] px-2 sm:px-4 py-4">
          <iframe
            ref={frameRef}
            key={safeChapter}
            title={`${title} - ${chapters[safeChapter]?.title ?? ''}`}
            srcDoc={faithfulDoc}
            onLoad={onFrameLoad}
            sandbox="allow-same-origin"
            className="flex-1 min-h-0 w-full border-0 rounded-[8px] bg-white"
          />
          <p className="text-center text-[11px] font-mono text-[#6B7280] mt-3">
            Cap. {safeChapter + 1} / {total} · formato original
          </p>
        </div>
      ) : (
        <div ref={contentRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6">
        <article
          className="epub-book"
          style={{ fontSize: `${17 * font}px` }}
          onClick={onContentClick}
          dangerouslySetInnerHTML={{ __html: chapters[safeChapter]?.html ?? '' }}
        />
        <p className="text-center text-[11px] font-mono text-[#6B7280] mt-8">
          Cap. {safeChapter + 1} / {total}
        </p>
        </div>
      )}
    </div>
  );
}
