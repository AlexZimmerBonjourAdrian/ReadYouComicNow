export type ComicLayout = 'single' | 'double' | 'scroll';
export type ComicDirection = 'ltr' | 'rtl';
export type ComicFit = 'page' | 'width' | 'zoom' | 'window';

export interface EpubChapter {
  title: string;
  html: string;
}

export interface ComicBook {
  readonly title: string;
  readonly pages: string[];
  readonly format: 'cbz' | 'pdf' | 'epub' | 'images' | 'epub-text';
  readonly chapters?: EpubChapter[];
  readonly bookImages?: string[];
}

export interface ComicViewState {
  page: number;
  layout: ComicLayout;
  fit: ComicFit;
  direction: ComicDirection;
}
