'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import OptionsMap from './OptionsMap';
import { useIsMobile } from '@/hooks/useIsMobile';
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
  const [showMap, setShowMap] = useState(false);
  const isMobile = useIsMobile();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const scrollBoxRef = useRef<HTMLDivElement | null>(null);
  const total = book.pages.length;

  useEffect(() => setPage(0), [book]);
  useEffect(() => { setPan({ x: 0, y: 0 }); }, [page, layout, fit]);
  useEffect(() => { setPan({ x: 0, y: 0 }); setZoom(1); }, [book]);

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

  // Zoom vale en los tres diseños: en Simple/Doble es zoom + arrastre libre;
  // en Scroll amplía el ancho de columna (el scroll nativo mueve la página).
  const isZoom = fit === 'zoom';
  const isZoomPan = isZoom && layout !== 'scroll';
  const clampZoom = (z: number) => Math.min(4, Math.max(1, z));
  // El scroll es prioritario: al cambiar el zoom en Scroll se conserva la
  // posición relativa para seguir viendo la misma página.
  const applyZoom = (z: number) => {
    const el = scrollBoxRef.current;
    const inScroll = layout === 'scroll' && el;
    const ratio = inScroll ? el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight) : 0;
    setZoom(clampZoom(z));
    if (inScroll) {
      requestAnimationFrame(() => {
        const el2 = scrollBoxRef.current;
        if (el2) el2.scrollTop = ratio * Math.max(0, el2.scrollHeight - el2.clientHeight);
      });
    }
  };
  const clampPan = (x: number, y: number, z: number) => {
    const el = boxRef.current;
    if (!el) return { x, y };
    const r = el.getBoundingClientRect();
    const mx = Math.max(0, (r.width * (z - 1)) / 2);
    const my = Math.max(0, (r.height * (z - 1)) / 2);
    return { x: Math.min(mx, Math.max(-mx, x)), y: Math.min(my, Math.max(-my, y)) };
  };
  const zoomIn = () => applyZoom(Math.round((zoom + 0.5) * 100) / 100);
  const zoomOut = () => applyZoom(Math.round((zoom - 0.5) * 100) / 100);
  const resetZoom = () => { applyZoom(1); setPan({ x: 0, y: 0 }); };
  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isZoomPan) return;
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    setPan(clampPan(d.ox + e.clientX - d.sx, d.oy + e.clientY - d.sy, zoom));
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };
  const onWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isZoomPan) return; // en Scroll la rueda sigue desplazando la columna
    const z = clampZoom(zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
    applyZoom(z);
    setPan((p) => clampPan(p.x, p.y, z));
  };
  const onDblClickZoom = () => {
    if (!isZoom) return;
    if (zoom === 1) applyZoom(2.5);
    else resetZoom();
  };

  const zoomControls = (sticky: boolean) => (
    <div
      className={
        sticky
          ? 'sticky bottom-3 self-end z-10 flex items-center gap-1 rounded-[8px] border border-[#2A2E33] bg-black/70 px-1.5 py-1 mr-1'
          : 'absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-[8px] border border-[#2A2E33] bg-black/70 px-1.5 py-1'
      }
    >
      <button onClick={zoomOut} title="Reducir zoom" className="px-2.5 py-2 sm:px-2 sm:py-1 text-[14px] leading-none text-white hover:bg-[#2A2E33] rounded">−</button>
      <button onClick={resetZoom} title="Restablecer zoom (doble clic también)" className="px-2.5 py-2 sm:px-2 sm:py-1 text-[12px] text-[#9CA3AF] font-mono hover:text-white">
        {Math.round(zoom * 100)}%
      </button>
      <button onClick={zoomIn} title="Ampliar zoom" className="px-2.5 py-2 sm:px-2 sm:py-1 text-[14px] leading-none text-white hover:bg-[#2A2E33] rounded">+</button>
    </div>
  );

  const singleImg = (
    <img
      src={book.pages[page]}
      alt={`Página ${page + 1}`}
      draggable={false}
      style={fit === 'window' || isZoomPan ? windowSingleStyle : undefined}
      className={`rounded-[6px] shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${
        fit === 'width'
          ? 'w-full h-auto max-h-none'
          : fit === 'window' || isZoomPan
            ? 'h-full w-full object-contain'
            : 'max-h-full max-w-full object-contain'
      }`}
    />
  );

  const doubleContent = (() => {
    const pages = ordered;
    const cls =
      fit === 'width'
        ? 'w-[48%] h-auto max-h-none'
        : fit === 'window' || isZoomPan
          ? 'h-full w-auto object-contain shrink-0'
          : 'max-h-full max-w-[48%] object-contain';
    return pages.map((idx) => (
      <img
        key={idx}
        src={book.pages[idx]}
        alt={`Página ${idx + 1}`}
        draggable={false}
        style={fit === 'window' || isZoomPan ? windowDoubleStyle : undefined}
        className={`rounded-[6px] shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${cls}`}
      />
    ));
  })();

  return (
    <div className="flex-1 min-h-0 bg-[#0f0f0f] flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 min-h-[48px] bg-[#1a1a1a] border-b border-[#2A2E33] shrink-0 flex-wrap">
        <span className="text-[11px] font-mono text-[#9CA3AF] truncate min-w-0 basis-full sm:basis-auto sm:flex-1" title={book.title}>
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
          {(['page', 'width', 'zoom', 'window'] as ComicFit[]).map((f) => (
            <button
              key={f}
              onClick={() => setFit(f)}
              title={f === 'page' ? 'Página completa visible' : f === 'width' ? 'Ajustar al ancho' : f === 'zoom' ? 'Zoom con movimiento libre: arrastra, rueda del ratón, doble clic' : 'Encajar en ventana, sin desplazamiento'}
              className={`px-2.5 py-[6px] text-[12px] transition-colors ${fit === f ? 'bg-white text-[#0f0f0f] font-medium' : 'bg-[#25282B] text-[#9CA3AF] hover:text-white'}`}
            >
              {f === 'page' ? 'Página' : f === 'width' ? 'Ancho' : f === 'zoom' ? 'Zoom' : 'Ventana'}
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
        <button
          onClick={() => setShowMap(true)}
          title="Mapa de opciones: qué hace cada botón"
          aria-label="Mapa de opciones"
          className="w-7 h-7 rounded-full bg-[#25282B] border border-[#2A2E33] text-[#9CA3AF] hover:text-white text-[14px] leading-none shrink-0"
        >
          ?
        </button>
        <label className="px-3 py-[6px] bg-[#C0392B] text-white rounded-[8px] hover:bg-[#A93226] transition-colors cursor-pointer text-[12px] font-medium shrink-0">
          Cargar otro
          <input
            type="file"
            multiple
            accept=".cbz,.zip,.pdf,.jpg,.jpeg,.png,.webp,.gif,.avif,.bmp"
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
        <div ref={scrollBoxRef} className={`flex-1 overflow-auto py-6 px-4 flex flex-col gap-4 ${isZoom && zoom > 1 ? 'items-start' : 'items-center'}`} onDoubleClick={onDblClickZoom}>
          {book.pages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Página ${i + 1}`}
              loading="lazy"
              draggable={false}
              className={`w-auto rounded-[6px] shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${isZoom && zoom > 1 ? 'mx-auto' : ''}`}
              style={
                fit === 'width'
                  ? { maxWidth: 'min(100%, 860px)', maxHeight: 'none' }
                  : fit === 'zoom'
                    ? { width: `calc(min(100%, 860px) * ${zoom})`, maxWidth: 'none', maxHeight: 'none' }
                    : { maxWidth: 'min(100%, 860px)', maxHeight: 'calc(100dvh - 140px)', objectFit: 'contain' }
              }
            />
          ))}
          {isZoom && zoomControls(true)}
        </div>
      ) : isMobile && layout === 'double' ? (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto flex flex-col items-center gap-2 p-3">
            {ordered.map((idx) => (
              <img
                key={idx}
                src={book.pages[idx]}
                alt={`Página ${idx + 1}`}
                loading="lazy"
                draggable={false}
                className="w-full h-auto rounded-[6px] shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 px-3 py-2 shrink-0" dir={direction === 'rtl' ? 'rtl' : 'ltr'}>
            <button onClick={() => setPage((p) => clamp(p - step))} disabled={page === 0} className="flex-1 px-4 py-2.5 bg-[#25282B] border border-[#2A2E33] text-white rounded-[8px] text-[13px] disabled:opacity-40">
              {direction === 'rtl' ? 'Anterior →' : '← Anterior'}
            </button>
            <span className="text-[12px] text-[#9CA3AF] font-mono shrink-0" dir="ltr">
              {(() => {
                const s = spread();
                const lo = Math.min(...s) + 1;
                const hi = Math.max(...s) + 1;
                return lo === hi ? `${lo} / ${total}` : `${lo}–${hi} / ${total}`;
              })()}
            </span>
            <button onClick={() => setPage((p) => clamp(p + step))} disabled={page >= total - 1} className="flex-1 px-4 py-2.5 bg-[#25282B] border border-[#2A2E33] text-white rounded-[8px] text-[13px] disabled:opacity-40">
              {direction === 'rtl' ? '← Siguiente' : 'Siguiente →'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          <div ref={boxRef} className={`relative flex-1 min-h-0 flex p-4 ${fit === 'window' || isZoomPan ? 'overflow-hidden items-center justify-center' : `overflow-auto ${fit === 'width' ? 'items-start justify-center' : 'items-center justify-center'}`} ${layout === 'double' && (fit === 'window' || isZoomPan) ? 'gap-1' : 'gap-3'}`}>
            {isZoomPan ? (
              <div
                onPointerDown={onDragStart}
                onPointerMove={onDragMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onWheel={onWheelZoom}
                onDoubleClick={onDblClickZoom}
                className={`flex h-full w-full items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing ${layout === 'double' ? 'gap-1' : ''}`}
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              >
                {layout === 'single' ? singleImg : doubleContent}
              </div>
            ) : layout === 'single' ? (
              singleImg
            ) : (
              doubleContent
            )}
            {isZoom && zoomControls(false)}
          </div>
          <div className="flex items-center justify-center gap-3 px-3 py-2 shrink-0" dir={direction === 'rtl' ? 'rtl' : 'ltr'}>
            <button onClick={() => setPage((p) => clamp(p - step))} disabled={page === 0} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-[#25282B] border border-[#2A2E33] text-white rounded-[8px] text-[13px] disabled:opacity-40">
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
            <button onClick={() => setPage((p) => clamp(p + step))} disabled={page >= total - 1} className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-[#25282B] border border-[#2A2E33] text-white rounded-[8px] text-[13px] disabled:opacity-40">
              {direction === 'rtl' ? '← Siguiente' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}
      {showMap && <OptionsMap onClose={() => setShowMap(false)} />}
    </div>
  );
}
