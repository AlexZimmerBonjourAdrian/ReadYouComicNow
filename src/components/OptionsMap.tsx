'use client';

import { useEffect } from 'react';

interface OptionsMapProps {
  onClose: () => void;
}

const SECTIONS: { title: string; items: { name: string; desc: string }[] }[] = [
  {
    title: 'Diseño',
    items: [
      { name: 'Simple', desc: 'Una página a la vez.' },
      { name: 'Doble', desc: 'Pliego de dos páginas. La portada se muestra sola.' },
      { name: 'Scroll', desc: 'Todo el capítulo en cascada vertical.' },
    ],
  },
  {
    title: 'Ajuste',
    items: [
      { name: 'Página', desc: 'Página completa visible; scroll solo si hace falta.' },
      { name: 'Ancho', desc: 'Llena el ancho; scroll vertical para leer.' },
      { name: 'Zoom', desc: 'Simple/Doble: zoom con arrastre libre (rueda, doble clic, − / % / +). Scroll: amplía la columna conservando tu posición; la rueda sigue desplazando.' },
      { name: 'Ventana', desc: 'Encaja la página en la ventana, sin desplazamiento.' },
    ],
  },
  {
    title: 'Dirección',
    items: [
      { name: 'Occidental', desc: 'Lectura de izquierda a derecha.' },
      { name: 'Manga', desc: 'Lectura de derecha a izquierda: invierte los pliegos en Doble y espeja navegación y teclado. En Scroll no cambia el orden vertical.' },
    ],
  },
  {
    title: 'Navegación',
    items: [
      { name: 'Anterior / Siguiente', desc: 'Cambia de página (de 2 en 2 en modo Doble).' },
      { name: 'Teclado', desc: '← / → pasar página · Inicio / Fin ir a los extremos.' },
    ],
  },
  {
    title: 'Archivo y privacidad',
    items: [
      { name: 'Cargar otro', desc: 'CBZ, ZIP, PDF, EPUB (cómic o novela) o imágenes sueltas. Máx 900MB.' },
      { name: 'Limpiar', desc: 'Cierra el cómic y borra el guardado local.' },
      { name: 'EPUB de texto', desc: 'Las novelas abren en modo libro: Fiel (formato editorial original) o Cómodo (adaptado), con capítulos, tamaño de letra y posición guardada.' },
      { name: 'Automático', desc: 'Todo se procesa en tu navegador y el cómic persiste al recargar (IndexedDB). Sin subidas.' },
    ],
  },
];

export default function OptionsMap({ onClose }: OptionsMapProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label="Mapa de opciones"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] max-h-[85vh] overflow-y-auto bg-[#1a1a1a] border border-[#2A2E33] rounded-[14px] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-white">Mapa de opciones</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-7 h-7 rounded-full bg-[#25282B] border border-[#2A2E33] text-[#9CA3AF] hover:text-white text-[14px] leading-none"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-5">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h3 className="text-[11px] tracking-[0.12em] uppercase font-semibold text-[#C0392B] mb-2">{s.title}</h3>
              <ul className="flex flex-col gap-1.5">
                {s.items.map((it) => (
                  <li key={it.name} className="text-[13px] leading-[1.6]">
                    <span className="text-white font-medium">{it.name}</span>
                    <span className="text-[#9CA3AF]"> — {it.desc}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
