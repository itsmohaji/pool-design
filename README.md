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

The uploaded PDF contains small AutoCAD annotations that are not all reliably legible in the rasterized export. All unconfirmed dimensions are intentionally isolated in `src/config/project.ts`. They must be checked against the original DWG or a dimension schedule before construction-level sign-off. The current scene is an architectural visualization, not a construction document.

## Current functional scope

- Responsive cinematic introduction
- Accurate tapered pool design based on the plan silhouette
- Pool, coping, steps, terrace, landscaping and photographed lounge reconstruction
- Real-time water, stone, upholstery, furniture-direction and atmosphere controls
- Curated camera targets
- Local design persistence and URL sharing
- Clean PNG capture from the WebGL canvas
- Desktop and mobile responsive interface

## Production asset note

The scene uses original procedural geometry and materials, so it does not ship unlicensed commercial furniture models. Final hotel-grade delivery should replace the procedural vegetation and selected furniture details with licensed, web-optimized GLB/KTX2 assets after the client approves an asset budget and collection.

## Deployment

Import the repository into Vercel and deploy with the default Next.js settings, or run `npm run build && npm start` on a Node.js VPS. No environment variables are required.
