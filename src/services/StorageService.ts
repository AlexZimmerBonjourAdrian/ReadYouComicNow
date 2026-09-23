import { LoggerService } from './LoggerService';
import type { ComicViewState } from '@/types/Comic';

export interface StoredProgress {
  title: string;
  state: ComicViewState;
}

// Persistencia local del cómic (privacidad: IndexedDB, sin subidas).
export class StorageService {
  private static DB_NAME = 'ReadYouComicNow_DB';
  private static STORE_NAME = 'comic';
  private static DB_VERSION = 1;

  private static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  static async saveComic(files: File[]): Promise<void> {
    const end = LoggerService.start('Storage', `saveComic ${files.length} archivo(s)`);
    try {
      const items = await Promise.all(
        files.map(async (f) => ({ name: f.name, type: f.type, data: await f.arrayBuffer() })),
      );
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([this.STORE_NAME], 'readwrite');
        tx.objectStore(this.STORE_NAME).put({ id: 'current', files: items, timestamp: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      db.close();
      LoggerService.info('Storage', `cómic guardado (${files.length} archivo(s))`);
    } catch (error) {
      LoggerService.error('Storage', 'saveComic falló:', error);
    } finally {
      end();
    }
  }

  static async loadComic(): Promise<File[] | null> {
    try {
      const db = await this.openDB();
      const row = await new Promise<{ files?: { name: string; type: string; data: ArrayBuffer }[] } | undefined>(
        (resolve, reject) => {
          const tx = db.transaction([this.STORE_NAME], 'readonly');
          const req = tx.objectStore(this.STORE_NAME).get('current');
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        },
      );
      db.close();
      if (!row?.files?.length) return null;
      return row.files.map((f) => new File([f.data], f.name, { type: f.type }));
    } catch (error) {
      LoggerService.error('Storage', 'loadComic falló:', error);
      return null;
    }
  }

  static async clearComic(): Promise<void> {
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([this.STORE_NAME], 'readwrite');
        tx.objectStore(this.STORE_NAME).delete('current');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      db.close();
      LoggerService.info('Storage', 'cómic borrado');
    } catch (error) {
      LoggerService.error('Storage', 'clearComic falló:', error);
    }
  }
}
