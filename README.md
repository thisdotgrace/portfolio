# Portfolio Website

A small portfolio site built with plain HTML, CSS and JavaScript. The design uses a corkboard / post-it aesthetic with polaroids, pinned notes, and a notebook-style contact area.

## Features
- Responsive header with hamburger menu
- Grid of interactive post-it notes (pins, stickers, wobble-on-scroll)
- Polaroid profile image with centered pin
- Notebook-style contact section with pinned social icons
- CSS custom properties for easy per-note customization (color, width, height, rotation)
- Accessible keyboard interactions for interactive notes and menu

## Quick start / preview
1. Open the project folder:
   ```
   cd "C:\Users\itsgr\OneDrive\Documents\Portfolio Website"
   ```
2. Preview locally:
   - Double-click `index.html` to open in your browser, or
   - Use VS Code Live Server extension (recommended) to serve it and get live reload.

## File overview
- `index.html` — main HTML structure and small scripts (nav toggle, scroll wobble)
- `style1.css` (or `style.css`) — primary stylesheet with tokens, post-it, polaroid, grid and notebook styles
- `assets/` — images and icons (avatar, social icons, sticker icons)
- `test.css` — auxiliary/test styles (if present)

## How to customize notes
Notes use CSS custom properties. You can set them inline, with utility classes, or via container defaults.

Examples:
- Inline per-note:
  ```html
  <article class="post-it-note" style="--note-bg:#fff1b8; --note-w:520px; --note-h:420px; --note-rot:-6deg;">
    ...
  </article>
  ```
- Utility class (defined in CSS):
  ```html
  <article class="post-it-note note note-gold note--big">...</article>
  ```
- Grid defaults:
  ```css
  .notes-grid { --note-w: 460px; --note-h: 360px; }
  ```

Primary variables to use:
- `--note-bg` — background color
- `--note-w` — preferred width (note: used as max-width inside grid)
- `--note-h` — height
- `--note-rot` — rotation (e.g. `-6deg`)
- `--pin-head-gradient` — pin head color/gradient

## Adding stickers (repo / tech icons)
Stickers are small anchor elements inside a `.note-stickers` container positioned bottom-right of a note. Copy the snippet from `index.html` and update `href` and `src` to link to the correct icons.

## Accessibility
- Nav toggle uses `aria-controls` / `aria-expanded`.
- Interactive notes can be made keyboard-focusable with `tabindex="0"` and `role="button"`.
- Ensure icon images include `alt` text or use inline SVG with `aria-hidden` where appropriate.

## Deployment
This is a static site. Deploy options:
- GitHub Pages: push to a repo and enable GitHub Pages in repository settings.
- Any static host (Netlify, Vercel, Surge) — drag & drop or connect repo.

## Troubleshooting
- If styles don't update, clear cache or use Ctrl+F5.
- If icons/images are missing, confirm `assets/` files are in the repository and paths match.

## Contributing
Small tweaks welcome. Suggested workflow:
1. Fork & branch
2. Make changes
3. Open a PR with a short description of UI/behavior changes

## License & contact
Add a LICENSE file if you wish (MIT recommended for personal projects).  
Contact: `programmingwithgrace@gmail.com`
