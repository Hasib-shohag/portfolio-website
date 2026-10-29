import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Code,
  Code2,
  Cpu,
  Database,
  Globe,
  GraduationCap,
  Heart,
  Layers,
  Lightbulb,
  Rocket,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Fragment } from 'react';

// Icons that can be picked in the admin panel (by name).
export const ICONS: Record<string, LucideIcon> = {
  Target,
  Code2,
  Code,
  BarChart3,
  Users,
  Workflow,
  Lightbulb,
  Layers,
  Wrench,
  Briefcase,
  Rocket,
  Shield,
  Database,
  Cpu,
  Globe,
  Zap,
  Star,
  Award,
  Heart,
  BookOpen,
  TrendingUp,
  GraduationCap,
};

export function Icon({ name, size = 24, className }: { name: unknown; size?: number; className?: string }) {
  const Component = (typeof name === 'string' && ICONS[name]) || Star;
  return <Component size={size} className={className} />;
}

/** Section title like "About Me", with the second part in the accent colour. */
export function SectionHeading({
  title,
  highlight,
  subtitle,
  gap = 'mb-16',
}: {
  title: string;
  highlight: string;
  subtitle?: string;
  gap?: string;
}) {
  return (
    <>
      <h2 className="text-4xl md:text-5xl font-bold text-[#C9D1D9] mb-4">
        {title}
        {title && highlight ? ' ' : ''}
        {highlight && <span className="text-[#00FFC6]">{highlight}</span>}
      </h2>
      <div className={`w-20 h-1 bg-[#00FFC6] ${subtitle ? 'mb-4' : gap}`} />
      {subtitle && <p className="text-[#8B949E] mb-16">{subtitle}</p>}
    </>
  );
}

/** Plain text where **double stars** make a word stand out. */
export function RichText({ value }: { value: string }) {
  const parts = value.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-[#C9D1D9] font-semibold">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

export const isExternal = (url: string) => /^https?:\/\//i.test(url);

// Only allow normal web, email, phone and on-page links (blocks javascript: and similar).
export const safeHref = (url: unknown, fallback = '#'): string => {
  const value = typeof url === 'string' ? url.trim() : '';
  return /^(https?:\/\/|mailto:|tel:|#|\/(?!\/))/i.test(value) ? value : fallback;
};
