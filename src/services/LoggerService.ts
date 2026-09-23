// Logger centralizado - SOLO consola (terminal / devtools), nunca UI.
// Uso: LoggerService.info('TAG', 'mensaje', datosOpcionales)
// Silenciar: NEXT_PUBLIC_SILENT_LOGS=1

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

export class LoggerService {
  static level: LogLevel = 'debug';
  private static startTimes = new Map<string, number>();

  private static get enabled(): boolean {
    try {
      if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SILENT_LOGS === '1') return false;
    } catch {
      // noop - sin process disponible, loguear igual
    }
    return true;
  }

  private static emit(level: LogLevel, tag: string, message: string, data?: unknown): void {
    if (!this.enabled || LEVEL_ORDER[level] < LEVEL_ORDER[this.level]) return;
    const ts = new Date().toISOString().slice(11, 23);
    const prefix = `[${ts}][ReadYouComicNow][${tag}]`;
    const fn =
      level === 'debug' ? console.debug
      : level === 'info' ? console.log
      : level === 'warn' ? console.warn
      : console.error;
    if (data !== undefined) fn(`${prefix} ${message}`, data);
    else fn(`${prefix} ${message}`);
  }

  static debug(tag: string, message: string, data?: unknown): void {
    this.emit('debug', tag, message, data);
  }

  static info(tag: string, message: string, data?: unknown): void {
    this.emit('info', tag, message, data);
  }

  static warn(tag: string, message: string, data?: unknown): void {
    this.emit('warn', tag, message, data);
  }

  static error(tag: string, message: string, data?: unknown): void {
    this.emit('error', tag, message, data);
  }

  /** Marca inicio de operación; retorna función que loguea fin con duración. */
  static start(tag: string, label: string): () => void {
    const key = `${tag}:${label}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    this.startTimes.set(key, Date.now());
    this.debug(tag, `START ${label}`);
    return () => {
      const t0 = this.startTimes.get(key) ?? Date.now();
      this.startTimes.delete(key);
      this.debug(tag, `END ${label} (${Date.now() - t0}ms)`);
    };
  }
}
