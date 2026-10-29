import { Calendar, ExternalLink, Tag } from 'lucide-react';
import { list, text, type BlogPost, type Section } from '../content/types';
import { SectionHeading, safeHref } from './shared';

export default function Blog({ section, posts }: { section: Section; posts: BlogPost[] }) {
  const max = Number(section.content.max_posts) > 0 ? Number(section.content.max_posts) : 4;
  const shown = posts.slice(0, max);

  return (
    <section id={section.section_key} className="py-24 px-6 bg-[#0D1117]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title={section.title} highlight={section.title_highlight} subtitle={section.subtitle} />

        {shown.length === 0 ? (
          <div className="text-center text-[#8B949E] py-12">{text(section.content.empty_message)}</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {shown.map((post) => {
              const card = (
                <>
                  {post.cover_image_url && (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-44 object-cover rounded-lg mb-4 border border-[#30363d]"
                    />
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {list<string>(post.tags).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono text-[#8B949E] bg-[#21262d] px-2 py-1 rounded border border-[#30363d] flex items-center gap-1"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-[#C9D1D9] mb-3 group-hover:text-[#00FFC6] transition-colors flex items-start gap-2">
                    {post.title}
                    {post.external_url && <ExternalLink size={16} className="mt-1.5 flex-shrink-0" />}
                  </h3>

                  <p className="text-[#8B949E] mb-4 leading-relaxed">{post.excerpt}</p>

                  {post.published_at && (
                    <div className="flex items-center text-[#8B949E] text-sm">
                      <Calendar size={14} className="mr-2" />
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </>
              );
              const className =
                'group block bg-[#161B22] border border-[#30363d] rounded-xl p-6 hover:border-[#00FFC6]/50 transition-all duration-300 transform hover:-translate-y-1';
              return post.external_url ? (
                <a key={post.id} href={safeHref(post.external_url)} target="_blank" rel="noopener noreferrer" className={className}>
                  {card}
                </a>
              ) : (
                <article key={post.id} className={className}>
                  {card}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
