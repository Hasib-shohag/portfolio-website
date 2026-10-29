import { list, text, visibleItems, type Section } from '../content/types';
import { Icon, RichText, SectionHeading } from './shared';

interface Strength {
  icon: string;
  title: string;
  description: string;
  hidden?: boolean;
}

export default function About({ section }: { section: Section }) {
  const c = section.content;
  const paragraphs = list<string>(c.paragraphs).filter(Boolean);
  const focusItems = list<string>(c.focus_items).filter(Boolean);
  const strengths = visibleItems<Strength>(c.strengths);
  const photo = text(c.photo);

  return (
    <section id={section.section_key} className="py-24 px-6 bg-[#0D1117]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title={section.title} highlight={section.title_highlight} subtitle={section.subtitle} gap="mb-12" />

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="text-[#8B949E] text-lg leading-relaxed">
                <RichText value={paragraph} />
              </p>
            ))}
          </div>

          <div className="space-y-6">
            {photo && (
              <img
                src={photo}
                alt={section.title}
                className="w-full max-h-96 object-cover rounded-2xl border border-[#30363d]"
              />
            )}
            {focusItems.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 bg-[#00FFC6]/5 rounded-2xl blur-xl" />
                <div className="relative bg-[#161B22] border border-[#30363d] rounded-2xl p-8">
                  <h3 className="text-[#00FFC6] font-semibold mb-4 font-mono text-sm">{text(c.focus_title)}</h3>
                  <ul className="space-y-3">
                    {focusItems.map((item, i) => (
                      <li key={i} className="flex items-start text-[#8B949E]">
                        <span className="text-[#00FFC6] mr-3 mt-1">▹</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strengths.map((strength, i) => (
            <div
              key={i}
              className="group relative bg-[#161B22]/50 backdrop-blur-sm border border-[#30363d] rounded-xl p-6 hover:border-[#00FFC6]/50 transition-all duration-300 hover:transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00FFC6]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-[#00FFC6]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#00FFC6]/20 transition-colors">
                  <Icon name={strength.icon} className="text-[#00FFC6]" size={24} />
                </div>
                <h3 className="text-[#C9D1D9] font-semibold mb-2">{strength.title}</h3>
                <p className="text-[#8B949E] text-sm">{strength.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
