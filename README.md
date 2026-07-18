# Loopstitch — Crochet Inventory Manager

A polished, Linear/Notion-inspired inventory app for a handmade crochet
business. Light theme, emerald accents, inline-editable tables, live
dashboard, analytics and expense tracking.

## Stack

React · Vite · TypeScript · TailwindCSS v4 · shadcn-style UI · TanStack Table
· TanStack Query · React Router · Recharts · Framer Motion · Lucide ·
Supabase (optional)

## Getting started

```bash
npm install
npm run dev
```

The app works out of the box with **no backend**: a local adapter stores data
in `localStorage`, seeded with a year of realistic demo data (products, sales
history, expenses). Clear the `loopstitch:db:v1` key to reset.

## Connecting Supabase (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.example` to `.env` and fill in:
   ```
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
4. Restart the dev server — the app switches to the Supabase adapter
   automatically (check Settings → Data & Integrations).

Auth is not enabled yet; the RLS policies in `schema.sql` allow anon access
and include comments showing how to lock them down once Supabase Auth is
wired up.

## Deploying to Netlify

The repo includes `netlify.toml` (build command, `dist` publish dir, SPA
redirect). Connect the GitHub repo in Netlify and deploy — optionally add the
two `VITE_SUPABASE_*` environment variables in Site settings.

## How the numbers work

- **Inventory value** = cost price × current stock
- **Profit per unit** = selling price − cost price
- **Revenue / gross profit** come from the `inventory_history` log: lowering
  stock records a *sale* (at the current selling price), raising it records a
  *restock*. Saving from the product drawer logs an *adjustment* instead, and
  the drawer's quick-stock buttons record explicit sales/restocks.
- **Net profit** = gross profit − total expenses.
- Status: **Out of stock** (0), **Low stock** (≤ minimum), **Healthy**.

## Keyboard shortcuts

- `/` — focus search (Inventory, Expenses)
- `n` — new product / expense
- `Enter` / `Esc` — commit / cancel an inline cell edit

## Structure

```
src/
  components/       shared UI (shadcn-style primitives, charts, cells)
  data/             storage adapters: local (seeded) + Supabase, query keys
  features/
    dashboard/      KPI cards + charts, all derived from live data
    inventory/      editable table, product drawer, add dialog, hooks
    analytics/      time-range analytics with historical stock reconstruction
    expenses/       editable expense table + stats
    settings/       business prefs, categories, integrations
  lib/              formatting, inventory math, supabase client, hotkeys
supabase/schema.sql  database schema + RLS
```
