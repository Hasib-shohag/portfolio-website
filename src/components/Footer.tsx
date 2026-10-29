import { Github, Linkedin, FileText } from 'lucide-react';
import type { SiteSettings } from '../content/types';
import { safeHref } from './shared';

export default function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="py-12 px-6 bg-[#0D1117] border-t border-[#30363d]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-[#C9D1D9] font-semibold mb-1">{settings.full_name}</p>
            <p className="text-[#8B949E] text-sm">{settings.copyright_text}</p>
          </div>

          <div className="flex items-center gap-4">
            {settings.github_url && (
              <a
                href={safeHref(settings.github_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#21262d] border border-[#30363d] rounded-lg flex items-center justify-center text-[#8B949E] hover:text-[#C9D1D9] hover:border-[#C9D1D9]/50 transition-all"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
            )}
            {settings.linkedin_url && (
              <a
                href={safeHref(settings.linkedin_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#21262d] border border-[#30363d] rounded-lg flex items-center justify-center text-[#8B949E] hover:text-[#58A6FF] hover:border-[#58A6FF]/50 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            )}
            {settings.cv_url && (
              <a
                href={safeHref(settings.cv_url)}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#21262d] border border-[#30363d] rounded-lg flex items-center justify-center text-[#8B949E] hover:text-[#00FFC6] hover:border-[#00FFC6]/50 transition-all"
                aria-label="Resume"
              >
                <FileText size={18} />
              </a>
            )}
          </div>
        </div>

        {settings.footer_tagline && (
          <div className="mt-8 pt-8 border-t border-[#30363d] text-center">
            <p className="text-[#8B949E] text-sm">{settings.footer_tagline}</p>
          </div>
        )}
      </div>
    </footer>
  );
}
