'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ComicReaderService } from '@/services/ComicReaderService';
import { StorageService } from '@/services/StorageService';
import { LoggerService } from '@/services/LoggerService';
import type { ComicBook } from '@/types/Comic';
import { APP_VERSION } from '@/config';

const ComicViewer = dynamic(() => import('@/components/ComicViewer'), { ssr: false });

const ACCEPT = '.cbz,.zip,.pdf,.jpg,.jpeg,.png,.webp,.gif,.avif,.bmp';

export default function Home() {
  const [book, setBook] = useState<ComicBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await StorageService.loadComic();
        if (stored?.length) await openFiles(stored, false);
      } catch (e) {
        LoggerService.error('App', 'restore falló:', e);
      } finally {
        setIsLoading(false);
      }
    })();
    return () => ComicReaderService.revokeComic(book);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openFiles = async (files: File[], persist = true) => {
    setError(null);
    const valid = files.filter((f) => ComicReaderService.isSupported(f));
    if (!valid.length) {
      setError('Sube un CBZ, PDF o imágenes (JPG/PNG/WebP).');
      return;
    }
    setIsOpening(true);
    setProgress(0);
    ComicReaderService.revokeComic(book);
    setBook(null);
    try {
      const loaded = await ComicReaderService.loadComic(valid, setProgress);
      setBook(loaded);
      if (persist) await StorageService.saveComic(valid);
    } catch (e) {
      LoggerService.error('App', 'openFiles falló:', e);
      setError(e instanceof Error ? e.message : 'No se pudo abrir el cómic.');
    } finally {
      setIsOpening(false);
      setProgress(0);
    }
  };

  const handleClear = async () => {
    ComicReaderService.revokeComic(book);
    setBook(null);
    setError(null);
    await StorageService.clearComic();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <span className="fixed bottom-1.5 left-2 z-[90] text-[10px] font-mono text-[#4b5563] pointer-events-none select-none">
        v{APP_VERSION}
      </span>
      <div className="flex-1 flex flex-col bg-[#0f0f0f] min-h-0">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <p className="text-[13px] tracking-[0.08em] uppercase text-[#6B7280]">Cargando…</p>
          </div>
        ) : isOpening ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-[14px] text-[#e5e5e5] font-medium">
              {progress > 0 ? `Renderizando páginas — ${progress.toFixed(0)}%` : 'Abriendo cómic…'}
            </p>
            {progress > 0 && (
              <div className="w-[320px] h-[3px] bg-[#25282B] rounded-full overflow-hidden">
                <div className="h-full bg-[#C0392B] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        ) : book ? (
          <ComicViewer book={book} onLoadOther={(f) => openFiles(f)} onClear={handleClear} />
        ) : (
          <div className="flex-1 flex items-center justify-center px-6 lg:px-8 py-12">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7">
                <p className="text-[11px] tracking-[0.14em] uppercase text-[#C0392B] font-semibold mb-3">Lector local · Privado</p>
                <h1 className="font-serif text-[34px] sm:text-[42px] md:text-[52px] font-bold tracking-[-0.03em] leading-[0.95] text-white mb-4">
                  Lee tus cómics<br />y manga<br /><span className="font-normal italic text-[#9CA3AF]">en el navegador.</span>
                </h1>
                <p className="text-[15px] leading-[1.7] text-[#9CA3AF] max-w-[48ch] mb-8">
                  Abre CBZ, PDF o imágenes sueltas. Todo se procesa en tu dispositivo, sin subidas. Layouts simple, doble y scroll, más modo manga derecha-a-izquierda.
                </p>
                <div className="flex flex-wrap gap-3 text-[12px] leading-none">
                  <span className="px-3 py-2 rounded-full bg-[#1a1a1a] border border-[#2A2E33] text-[#9CA3AF]">→ Rendimiento fluido</span>
                  <span className="px-3 py-2 rounded-full bg-[#1a1a1a] border border-[#2A2E33] text-[#9CA3AF]">→ Layouts a medida</span>
                  <span className="px-3 py-2 rounded-full bg-[#1a1a1a] border border-[#2A2E33] text-[#9CA3AF]">→ Privacidad total</span>
                </div>
                <p className="text-[11px] font-mono text-[#4b5563] mt-6">v{APP_VERSION}</p>
                {error && <p className="text-[13px] text-[#E07856] mt-6">{error}</p>}
              </div>
              <div className="lg:col-span-5">
                <div className="bg-[#1a1a1a] border border-[#2A2E33] rounded-[14px] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] tracking-[0.12em] uppercase font-semibold text-white">Abrir cómic</h3>
                    <span className="text-[11px] text-[#6B7280]">CBZ · PDF · IMG</span>
                  </div>
                  <label className="group block rounded-[12px] border border-dashed border-[#3A3E44] hover:border-[#6B7280] bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors cursor-pointer p-8 text-center">
                    <div className="mx-auto w-9 h-9 rounded-full bg-white text-[#0f0f0f] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 16V4" /><path d="M8 8l4-4 4 4" /><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
                    </div>
                    <span className="block text-[14px] font-medium text-white">Haz clic para elegir páginas</span>
                    <span className="block text-[12px] text-[#6B7280] mt-1">Máx 900MB · Todo queda en tu navegador</span>
                    <input
                      type="file"
                      multiple
                      accept={ACCEPT}
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (files.length) openFiles(files);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] leading-[1.6] text-[#6B7280] mt-4">Tip: selecciona varias imágenes para armar un capítulo al instante, o un .cbz para el tomo completo.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
