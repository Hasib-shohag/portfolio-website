import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import ProductThinking from './components/ProductThinking';
import SystemArchitecture from './components/SystemArchitecture';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { CustomCards, CustomGallery, CustomText, CustomTimeline } from './components/CustomSections';
import { useSiteContent } from './content/useSiteContent';
import type { BlogPost, Section, SiteSettings } from './content/types';

function renderSection(section: Section, settings: SiteSettings, posts: BlogPost[]) {
  const key = section.id ?? section.section_key;
  switch (section.kind) {
    case 'hero':
      return <Hero key={key} section={section} settings={settings} />;
    case 'about':
      return <About key={key} section={section} />;
    case 'experience':
      return <Experience key={key} section={section} />;
    case 'projects':
      return <Projects key={key} section={section} />;
    case 'skills':
      return <Skills key={key} section={section} />;
    case 'product_thinking':
      return <ProductThinking key={key} section={section} />;
    case 'system_architecture':
      return <SystemArchitecture key={key} section={section} />;
    case 'blog':
      return <Blog key={key} section={section} posts={posts} />;
    case 'contact':
      return <Contact key={key} section={section} settings={settings} />;
    case 'custom_text':
      return <CustomText key={key} section={section} />;
    case 'custom_cards':
      return <CustomCards key={key} section={section} />;
    case 'custom_gallery':
      return <CustomGallery key={key} section={section} />;
    case 'custom_timeline':
      return <CustomTimeline key={key} section={section} />;
    default:
      return null;
  }
}

function App() {
  const { status, settings, sections, posts } = useSiteContent();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center" aria-busy="true">
        <span className="text-2xl font-bold text-[#00FFC6] animate-pulse">{settings.brand_initials}</span>
      </div>
    );
  }

  const links = sections
    .filter((s) => s.menu_label)
    .map((s) => ({ label: s.menu_label as string, href: `#${s.section_key}` }));

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <Navigation brand={settings.brand_initials} links={links} />
      {sections.map((section) => renderSection(section, settings, posts))}
      <Footer settings={settings} />
    </div>
  );
}

export default App;
