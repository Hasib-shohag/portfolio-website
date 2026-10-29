import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import defaults from './defaults.json';
import type { BlogPost, Section, SiteSettings } from './types';

export interface SiteContent {
  status: 'loading' | 'ready' | 'fallback';
  settings: SiteSettings;
  sections: Section[];
  posts: BlogPost[];
}

const builtIn: Omit<SiteContent, 'status'> = {
  settings: defaults.settings as SiteSettings,
  sections: defaults.sections as Section[],
  posts: defaults.sample_posts as BlogPost[],
};

const sortSections = (sections: Section[]) =>
  [...sections].filter((s) => s.is_visible).sort((a, b) => a.position - b.position);

/**
 * Loads the website content (settings, sections, blog posts) from the database.
 * If the database can't be reached, the site shows its built-in content instead.
 */
export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>({ status: 'loading', ...builtIn });

  useEffect(() => {
    const client = supabase;
    const showBuiltIn = () =>
      setContent({ status: 'fallback', ...builtIn, sections: sortSections(builtIn.sections) });

    if (!client) {
      showBuiltIn();
      return;
    }

    let finished = false;
    const timer = window.setTimeout(() => {
      if (!finished) {
        finished = true;
        showBuiltIn();
      }
    }, 5000);

    Promise.all([
      client.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      client.from('sections').select('*').order('position', { ascending: true }),
      client
        .from('blog_posts')
        .select('id, title, slug, excerpt, published_at, tags, cover_image_url, external_url')
        .eq('published', true)
        .order('published_at', { ascending: false }),
    ])
      .then(([settingsRes, sectionsRes, postsRes]) => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        if (settingsRes.error || sectionsRes.error || !sectionsRes.data || sectionsRes.data.length === 0) {
          showBuiltIn();
          return;
        }
        setContent({
          status: 'ready',
          settings: { ...builtIn.settings, ...(settingsRes.data ?? {}) } as SiteSettings,
          sections: sortSections(sectionsRes.data as Section[]),
          posts: postsRes.error ? [] : ((postsRes.data ?? []) as BlogPost[]),
        });
      })
      .catch(() => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        showBuiltIn();
      });

    return () => window.clearTimeout(timer);
  }, []);

  return content;
}
