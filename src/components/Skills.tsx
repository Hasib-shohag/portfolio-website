import { list, visibleItems, type Section } from '../content/types';
import { Icon, SectionHeading } from './shared';

interface SkillGroup {
  icon: string;
  title: string;
  skills: string[];
  hidden?: boolean;
}

export default function Skills({ section }: { section: Section }) {
  const groups = visibleItems<SkillGroup>(section.content.categories);

  return (
    <section id={section.section_key} className="py-24 px-6 bg-[#0D1117]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title={section.title} highlight={section.title_highlight} subtitle={section.subtitle} />

        <div className="grid md:grid-cols-3 gap-8">
          {groups.map((group, i) => (
            <div
              key={i}
              className="bg-[#161B22] border border-[#30363d] rounded-xl p-8 hover:border-[#00FFC6]/50 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-[#00FFC6]/10 rounded-xl flex items-center justify-center mb-6">
                <Icon name={group.icon} className="text-[#00FFC6]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#C9D1D9] mb-6">{group.title}</h3>
              <div className="flex flex-wrap gap-2">
                {list<string>(group.skills)
                  .filter(Boolean)
                  .map((skill) => (
                    <span
                      key={skill}
                      className="text-sm text-[#8B949E] bg-[#21262d] px-3 py-2 rounded-lg border border-[#30363d] hover:border-[#00FFC6]/30 hover:text-[#C9D1D9] transition-all"
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
