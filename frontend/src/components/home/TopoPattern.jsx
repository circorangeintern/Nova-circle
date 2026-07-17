/**
 * TopoPattern — faint concentric contour lines used behind the hero.
 * Decorative only (aria-hidden). Pure SVG so it stays crisp at any size and
 * respects reduced-motion (it doesn't animate).
 */
export function TopoPattern({ className }) {
  // A few clusters of concentric ellipses, echoing a topographic map.
  const clusters = [
    { cx: 130, cy: 90, rings: 6, rx: 26, ry: 22 },
    { cx: 560, cy: 60, rings: 7, rx: 30, ry: 26 },
    { cx: 900, cy: 210, rings: 8, rx: 34, ry: 28 },
    { cx: 300, cy: 340, rings: 7, rx: 32, ry: 26 },
    { cx: 720, cy: 400, rings: 6, rx: 28, ry: 24 },
  ]
  return (
    <svg
      className={className}
      viewBox="0 0 1000 460"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      {clusters.map((c, i) => (
        <g key={i}>
          {Array.from({ length: c.rings }).map((_, r) => (
            <ellipse
              key={r}
              cx={c.cx}
              cy={c.cy}
              rx={c.rx * (r + 1)}
              ry={c.ry * (r + 1)}
              stroke="white"
              strokeOpacity={0.05}
              strokeWidth={1.25}
            />
          ))}
        </g>
      ))}
    </svg>
  )
}
