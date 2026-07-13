# CrossPromo

CrossPromo is a public promotion feed used by BCS apps to discover approved app recommendations.

Apps fetch a small JSON config from GitHub Pages, read the app metadata and image paths, then decide locally whether and how to show a promotion. This repository contains only public data that is safe for anonymous visitors to read.

## Public URLs

- Website: `https://baegagopa.github.io/crosspromo/`
- Config: `https://baegagopa.github.io/crosspromo/config/crosspromo.json`
- Assets: `https://baegagopa.github.io/crosspromo/assets/`

## Public Files

- `index.html`: public developer website
- `config/crosspromo.json`: published CrossPromo configuration
- `assets/`: public icons, banners, and website styles/scripts
- `.nojekyll`: GitHub Pages publishing marker

Private tools, operator notes, temp exports, and automation scripts are not part of the public GitHub repository.
