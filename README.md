# Lijbailat Villa Pool Experience

Browser-based architectural presentation built with Next.js, React Three Fiber and Three.js.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verified plan information

- Source: `LIJBAILAT VILLA_POOL DIMS AND AREA(1).pdf`
- Drawing: one A3 AutoCAD sheet
- Marked pool/deck area: 138.50 m²
- Clearly readable pool base dimension: approximately 14.68 m

## Measurement status

The uploaded PDF contains small AutoCAD annotations that are not all reliably legible in the rasterized export. All critical and assumed dimensions are intentionally isolated in `src/config/geometry.ts`. They must be checked against the original DWG or a dimension schedule before construction-level sign-off. The current scene is an architectural visualization, not a construction document.

## Current functional scope

- Responsive cinematic introduction
- Accurate tapered pool design based on the plan silhouette
- Pool, coping, steps, terrace, landscaping and photographed lounge reconstruction
- Reference-matched double tanning daybed and fringed woven umbrella
- Original high-resolution limestone, plaster, textile and walnut texture maps
- Real-time water, stone, upholstery, furniture-direction and atmosphere controls
- Aerial and human-eye camera modes, WASD/arrow walking, mobile walk controls and pool collision
- Local design persistence and URL sharing
- Clean PNG capture from the WebGL canvas
- Desktop and mobile responsive interface

## Production asset note

The scene uses original procedural geometry and materials, so it does not ship unlicensed commercial furniture models. Final hotel-grade delivery should replace the procedural vegetation and selected furniture details with licensed, web-optimized GLB/KTX2 assets after the client approves an asset budget and collection.

## Deployment

GitHub Pages deploys automatically from `.github/workflows/deploy-pages.yml` after a push to `main`. The public path is configured through `GITHUB_PAGES=true`, including direct refresh and relative texture loading.
