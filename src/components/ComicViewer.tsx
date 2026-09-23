'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import type { ComicBook, ComicDirection, ComicFit, ComicLayout } from '@/types/Comic';

interface ComicViewerProps {
  book: ComicBook;
  onLoadOther: (files: File[]) => void;
  onClear: () => void;
}

export default function ComicViewer({ book, onLoadOther, onClear }: ComicViewerProps) {
  const [layout, setLayout] = useState<ComicLayout>('single');
  const [direction, setDirection] = useState<ComicDirection>('ltr');
  const [fit, setFit] = useState<ComicFit>('page');
  const [page, setPage] = useState(0);
  const total = book.pages.length;

  useEffect(() => setPage(0), [book]);

  const clamp = useCallback((n: number) => Math.max(0, Math.min(total - 1, n)), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setPage((p) => clamp(p + (direction === 'ltr' ? 1 : -1)));
      if (e.key === 'ArrowLeft') setPage((p) => clamp(p + (direction === 'ltr' ? -1 : 1)));
      if (e.key === 'Home') setPage(0);
      if (e.key === 'End') setPage(total - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clamp, direction, total]);

  // Portada sola, luego pliegos impar-par ([1,2],[3,4]...). En RTL se invierte el orden visual.
  const spread = (): number[] => {
    if (layout !== 'double') return [page];
    if (page === 0) return [0];
    const first = page % 2 === 1 ? page : page - 1;
    const arr = [first];
    if (first + 1 < total) arr.push(first + 1);
    return arr;
  };
  const ordered = direction === 'rtl' ? [...spread()].reverse() : spread();

  const step = layout === 'double' ? 2 : 1;

  // Ventana: encaje garantizado con unidades de viewport (no depende de
  // porcentajes de altura). 160px ≈ toolbar 48 + nav 60 + paddings.
  const windowSingleStyle: CSSProperties = {
    maxWidth: '100%',
    maxHeight: 'calc(100dvh - 160px)',
    objectFit: 'contain',
  };
  const windowDoubleStyle: CSSProperties = {
    maxWidth: '47%',
    maxHeight: 'calc(100dvh - 160px)',
    objectFit: 'contain',
  };

  return (
    <div className="flex-1 min-h-0 bg-[#0f0f0f] flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 h-[48px] bg-[#1a1a1a] border-b border-[#2A2E33] shrink-0 flex-wrap">
        <span className="text-[11px] font-mono text-[#9CA3AF] truncate min-w-0 flex-1" title={book.title}>
          {book.title} · {total} pág.
        </span>
        <div className="flex items-center rounded-[8px] overflow-hidden border border-[#2A2E33] shrink-0">
          {(['single', 'double', 'scroll'] as ComicLayout[]).map((l) => (
            <button
              key={l}
              onClick={() => setLayout(l)}
              className={`px-2.5 py-[6px] text-[12px] transition-colors ${layout === l ? 'bg-white text-[#0f0f0f] font-medium' : 'bg-[#25282B] text-[#9CA3AF] hover:text-white'}`}
            >
              {l === 'single' ? 'Simple' : l === 'double' ? 'Doble' : 'Scroll'}
            </button>
          ))}
        </div>
        <div className="flex items-center rounded-[8px] overflow-hidden border border-[#2A2E33] shrink-0" title="Ajuste de imagen a la página">
          {(['page', 'width', 'height', 'window'] as ComicFit[]).map((f) => (
            <button
              key={f}
              onClick={() => setFit(f)}
              title={f === 'page' ? 'Página completa visible' : f === 'width' ? 'Ajustar al ancho' : f === 'height' ? 'Ajustar al alto' : 'Encajar en ventana, sin desplazamiento'}
              className={`px-2.5 py-[6px] text-[12px] transition-colors ${fit === f ? 'bg-white text-[#0f0f0f] font-medium' : 'bg-[#25282B] text-[#9CA3AF] hover:text-white'}`}
            >
              {f === 'page' ? 'Página' : f === 'width' ? 'Ancho' : f === 'height' ? 'Alto' : 'Ventana'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setDirection((d) => (d === 'ltr' ? 'rtl' : 'ltr'))}
          title={direction === 'ltr' ? 'Occidental (izq → der)' : 'Manga (der → izq)'}
          className="px-2.5 py-[6px] text-[12px] bg-[#25282B] border border-[#2A2E33] text-[#9CA3AF] hover:text-white rounded-[8px] shrink-0"
        >
          {direction === 'ltr' ? '← Occidental' : 'Manga →'}
        </button>
        <label className="px-3 py-[6px] bg-[#C0392B] text-white rounded-[8px] hover:bg-[#A93226] transition-colors cursor-pointer text-[12px] font-medium shrink-0">
          Cargar otro
          <input
            type="file"
            multiple
            accept=".cbz,.zip,.pdf,.epub,.jpg,.jpeg,.png,.webp,.gif,.avif,.bmp"
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

      {layout === 'scroll' ? (
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col items-center gap-4">
          {book.pages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Página ${i + 1}`}
              loading="lazy"
              className="w-auto rounded-[6px] shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
              style={
                fit === 'width'
                  ? { maxWidth: 'min(100%, 860px)', maxHeight: 'none' }
                  : { maxWidth: 'min(100%, 860px)', maxHeight: 'calc(100dvh - 140px)', objectFit: 'contain' }
              }
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className={`flex-1 min-h-0 flex p-4 ${fit === 'window' ? 'overflow-hidden items-center justify-center' : `overflow-auto ${fit === 'width' ? 'items-start justify-center' : 'items-center justify-center'}`} ${layout === 'double' && fit === 'window' ? 'gap-1' : 'gap-3'}`}>
            {layout === 'single' ? (
              <img
                src={book.pages[page]}
                alt={`Página ${page + 1}`}
                style={fit === 'window' ? windowSingleStyle : undefined}
                className={`rounded-[6px] shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${
                  fit === 'window'
                    ? 'h-full w-full object-contain'
                    : fit === 'width'
                    ? 'w-full h-auto max-h-none'
                    : fit === 'height'
                      ? 'h-full w-auto max-w-none object-contain'
                      : 'max-h-full max-w-full object-contain'
                }`}
              />
            ) : (
              (() => {
                const pages = ordered;
                const cls =
                  fit === 'window'
                    ? 'h-full w-auto object-contain shrink-0'
                    : fit === 'width'
                    ? 'w-[48%] h-auto max-h-none'
                    : fit === 'height'
                      ? 'h-full w-auto max-w-none object-contain'
                      : 'max-h-full max-w-[48%] object-contain';
                return pages.map((idx) => (
                  <img
                    key={idx}
                    src={book.pages[idx]}
                    alt={`Página ${idx + 1}`}
                    style={fit === 'window' ? windowDoubleStyle : undefined}
                    className={`rounded-[6px] shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${cls}`}
                  />
                ));
              })()
            )}
          </div>
          <div className="flex items-center justify-center gap-3 py-3 shrink-0" dir={direction === 'rtl' ? 'rtl' : 'ltr'}>
            <button onClick={() => setPage((p) => clamp(p - step))} disabled={page === 0} className="px-4 py-2 bg-[#25282B] border border-[#2A2E33] text-white rounded-[8px] text-[13px] disabled:opacity-40">
              {direction === 'rtl' ? 'Anterior →' : '← Anterior'}
            </button>
            <span className="text-[12px] text-[#9CA3AF] font-mono" dir="ltr">
              {(() => {
                const s = layout === 'double' ? spread() : [page];
                const lo = Math.min(...s) + 1;
                const hi = Math.max(...s) + 1;
                return lo === hi ? `${lo} / ${total}` : `${lo}–${hi} / ${total}`;
              })()}
            </span>
            <button onClick={() => setPage((p) => clamp(p + step))} disabled={page >= total - 1} className="px-4 py-2 bg-[#25282B] border border-[#2A2E33] text-white rounded-[8px] text-[13px] disabled:opacity-40">
              {direction === 'rtl' ? '← Siguiente' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
