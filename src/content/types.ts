// Shapes of the website content. The admin panel edits exactly these fields.

export type SectionKind =
  | 'hero'
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'product_thinking'
  | 'system_architecture'
  | 'blog'
  | 'contact'
  | 'custom_text'
  | 'custom_cards'
  | 'custom_gallery'
  | 'custom_timeline';

export interface SiteSettings {
  full_name: string;
  brand_initials: string;
  email: string;
  linkedin_url: string;
  github_url: string;
  location: string;
  cv_url: string;
  footer_tagline: string;
  copyright_text: string;
}

export interface Section {
  id?: string;
  section_key: string;
  kind: SectionKind;
  title: string;
  title_highlight: string;
  subtitle: string;
  menu_label: string | null;
  position: number;
  is_visible: boolean;
  // Section-specific fields; each section component reads its own.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any>;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string | null;
  tags: string[];
  cover_image_url: string | null;
  external_url: string | null;
}

// Small helpers so a missing or wrongly-typed field never breaks the page.
export const text = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
export const list = <T = string>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
export const visibleItems = <T extends { hidden?: boolean }>(v: unknown): T[] =>
  list<T>(v).filter((item) => item && !item.hidden);
