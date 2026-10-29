-- Portfolio website (Vercel version): complete database setup
-- Run this once in a new project. Safe to run again: it only adds what is missing,
-- refreshes the security rules and never overwrites content you edited in the admin panel.

-- PART A. Blog posts and contact messages: tables, spam guard and descriptions

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  tags text[] DEFAULT '{}'::text[]
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON blog_posts TO anon, authenticated;
GRANT INSERT ON contact_submissions TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Validated contact form submissions" ON contact_submissions;
CREATE POLICY "Validated contact form submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (
    email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
    AND length(name) > 0
    AND length(name) <= 200
    AND length(email) <= 255
    AND length(message) > 10
    AND length(message) <= 5000
  );


DROP TRIGGER IF EXISTS contact_submissions_rate_limit ON contact_submissions;
DROP FUNCTION IF EXISTS check_contact_rate_limit();

CREATE FUNCTION check_contact_rate_limit()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM contact_submissions
    WHERE email = NEW.email
    AND created_at > now() - interval '1 hour'
  ) THEN
    RAISE EXCEPTION 'Too many submissions from this email. Please try again later.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER contact_submissions_rate_limit
BEFORE INSERT ON contact_submissions
FOR EACH ROW
EXECUTE FUNCTION check_contact_rate_limit();

-- Plain-English descriptions (shown in the Table Editor)
COMMENT ON TABLE public.blog_posts IS 'Blog posts for the "Product Notes" section of the website. Only rows with published = true appear on the site.';
COMMENT ON COLUMN public.blog_posts.title IS 'Post title shown on the blog card';
COMMENT ON COLUMN public.blog_posts.slug IS 'Short unique web name for the post, e.g. fintech-pm-metrics';
COMMENT ON COLUMN public.blog_posts.excerpt IS 'One-line summary shown on the blog card';
COMMENT ON COLUMN public.blog_posts.content IS 'Full article text';
COMMENT ON COLUMN public.blog_posts.published IS 'true = visible on the website, false = draft';
COMMENT ON COLUMN public.blog_posts.published_at IS 'Date shown on the blog card; newest posts appear first';
COMMENT ON COLUMN public.blog_posts.tags IS 'Topic labels shown on the card, e.g. {Fintech,"API Design"}';
COMMENT ON TABLE public.contact_submissions IS 'Messages sent through the website contact form. Tick "read" once you have replied.';
COMMENT ON COLUMN public.contact_submissions.name IS 'Name the visitor typed';
COMMENT ON COLUMN public.contact_submissions.email IS 'Email address to reply to';
COMMENT ON COLUMN public.contact_submissions.message IS 'The message text';
COMMENT ON COLUMN public.contact_submissions.read IS 'Tick after you have replied';
COMMENT ON FUNCTION public.check_contact_rate_limit() IS 'Spam guard: allows one message per email address per hour';

-- PART B. Website content manager (CMS): admin list, settings, sections, media storage and starting content

-- 1. Admin list: only accounts listed here can change the website.
CREATE TABLE IF NOT EXISTS public.admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Keeps "last changed" times up to date.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Site settings: one row with your name, links and CV.
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  full_name text NOT NULL DEFAULT '',
  brand_initials text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  linkedin_url text NOT NULL DEFAULT '',
  github_url text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  cv_url text NOT NULL DEFAULT '',
  footer_tagline text NOT NULL DEFAULT '',
  copyright_text text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Sections: every block on the page, in order.
CREATE TABLE IF NOT EXISTS public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE CHECK (section_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind text NOT NULL CHECK (kind IN ('hero', 'about', 'experience', 'projects', 'skills', 'product_thinking', 'system_architecture', 'blog', 'contact', 'custom_text', 'custom_cards', 'custom_gallery', 'custom_timeline')),
  title text NOT NULL DEFAULT '',
  title_highlight text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  menu_label text,
  position integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  content jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(content) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS sections_position_idx ON public.sections (position);

-- 4. Blog posts: cover image and "read on another site" link.
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS external_url text;

DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS sections_updated_at ON public.sections;
CREATE TRIGGER sections_updated_at BEFORE UPDATE ON public.sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Who can do what. Visitors can only read what is published and send contact messages.
REVOKE ALL ON public.admins, public.site_settings, public.sections, public.blog_posts, public.contact_submissions FROM anon, authenticated;
GRANT SELECT ON public.site_settings, public.sections, public.blog_posts TO anon;
GRANT INSERT ON public.contact_submissions TO anon;
GRANT SELECT ON public.admins TO authenticated;
GRANT SELECT, UPDATE ON public.site_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sections, public.blog_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_submissions TO authenticated;

DROP POLICY IF EXISTS "Admins can see their own admin row" ON public.admins;
CREATE POLICY "Admins can see their own admin row" ON public.admins
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can read the site settings" ON public.site_settings;
CREATE POLICY "Anyone can read the site settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins can change the site settings" ON public.site_settings;
CREATE POLICY "Admins can change the site settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can read visible sections" ON public.sections;
CREATE POLICY "Anyone can read visible sections" ON public.sections
  FOR SELECT TO anon, authenticated USING (is_visible = true);
DROP POLICY IF EXISTS "Admins can manage sections" ON public.sections;
CREATE POLICY "Admins can manage sections" ON public.sections
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can read messages" ON public.contact_submissions;
CREATE POLICY "Admins can read messages" ON public.contact_submissions
  FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can mark messages as read" ON public.contact_submissions;
CREATE POLICY "Admins can mark messages as read" ON public.contact_submissions
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete messages" ON public.contact_submissions;
CREATE POLICY "Admins can delete messages" ON public.contact_submissions
  FOR DELETE TO authenticated USING (public.is_admin());

-- 6. Image and file storage ("site-media"): anyone can view, only admins can add, list or delete.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('site-media', 'site-media', true, 10485760,
        ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Admins can list website media" ON storage.objects;
CREATE POLICY "Admins can list website media" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'site-media' AND public.is_admin());
DROP POLICY IF EXISTS "Admins can upload website media" ON storage.objects;
CREATE POLICY "Admins can upload website media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-media' AND public.is_admin());
DROP POLICY IF EXISTS "Admins can replace website media" ON storage.objects;
CREATE POLICY "Admins can replace website media" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'site-media' AND public.is_admin())
  WITH CHECK (bucket_id = 'site-media' AND public.is_admin());
DROP POLICY IF EXISTS "Admins can delete website media" ON storage.objects;
CREATE POLICY "Admins can delete website media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'site-media' AND public.is_admin());

-- 7. Plain-English descriptions (shown in the Table Editor)
COMMENT ON TABLE public.admins IS 'Accounts allowed to use the admin panel. Add a row here (via SQL) after creating the login under Authentication.';
COMMENT ON COLUMN public.admins.user_id IS 'The login (from Authentication > Users)';
COMMENT ON COLUMN public.admins.email IS 'Email of that login, for your reference';
COMMENT ON FUNCTION public.is_admin() IS 'True when the signed-in account is listed in admins';
COMMENT ON FUNCTION public.set_updated_at() IS 'Fills in updated_at whenever a row changes';
COMMENT ON TABLE public.site_settings IS 'Your name, links and CV used across the website (one row). Edit it in the admin panel under Site settings.';
COMMENT ON COLUMN public.site_settings.full_name IS 'Your name, shown in the footer';
COMMENT ON COLUMN public.site_settings.brand_initials IS 'Initials at the top left of the menu bar';
COMMENT ON COLUMN public.site_settings.email IS 'Email shown in the Contact section';
COMMENT ON COLUMN public.site_settings.linkedin_url IS 'LinkedIn profile address';
COMMENT ON COLUMN public.site_settings.github_url IS 'GitHub profile address';
COMMENT ON COLUMN public.site_settings.location IS 'Location shown in the Contact section';
COMMENT ON COLUMN public.site_settings.cv_url IS 'Address of your CV (PDF) used by the Download CV buttons';
COMMENT ON COLUMN public.site_settings.footer_tagline IS 'Line of text in the footer';
COMMENT ON COLUMN public.site_settings.copyright_text IS 'Copyright line at the very bottom';
COMMENT ON TABLE public.sections IS 'Every block on the website page, top to bottom by position. Edit them in the admin panel under Website sections.';
COMMENT ON COLUMN public.sections.section_key IS 'Web address name of the section, e.g. about (the page jumps to #about)';
COMMENT ON COLUMN public.sections.kind IS 'Section type: one of the built-in sections or custom_text, custom_cards, custom_gallery, custom_timeline';
COMMENT ON COLUMN public.sections.title IS 'Heading, first part (white)';
COMMENT ON COLUMN public.sections.title_highlight IS 'Heading, coloured last part';
COMMENT ON COLUMN public.sections.subtitle IS 'Small text under the heading';
COMMENT ON COLUMN public.sections.menu_label IS 'Name in the top menu; empty = not in the menu';
COMMENT ON COLUMN public.sections.position IS 'Order on the page; smaller numbers come first';
COMMENT ON COLUMN public.sections.is_visible IS 'true = shown on the website, false = hidden';
COMMENT ON COLUMN public.sections.content IS 'The section''s text, lists and images (edited with the admin panel forms)';
COMMENT ON COLUMN public.blog_posts.cover_image_url IS 'Optional picture shown at the top of the blog card';
COMMENT ON COLUMN public.blog_posts.external_url IS 'Optional link: the card opens this address (e.g. your LinkedIn or Medium article)';

-- 8. Starting content (added only when missing; your later edits are never overwritten)
INSERT INTO public.site_settings (id, full_name, brand_initials, email, linkedin_url, github_url, location, cv_url, footer_tagline, copyright_text)
VALUES (1, 'Md Hasibul Hossain', 'MH', 'hasibcuetmie.pm@gmail.com', 'https://www.linkedin.com/in/hasibcuetmie/', 'https://github.com/Hasib-shohag', 'Dhaka, Bangladesh', 'https://github.com/Hasib-shohag/Resume/raw/8b72e2f0fe38caff46085d7c3a60420e602706c5/CV_Md_Hasibul_Hossain_PM.pdf', 'A product person who understands coding but love to build product which creates impact', '© 2026 All rights reserved.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sections (section_key, kind, title, title_highlight, subtitle, menu_label, position, is_visible, content)
VALUES ('home', 'hero', '', '', '', NULL, 10, true,
  $json${"badge": "Product Manager | Project Manager", "name": "Md Hasibul Hossain", "typing_phrases": ["Defining product strategy for fintech platforms", "Leading cross-functional product execution", "Scaling data-driven SaaS products"], "intro": "Building scalable fintech and SaaS products by aligning business strategy, user needs, and engineering systems.", "primary_button_label": "View Projects", "primary_button_link": "#projects", "resume_button_label": "Download Resume", "contact_button_label": "Contact", "scroll_label": "Scroll to explore", "background_image": ""}$json$::jsonb)
ON CONFLICT (section_key) DO NOTHING;

INSERT INTO public.sections (section_key, kind, title, title_highlight, subtitle, menu_label, position, is_visible, content)
VALUES ('about', 'about', 'About', 'Me', '', 'About', 20, true,
  $json${"paragraphs": ["I'm **Md Hasibul Hossain**, a Product and Project Manager experienced in delivering scalable digital platforms. I lead cross-functional teams to turn complex business problems into structured, user-focused products, combining roadmap planning, agile execution, and KPI-driven decision making.", "My work spans SaaS and platform systems, with technical expertise in AI-driven products, large language models, agentic AI workflows, tokenization, embeddings, and API-driven architectures.", "I thrive at the intersection of strategy, execution, and emerging technologies, building impactful products that scale reliably."], "photo": "", "focus_title": "Core Focus Areas", "focus_items": ["Product Roadmap Ownership", "PRD and SRS Writing", "KPI Monitoring & Analytics", "AI-Driven Product Features", "Cross-functional Product Execution", "System Workflow Planning", "API Integration Feasibility"], "strengths": [{"icon": "Target", "title": "Product Roadmap Ownership", "description": "Strategic planning and execution", "hidden": false}, {"icon": "Code2", "title": "PRD & SRS Writing", "description": "Technical documentation excellence", "hidden": false}, {"icon": "BarChart3", "title": "KPI Monitoring", "description": "Data-driven decision making", "hidden": false}, {"icon": "Users", "title": "AI-Driven Product Features", "description": "LLMs, Agentic AI, Embeddings, Tokenization", "hidden": false}, {"icon": "Workflow", "title": "Cross-functional Execution", "description": "Team collaboration and delivery", "hidden": false}, {"icon": "Lightbulb", "title": "System Workflow Planning", "description": "Architecture and integration", "hidden": false}]}$json$::jsonb)
ON CONFLICT (section_key) DO NOTHING;

INSERT INTO public.sections (section_key, kind, title, title_highlight, subtitle, menu_label, position, is_visible, content)
VALUES ('experience', 'experience', 'Work', 'Experience', '', 'Experience', 30, true,
  $json${"entries": [{"company": "Brain Station 23 PLC", "location": "Dhaka, Bangladesh", "role": "Project Manager", "period": "2024 – Present", "points": ["Led end-to-end delivery of digital banking, AI ATS Platform, AI Ride Planner and Micro credit platforms", "Converted strategic goals into PRDs, SRS documents, and user stories", "Managed product roadmap execution with engineering, design, QA, and operations teams", "Managed stakeholders at all levels, including CXOs internally and external partners across multiple verticals", "Supported system architecture workflows and API integrations", "Conducted post-release evaluations to improve system scalability"], "logo": "", "hidden": false}, {"company": "TS4U LLC", "location": "Michigan, USA", "role": "Product Manager", "period": "2023 – 2024", "points": ["Owned full product lifecycle for SaaS platforms", "Defined product vision and roadmap", "Conducted user research and market validation", "Collaborated with engineering and design teams to improve usability", "Led agile ceremonies and sprint planning", "Delivered features improving user engagement and retention"], "logo": "", "hidden": false}, {"company": "Dekko Legacy Group", "location": "Dhaka, Bangladesh", "role": "Executive – Sales & Marketing", "period": "2022", "points": ["Supported pipeline and sales operations", "Generated market insights to improve revenue opportunities", "Coordinated with production and planning teams to improve workflow efficiency"], "logo": "", "hidden": false}]}$json$::jsonb)
ON CONFLICT (section_key) DO NOTHING;

INSERT INTO public.sections (section_key, kind, title, title_highlight, subtitle, menu_label, position, is_visible, content)
VALUES ('projects', 'projects', 'Key', 'Projects', '', 'Projects', 40, true,
  $json${"projects": [{"title": "Digital Banking Platform", "year": "2024-2025", "role": "Project Manager", "users": "220K+", "problem": "Bank needed a reliable internet banking for retail and corporate and loan platform with scalable microservice transition from monolith architecture.", "solution": "Delivered two digital banking platforms with integrated loan modules and scalable backend architecture.", "contributions": ["Project planning execution", "SRS Writing and API integration feasibility", "Internal and External team management and CPI verification", "Pre and Post-release Checklist and release coordination"], "impact": "Reduced system rework by 20% through better requirement analysis and sprint planning.", "tags": ["Fintech", "Digital Banking", "Retail", "Corporate"], "image": "", "link_url": "", "link_label": "", "hidden": false}, {"title": "AI Ride-Share Microfinance Platform", "year": "2025", "role": "Product Manager", "users": "", "problem": "Ride-share drivers struggle to find rides and access financing due to lack of credit scoring.", "solution": "Platform enabling AI-based location wise ride planning with credit scoring and loan accessibility for ride-share drivers.", "contributions": ["Managed product roadmap", "Technical workflow design", "AI credit scoring integration", "Financial analytics implementation"], "impact": "AI Based personalized trips planning and Improved financing accessibility for underserved ride-share driver segment.", "tags": ["AI", "Ride Share", "Fintech", "Credit Scoring"], "image": "", "link_url": "", "link_label": "", "hidden": false}, {"title": "Credit-Based E-Commerce & Microfinance Platform", "year": "2024-2025", "role": "Product Manager", "users": "100k+", "problem": "Unengaged in banking domain RMG workers needed flexible credit options.", "solution": "Designed a credit-enabled marketplace combining loans, savings, investments, and product EMIs.", "contributions": ["Product strategy and User journey establishment", "Technical workflow design", "Credit integration roadmap", "Multi-product feature planning"], "impact": "Enabled seamless credit access within e-commerce ecosystem.", "tags": ["E-commerce", "Credit", "Microfinance", "e-KYC", "Loan"], "image": "", "link_url": "", "link_label": "", "hidden": false}, {"title": "Project Management SaaS Platform", "year": "2024", "role": "Product Manager", "users": "50k", "problem": "Development teams needed better workflow tracking, testing, communication through chats and automation.", "solution": "Internal platform supporting automated testing, configurable roles, and user story execution with ticketing based chat feature.", "contributions": ["Automated testing workflows", "Role-based access control", "User story execution system", "Workflow tracking features"], "impact": "Improved development team productivity and sprint delivery rates.", "tags": ["SaaS", "Project Management", "Automation", "Chatbot"], "image": "", "link_url": "", "link_label": "", "hidden": false}]}$json$::jsonb)
ON CONFLICT (section_key) DO NOTHING;

INSERT INTO public.sections (section_key, kind, title, title_highlight, subtitle, menu_label, position, is_visible, content)
VALUES ('skills', 'skills', 'Skills &', 'Expertise', '', 'Skills', 50, true,
  $json${"categories": [{"icon": "Layers", "title": "Product Management", "skills": ["Product Roadmapping", "PRD Writing", "KPI Monitoring", "User Funnel Analysis", "Product Market Fit"], "hidden": false}, {"icon": "Code", "title": "Technical Understanding", "skills": ["System Architecture Thinking", "API Design & Integration", "SaaS Platform Design", "Digital Banking & Credit System", "AI-Driven Systems", "Tokenization & Embeddings", "Cross-Functional Technical Collaboration"], "hidden": false}, {"icon": "Wrench", "title": "Tools & Platforms", "skills": ["Jira", "Power BI", "Excel", "Figma", "GitHub", "Notion", "Miro", "GA4", "Python", "Grafana", "SQL", "Claude Code", "Gamma", "Lucidchart"], "hidden": false}]}$json$::jsonb)
ON CONFLICT (section_key) DO NOTHING;

INSERT INTO public.sections (section_key, kind, title, title_highlight, subtitle, menu_label, position, is_visible, content)
VALUES ('product-thinking', 'product_thinking', 'How I Build', 'Products', '', NULL, 60, true,
  $json${"steps_title": "Product Framework", "steps": [{"title": "User Problem", "description": "Identify pain points through research", "hidden": false}, {"title": "Product Hypothesis", "description": "Define solution assumptions", "hidden": false}, {"title": "MVP Build", "description": "Ship minimum viable solution", "hidden": false}, {"title": "Experiment & Metrics", "description": "Measure and analyze performance", "hidden": false}, {"title": "Iteration", "description": "Optimize based on data", "hidden": false}], "metrics_title": "Key Metrics I Track", "metrics": [{"title": "Activation Rate", "description": "User onboarding success", "hidden": false}, {"title": "User Retention", "description": "Long-term engagement", "hidden": false}, {"title": "Conversion Rate", "description": "Funnel optimization", "hidden": false}, {"title": "Revenue per User", "description": "Monetization efficiency", "hidden": false}], "quote": "I combine quantitative metrics with qualitative insights to make informed product decisions that balance user value with business impact."}$json$::jsonb)
ON CONFLICT (section_key) DO NOTHING;

INSERT INTO public.sections (section_key, kind, title, title_highlight, subtitle, menu_label, position, is_visible, content)
VALUES ('system-architecture', 'system_architecture', 'System', 'Architecture', '', NULL, 70, true,
  $json${"diagram_title": "Digital Banking Transaction Flow", "layers": [{"title": "User App", "description": "Web & Mobile Interface", "hidden": false}, {"title": "API Gateway", "description": "Request routing & auth", "hidden": false}, {"title": "Authentication Service", "description": "Identity & access control", "hidden": false}, {"title": "Transaction Processor", "description": "Business logic layer", "hidden": false}, {"title": "Banking Network", "description": "External integrations", "hidden": false}, {"title": "Settlement Layer", "description": "Final transaction settlement", "hidden": false}], "stats": [{"value": "220K+", "label": "Active Users", "hidden": false}, {"value": "20%", "label": "Reduced Rework", "hidden": false}, {"value": "99.9%", "label": "System Uptime", "hidden": false}]}$json$::jsonb)
ON CONFLICT (section_key) DO NOTHING;

INSERT INTO public.sections (section_key, kind, title, title_highlight, subtitle, menu_label, position, is_visible, content)
VALUES ('blog', 'blog', 'Product', 'Notes', 'Insights on product thinking, fintech systems, and building scalable platforms.', 'Blog', 80, true,
  $json${"max_posts": 4, "empty_message": "New articles are on the way."}$json$::jsonb)
ON CONFLICT (section_key) DO NOTHING;

INSERT INTO public.sections (section_key, kind, title, title_highlight, subtitle, menu_label, position, is_visible, content)
VALUES ('contact', 'contact', 'Get In', 'Touch', '', 'Contact', 90, true,
  $json${"connect_title": "Let's Connect", "connect_text": "I'm always interested in discussing product opportunities, fintech innovation, and building scalable platforms. Feel free to reach out.", "show_form": true, "button_label": "Send Message", "success_message": "Message sent successfully! I'll get back to you soon."}$json$::jsonb)
ON CONFLICT (section_key) DO NOTHING;

INSERT INTO public.blog_posts (title, slug, excerpt, content, published, published_at, tags, cover_image_url, external_url)
VALUES ('Why Banking Systems Still Use SOAP APIs', 'banking-soap-apis', 'Understanding legacy integration patterns in modern fintech and the gradual migration to REST.', 'Understanding legacy integration patterns in modern fintech and the gradual migration to REST.', true, '2026-02-15'::timestamptz, ARRAY['Fintech', 'API Design']::text[], NULL, NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.blog_posts (title, slug, excerpt, content, published, published_at, tags, cover_image_url, external_url)
VALUES ('Product Metrics Every Fintech PM Should Track', 'fintech-pm-metrics', 'Essential KPIs for measuring success in digital banking and financial platforms.', 'Essential KPIs for measuring success in digital banking and financial platforms.', true, '2026-01-28'::timestamptz, ARRAY['Product Management', 'Metrics']::text[], NULL, NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.blog_posts (title, slug, excerpt, content, published, published_at, tags, cover_image_url, external_url)
VALUES ('Building Scalable Credit Platforms', 'scalable-credit-platforms', 'Architectural considerations for designing credit systems that can handle millions of users.', 'Architectural considerations for designing credit systems that can handle millions of users.', true, '2025-12-10'::timestamptz, ARRAY['Architecture', 'Credit']::text[], NULL, NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.blog_posts (title, slug, excerpt, content, published, published_at, tags, cover_image_url, external_url)
VALUES ('How Product Managers Work with Engineers', 'pm-engineer-collaboration', 'Best practices for effective cross-functional collaboration in technical product development.', 'Best practices for effective cross-functional collaboration in technical product development.', true, '2025-11-22'::timestamptz, ARRAY['Product Management', 'Collaboration']::text[], NULL, NULL)
ON CONFLICT (slug) DO NOTHING;
