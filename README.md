# The Malaysian Pantry

Static editorial site. No build step: edit HTML, push, Vercel serves it.

## Before launch

- **Newsletter form** on the homepage posts to `#`. Point it at a real provider
  (Buttondown, ConvertKit, Mailchimp embedded form) or remove the section.
  A form that silently discards addresses is worse than no form.
- **Images** are Unsplash placeholders. Replace with real photography.

## Adding an article

1. Copy an existing file in `articles/`, keep the header and footer blocks intact.
2. Add an entry to `search-index.json` — the `k` field holds hidden keywords that
   should match how people actually search (dish names, local terms, E numbers).
3. Add a card to the relevant section page and to `index.html`.
4. Add the URL to `sitemap.xml`.

## Search

Client-side, no service. `js/pantry.js` fetches `search-index.json` on first open,
scores title matches 3x higher than body matches, and supports section filtering.
Opens with the header button, `/`, or Cmd/Ctrl-K.
