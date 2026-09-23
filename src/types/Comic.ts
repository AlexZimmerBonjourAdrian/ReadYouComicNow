export type ComicLayout = 'single' | 'double' | 'scroll';
export type ComicDirection = 'ltr' | 'rtl';
export type ComicFit = 'page' | 'width' | 'height' | 'window';

export interface ComicBook {
  readonly title: string;
  readonly pages: string[];
  readonly format: 'cbz' | 'pdf' | 'epub' | 'images';
}
