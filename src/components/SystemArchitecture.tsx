import { ArrowRight } from 'lucide-react';
import { text, visibleItems, type Section } from '../content/types';
import { SectionHeading } from './shared';

interface Layer {
  title: string;
  description: string;
  hidden?: boolean;
}

interface Stat {
  value: string;
  label: string;
  hidden?: boolean;
}

export default function SystemArchitecture({ section }: { section: Section }) {
  const c = section.content;
  const layers = visibleItems<Layer>(c.layers);
  const stats = visibleItems<Stat>(c.stats);

  return (
    <section id={section.section_key} className="py-24 px-6 bg-[#0D1117]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title={section.title} highlight={section.title_highlight} subtitle={section.subtitle} />

        <div className="bg-[#161B22] border border-[#30363d] rounded-2xl p-8 md:p-12">
          {text(c.diagram_title) && (
            <h3 className="text-2xl font-bold text-[#C9D1D9] mb-8 text-center">{text(c.diagram_title)}</h3>
          )}

          <div className="relative max-w-2xl mx-auto">
            {layers.map((layer, index) => (
              <div key={index} className="relative">
                <div className="bg-[#21262d] border border-[#30363d] rounded-xl p-6 hover:border-[#00FFC6]/50 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-[#C9D1D9] mb-1 group-hover:text-[#00FFC6] transition-colors">
                        {layer.title}
                      </h4>
                      <p className="text-[#8B949E] text-sm">{layer.description}</p>
                    </div>
                    <div className="w-10 h-10 bg-[#00FFC6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-[#00FFC6] font-mono text-sm">{index + 1}</span>
                    </div>
                  </div>
                </div>

                {index < layers.length - 1 && (
                  <div className="flex justify-center my-4">
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-[#00FFC6] to-[#58A6FF]" />
                      <ArrowRight className="text-[#00FFC6] rotate-90" size={20} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {stats.length > 0 && (
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              {stats.map((stat, index) => {
                const blue = index % 2 === 1;
                return (
                  <div
                    key={index}
                    className={`${blue ? 'bg-[#58A6FF]/5 border-[#58A6FF]/30' : 'bg-[#00FFC6]/5 border-[#00FFC6]/30'} border rounded-lg p-4 text-center`}
                  >
                    <p className={`${blue ? 'text-[#58A6FF]' : 'text-[#00FFC6]'} font-bold text-2xl mb-1`}>{stat.value}</p>
                    <p className="text-[#8B949E] text-sm">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
