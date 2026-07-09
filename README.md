HEAD

# PublicEye NG — Frontend

A geotagged, photographic public infrastructure **accountability platform** for
Nigeria. Citizens document broken roads, dry boreholes, roofless schools and
flooded transformers; officials respond in the open; the public can verify or
dispute resolutions. This repo is the **frontend** (React + Vite + Tailwind).

> Built for the Orange Internship (Circo Digital Academy). See the two PRDs for
> the full product & design spec.

## Tech stack

| Layer     | Choice                                                 |
| --------- | ------------------------------------------------------ |
| Framework | React 18 + Vite                                        |
| Styling   | Tailwind CSS (design tokens in `tailwind.config.js`)   |
| Routing   | React Router v6                                        |
| Animation | Framer Motion                                          |
| Maps      | Leaflet + React Leaflet                                |
| Forms     | React Hook Form + Zod _(report flow — next milestone)_ |
| State     | Zustand _(multi-step form — next milestone)_           |
| Charts    | Recharts _(dashboard — next milestone)_                |
| Toasts    | react-hot-toast                                        |
| Icons     | lucide-react                                           |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Project structure

```
src/
├── components/
│   ├── ui/          # Design-system primitives (Button, Badge, Card, SectionHeading)
│   ├── common/      # CountUp, Reveal, ComingSoon
│   ├── layout/      # Navbar, Footer, Layout, Logo
│   ├── home/        # Landing sections (Hero, StatsBar, MapPreview, ...)
│   ├── reports/     # ReportCard, ReportRow, StatusTimeline
│   └── map/         # ReportMap, MapLegend, markerIcon
├── pages/           # Route-level screens
├── services/api.js  # ← API boundary (swap mock for real backend here)
├── data/mockData.js # Mock data + response SHAPES (the backend contract)
├── lib/             # constants (categories/statuses/severities), cn, format
└── main.jsx / App.jsx
```

## For the backend developer

- **Every screen talks to the backend only through `src/services/api.js`.**
  Replace each function body with a real fetch/axios call — keep the
  signatures and returned object shapes identical and the UI needs no changes.
- The canonical **data shapes** (report, platform stats, timeline) live in
  `src/data/mockData.js`. Treat these as the API contract.
- Shared vocabulary (category keys, status keys, severity keys) is in
  `src/lib/constants.js` — keep API values aligned with these keys.

## Design tokens

All colour, typography, spacing, radius and elevation values live in
`tailwind.config.js`. Change them there and they propagate everywhere — no
hard-coded values in components.

> **Display font note:** the mockups use a serif display face (`font-display`,
> currently _Source Serif 4_). The written PRD lists _Sora_. To switch globally,
> change the `display` family in `tailwind.config.js` — nothing else needs edits.

## Status — MVP (this build)

✅ Design system & tokens · ✅ Reusable component library · ✅ Landing page
(pixel-faithful to the mockups) · ✅ Interactive public map (filters + FAB) ·
✅ Report detail page (timeline, confirm, share) · ✅ Routing + responsive shell

**Next milestones:** Report submission flow → Public dashboard → Official portal
(needs backend auth contract).
=======

# Nova-circle

Orange internship program 2026

16a5e13b9fcffa5b6d8d1468789579d78a7f90f4
