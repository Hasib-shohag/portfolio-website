import { useState, useEffect, useMemo } from 'react';
import { Download, Mail, ArrowDown } from 'lucide-react';
import { list, text, type Section, type SiteSettings } from '../content/types';
import { safeHref } from './shared';

export default function Hero({ section, settings }: { section: Section; settings: SiteSettings }) {
  const c = section.content;
  const phrases = useMemo(() => list<string>(c.typing_phrases).filter(Boolean), [c.typing_phrases]);
  const [typedText, setTypedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (phrases.length === 0) return;
    const currentPhrase = phrases[phraseIndex % phrases.length];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (typedText.length < currentPhrase.length) {
            setTypedText(currentPhrase.slice(0, typedText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (typedText.length > 0) {
            setTypedText(currentPhrase.slice(0, typedText.length - 1));
          } else {
            setIsDeleting(false);
            setPhraseIndex((phraseIndex + 1) % phrases.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [typedText, phraseIndex, isDeleting, phrases]);

  const background = text(c.background_image);
  const badge = text(c.badge);
  const primaryLabel = text(c.primary_button_label);
  const resumeLabel = text(c.resume_button_label);
  const contactLabel = text(c.contact_button_label);
  const scrollLabel = text(c.scroll_label);

  return (
    <section id={section.section_key} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#0D1117]">
        {background && (
          <img src={background} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(0, 255, 198, 0.1)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FFC6]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#58A6FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {badge && (
          <div className="mb-6 inline-block">
            <span className="text-[#00FFC6] text-sm font-mono bg-[#00FFC6]/10 px-4 py-2 rounded-full border border-[#00FFC6]/30">
              {badge}
            </span>
          </div>
        )}

        <h1 className="text-5xl md:text-7xl font-bold text-[#C9D1D9] mb-6 leading-tight">
          {text(c.name, settings.full_name)}
        </h1>

        {phrases.length > 0 && (
          <div className="h-20 mb-8">
            <p className="text-xl md:text-2xl text-[#8B949E] font-mono">
              <span className="text-[#00FFC6]">&gt;</span> {typedText}
              <span className="inline-block w-0.5 h-6 bg-[#00FFC6] ml-1 animate-pulse" />
            </p>
          </div>
        )}

        <p className="text-lg md:text-xl text-[#8B949E] max-w-3xl mx-auto mb-12 leading-relaxed">
          {text(c.intro)}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {primaryLabel && (
            <a
              href={safeHref(text(c.primary_button_link, '#projects'), '#projects')}
              className="px-8 py-3 bg-[#00FFC6] text-[#0D1117] rounded-lg font-semibold hover:bg-[#00FFC6]/90 transition-all transform hover:scale-105"
            >
              {primaryLabel}
            </a>
          )}
          {resumeLabel && settings.cv_url && (
            <a
              href={safeHref(settings.cv_url)}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-[#21262d] text-[#C9D1D9] rounded-lg font-semibold hover:bg-[#30363d] transition-all border border-[#30363d] flex items-center gap-2"
            >
              <Download size={18} />
              {resumeLabel}
            </a>
          )}
          {contactLabel && (
            <a
              href="#contact"
              className="px-8 py-3 bg-[#58A6FF]/10 text-[#58A6FF] rounded-lg font-semibold hover:bg-[#58A6FF]/20 transition-all border border-[#58A6FF]/30 flex items-center gap-2"
            >
              <Mail size={18} />
              {contactLabel}
            </a>
          )}
        </div>

        {scrollLabel && (
          <a
            href="#about"
            className="inline-flex flex-col items-center text-[#8B949E] hover:text-[#00FFC6] transition-colors animate-bounce"
          >
            <span className="text-sm mb-2">{scrollLabel}</span>
            <ArrowDown size={20} />
          </a>
        )}
      </div>
    </section>
  );
}
