# slides-html (Vanilla HTML/CSS/JS Presentation)

A zero-build, ready-to-present slide deck you can open in the browser. No frameworks, no bundlers.

## How to use

- Option A (recommended): Use Live Server in VS Code. Right-click `index.html` and choose "Open with Live Server".
- Option B: Open `index.html` directly in your browser (double-click). Most features work without a server.

### Authoring slides

- Each slide is a `<section class="slide">` inside `index.html`.
- Examples included: title, bullets, image placeholder, quote, code.
- Put your media in `assets/images` or `assets/media` and update the markup.

### Navigation & features

- Keyboard: Right/Down/Space = next, Left/Up = previous, Home/End = first/last
- Touch: swipe left/right; Click on stage to advance
- Hash routing: `#1`, `#2`, ... deep-link and preserve position on refresh
- Progress: bar + counter
- Auto-advance: add `?auto=5000` to URL (ms). Toggle with `A`.
- Theme: toggle light/dark with `T` (persists)
- Print/PDF: press `P` to open print dialog. `@media print` uses A4 landscape and one slide per page.
- Notes: add `data-notes` on each `<section class="slide">`; toggle overlay with `N`.
- Timer: toggle with `H` (starts at 00:00; hides/shows)

### Tips

- Recommended extensions: Live Server, Prettier (see `.vscode/extensions.json`).
- For code blocks, basic styling is included. Paste code between `<pre><code>...</code></pre>`.
- For presenting on projector/meet: press F11 for fullscreen.

## Print to PDF

- Open the deck in the browser.
- Press `P` > Destination: "Save as PDF" > Layout: Landscape > Margins: None.
- Each slide is sized to A4 landscape; one slide per page.

## License

MIT. See `LICENSE`.
