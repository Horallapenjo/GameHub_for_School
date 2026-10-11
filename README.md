# GamesHub Arcade

A tiny static website with a few idle pixel games designed for quick 5-15 minute breaks.

## Included games
- Pixel Tap: a clicker game with upgrades and idle automation
- Ore Rush: a mining idle game with workers and drills
- Star Forge: a flux production builder with smelters and bots

## Run locally
Open `index.html` directly in a browser, or serve the folder with a static server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages
This repo is set up for GitHub Pages deployment via a Pages workflow. Push the contents to a public GitHub repository and enable GitHub Pages in repository settings.

Recommended setup:
- Source: GitHub Actions
- Branch: `main`
- Folder: `/`

## Notes
This is a pure static app, so it works well on GitHub Pages without a backend.
