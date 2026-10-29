# Md Hasibul Hossain — Portfolio

Personal portfolio website of a product manager building fintech and SaaS products.

**Live site:** https://hasibul-hossain-portfolio.vercel.app

## Built with

- React 18, TypeScript, Vite
- Tailwind CSS, Lucide icons
- Supabase for the page content (sections, settings, images), blog posts and the contact form
- Hosted on Vercel

## Run it locally

1. `npm install`
2. Create a `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. `npm run dev`

Without the database keys the site still works and shows its built-in content (`src/content/defaults.json`).

## Database

Run `supabase/portfolio_full_setup.sql` once in the Supabase SQL Editor of a new project. It creates the tables,
the security rules, the `site-media` storage for images and the starting content. It is safe to run again.
