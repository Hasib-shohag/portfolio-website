// Section types you can add from the admin panel: text + image, cards, image gallery, timeline.
import { Calendar, ExternalLink } from 'lucide-react';
import { list, text, visibleItems, type Section } from '../content/types';
import { RichText, SectionHeading, isExternal, safeHref } from './shared';

function Wrapper({ section, children }: { section: Section; children: React.ReactNode }) {
  return (
    <section id={section.section_key} className="py-24 px-6 bg-[#0D1117]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title={section.title} highlight={section.title_highlight} subtitle={section.subtitle} />
        {children}
      </div>
    </section>
  );
}

function Button({ label, link }: { label: string; link: string }) {
  if (!label || !link) return null;
  const external = isExternal(link);
  return (
    <a
      href={safeHref(link)}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FFC6] text-[#0D1117] rounded-lg font-semibold hover:bg-[#00FFC6]/90 transition-all"
    >
      {label}
      {external && <ExternalLink size={16} />}
    </a>
  );
}

const gridCols: Record<string, string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'md:grid-cols-3 lg:grid-cols-4',
};

/** Heading, paragraphs and an optional image (left, right or above). */
export function CustomText({ section }: { section: Section }) {
  const c = section.content;
  const paragraphs = list<string>(c.paragraphs).filter(Boolean);
  const image = text(c.image);
  const position = text(c.image_position, 'right');
  const words = (
    <div className="space-y-6">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-[#8B949E] text-lg leading-relaxed">
          <RichText value={p} />
        </p>
      ))}
      <Button label={text(c.button_label)} link={text(c.button_link)} />
    </div>
  );
  if (!image) return <Wrapper section={section}>{words}</Wrapper>;
  const picture = (
    <img
      src={image}
      alt={text(c.image_alt, section.title)}
      className="w-full max-h-[28rem] object-cover rounded-2xl border border-[#30363d]"
    />
  );
  return (
    <Wrapper section={section}>
      {position === 'top' ? (
        <div className="space-y-10">
          {picture}
          {words}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {position === 'left' ? (
            <>
              {picture}
              {words}
            </>
          ) : (
            <>
              {words}
              {picture}
            </>
          )}
        </div>
      )}
    </Wrapper>
  );
}

interface Card {
  title: string;
  text: string;
  image?: string;
  tags?: string[];
  link_url?: string;
  link_label?: string;
  hidden?: boolean;
}

/** A grid of cards, each with an optional image, tags and link. */
export function CustomCards({ section }: { section: Section }) {
  const c = section.content;
  const cards = visibleItems<Card>(c.cards);
  return (
    <Wrapper section={section}>
      {text(c.intro) && <p className="text-[#8B949E] text-lg mb-10 max-w-3xl">{text(c.intro)}</p>}
      <div className={`grid grid-cols-1 gap-6 ${gridCols[text(c.columns, '3')] ?? gridCols['3']}`}>
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-[#161B22] border border-[#30363d] rounded-xl overflow-hidden hover:border-[#00FFC6]/50 transition-all duration-300 flex flex-col"
          >
            {card.image && <img src={card.image} alt={card.title} className="w-full h-48 object-cover" />}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-[#C9D1D9] mb-3">{card.title}</h3>
              {card.text && (
                <p className="text-[#8B949E] leading-relaxed mb-4">
                  <RichText value={card.text} />
                </p>
              )}
              <div className="mt-auto flex flex-wrap items-center gap-2">
                {list<string>(card.tags)
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono text-[#8B949E] bg-[#21262d] px-3 py-1 rounded-full border border-[#30363d]"
                    >
                      {tag}
                    </span>
                  ))}
                {card.link_url && (
                  <a
                    href={safeHref(card.link_url)}
                    target={isExternal(card.link_url) ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-[#00FFC6] hover:text-[#00FFC6]/80"
                  >
                    {card.link_label || 'Learn more'}
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Wrapper>
  );
}

interface GalleryImage {
  image: string;
  caption?: string;
  hidden?: boolean;
}

/** A grid of images with captions. Clicking an image opens it full size. */
export function CustomGallery({ section }: { section: Section }) {
  const c = section.content;
  const images = visibleItems<GalleryImage>(c.images).filter((img) => img.image);
  return (
    <Wrapper section={section}>
      {text(c.intro) && <p className="text-[#8B949E] text-lg mb-10 max-w-3xl">{text(c.intro)}</p>}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${gridCols[text(c.columns, '3')] ?? gridCols['3']}`}>
        {images.map((img, i) => (
          <figure key={i} className="group">
            <a href={safeHref(img.image)} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-[#30363d]">
              <img
                src={img.image}
                alt={img.caption || section.title}
                loading="lazy"
                className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </a>
            {img.caption && <figcaption className="text-[#8B949E] text-sm mt-3">{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </Wrapper>
  );
}

interface TimelineEntry {
  date: string;
  title: string;
  subtitle?: string;
  text?: string;
  points?: string[];
  hidden?: boolean;
}

/** Dated entries on a vertical line, like Work Experience. */
export function CustomTimeline({ section }: { section: Section }) {
  const c = section.content;
  const entries = visibleItems<TimelineEntry>(c.entries);
  return (
    <Wrapper section={section}>
      {text(c.intro) && <p className="text-[#8B949E] text-lg mb-10 max-w-3xl">{text(c.intro)}</p>}
      <div className="relative">
        <div className="absolute left-0 md:left-8 top-0 bottom-0 w-0.5 bg-[#30363d]" />
        <div className="space-y-12">
          {entries.map((entry, i) => (
            <div key={i} className="relative pl-8 md:pl-24">
              <div className="absolute left-[-8px] md:left-[24px] top-2 w-4 h-4 bg-[#00FFC6] rounded-full border-4 border-[#0D1117]" />
              <div className="bg-[#161B22] border border-[#30363d] rounded-xl p-6 md:p-8 hover:border-[#00FFC6]/50 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-2xl font-bold text-[#C9D1D9] mb-1">{entry.title}</h3>
                    {entry.subtitle && <p className="text-[#00FFC6] font-semibold">{entry.subtitle}</p>}
                  </div>
                  {entry.date && (
                    <div className="flex items-center gap-2 text-[#8B949E] text-sm">
                      <Calendar size={16} />
                      <span>{entry.date}</span>
                    </div>
                  )}
                </div>
                {entry.text && (
                  <p className="text-[#8B949E] mt-4 leading-relaxed">
                    <RichText value={entry.text} />
                  </p>
                )}
                {list<string>(entry.points).filter(Boolean).length > 0 && (
                  <ul className="space-y-3 mt-6">
                    {list<string>(entry.points)
                      .filter(Boolean)
                      .map((point, idx) => (
                        <li key={idx} className="flex items-start text-[#8B949E]">
                          <span className="text-[#00FFC6] mr-3 mt-1.5">▹</span>
                          <span>{point}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Wrapper>
  );
}
