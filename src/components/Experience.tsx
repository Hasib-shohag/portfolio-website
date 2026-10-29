import { Briefcase, Calendar } from 'lucide-react';
import { list, visibleItems, type Section } from '../content/types';
import { SectionHeading } from './shared';

interface Job {
  company: string;
  location: string;
  role: string;
  period: string;
  points: string[];
  logo?: string;
  hidden?: boolean;
}

export default function Experience({ section }: { section: Section }) {
  const jobs = visibleItems<Job>(section.content.entries);

  return (
    <section id={section.section_key} className="py-24 px-6 bg-[#0D1117]">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title={section.title} highlight={section.title_highlight} subtitle={section.subtitle} />

        <div className="relative">
          <div className="absolute left-0 md:left-8 top-0 bottom-0 w-0.5 bg-[#30363d]" />

          <div className="space-y-12">
            {jobs.map((job, index) => (
              <div key={index} className="relative pl-8 md:pl-24">
                <div className="absolute left-[-8px] md:left-[24px] top-2 w-4 h-4 bg-[#00FFC6] rounded-full border-4 border-[#0D1117]" />

                <div className="bg-[#161B22] border border-[#30363d] rounded-xl p-6 md:p-8 hover:border-[#00FFC6]/50 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {job.logo && (
                        <img
                          src={job.logo}
                          alt={job.company}
                          className="w-12 h-12 rounded-lg object-contain bg-white/5 border border-[#30363d] p-1"
                        />
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-[#C9D1D9] mb-1">{job.company}</h3>
                        {job.location && <p className="text-[#8B949E] text-sm mb-2">{job.location}</p>}
                        <p className="text-[#00FFC6] font-semibold flex items-center gap-2">
                          <Briefcase size={16} />
                          {job.role}
                        </p>
                      </div>
                    </div>
                    {job.period && (
                      <div className="flex items-center gap-2 text-[#8B949E] text-sm mt-2 md:mt-0">
                        <Calendar size={16} />
                        <span>{job.period}</span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mt-6">
                    {list<string>(job.points)
                      .filter(Boolean)
                      .map((point, idx) => (
                        <li key={idx} className="flex items-start text-[#8B949E]">
                          <span className="text-[#00FFC6] mr-3 mt-1.5">▹</span>
                          <span>{point}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
