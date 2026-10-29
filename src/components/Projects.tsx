import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Users, TrendingUp } from 'lucide-react';
import { list, visibleItems, type Section } from '../content/types';
import { SectionHeading, safeHref } from './shared';

interface Project {
  title: string;
  year: string;
  role: string;
  users: string;
  problem: string;
  solution: string;
  contributions: string[];
  impact: string;
  tags: string[];
  image?: string;
  link_url?: string;
  link_label?: string;
  hidden?: boolean;
}

export default function Projects({ section }: { section: Section }) {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const projects = visibleItems<Project>(section.content.projects);

  return (
    <section id={section.section_key} className="py-24 px-6 bg-[#0D1117]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title={section.title} highlight={section.title_highlight} subtitle={section.subtitle} />

        <div className="space-y-6">
          {projects.map((project, index) => {
            const isExpanded = expandedProject === index;
            const contributions = list<string>(project.contributions).filter(Boolean);
            const tags = list<string>(project.tags).filter(Boolean);
            return (
              <div
                key={index}
                className="bg-[#161B22] border border-[#30363d] rounded-xl overflow-hidden hover:border-[#00FFC6]/50 transition-all duration-300"
              >
                <button
                  onClick={() => setExpandedProject(isExpanded ? null : index)}
                  className="w-full p-6 md:p-8 text-left flex items-start justify-between gap-4"
                  aria-expanded={isExpanded}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-[#C9D1D9]">{project.title}</h3>
                      {project.year && (
                        <span className="text-[#8B949E] text-sm font-mono bg-[#21262d] px-3 py-1 rounded-full">
                          {project.year}
                        </span>
                      )}
                      {project.users && (
                        <span className="text-[#00FFC6] text-sm font-mono bg-[#00FFC6]/10 px-3 py-1 rounded-full border border-[#00FFC6]/30 flex items-center gap-1">
                          <Users size={14} />
                          {project.users}
                        </span>
                      )}
                    </div>
                    {project.role && <p className="text-[#58A6FF] font-semibold mb-3">{project.role}</p>}
                    <p className="text-[#8B949E]">{project.problem}</p>
                  </div>
                  <div className="text-[#00FFC6] flex-shrink-0">
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-6 animate-fadeIn">
                    <div className="h-px bg-[#30363d] mb-6" />

                    {project.image && (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full max-h-96 object-cover rounded-lg border border-[#30363d]"
                      />
                    )}

                    {project.solution && (
                      <div>
                        <h4 className="text-[#C9D1D9] font-semibold mb-2 flex items-center gap-2">
                          <span className="text-[#00FFC6]">◆</span> Solution
                        </h4>
                        <p className="text-[#8B949E] pl-6">{project.solution}</p>
                      </div>
                    )}

                    {contributions.length > 0 && (
                      <div>
                        <h4 className="text-[#C9D1D9] font-semibold mb-3 flex items-center gap-2">
                          <span className="text-[#00FFC6]">◆</span> Key Contributions
                        </h4>
                        <ul className="grid md:grid-cols-2 gap-2 pl-6">
                          {contributions.map((contribution, idx) => (
                            <li key={idx} className="flex items-start text-[#8B949E]">
                              <span className="text-[#00FFC6] mr-2">▹</span>
                              <span>{contribution}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {project.impact && (
                      <div className="bg-[#00FFC6]/5 border border-[#00FFC6]/30 rounded-lg p-4">
                        <h4 className="text-[#C9D1D9] font-semibold mb-2 flex items-center gap-2">
                          <TrendingUp className="text-[#00FFC6]" size={18} />
                          Impact
                        </h4>
                        <p className="text-[#8B949E]">{project.impact}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-mono text-[#8B949E] bg-[#21262d] px-3 py-1 rounded-full border border-[#30363d]"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.link_url && (
                        <a
                          href={safeHref(project.link_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-[#00FFC6] hover:text-[#00FFC6]/80"
                        >
                          {project.link_label || 'View project'}
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
