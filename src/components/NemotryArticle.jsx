// NemotryArticle.jsx
import { useEffect , useMemo, useRef, useState } from 'react';
import { motion as Motion } from 'motion/react';
import { CONTENT, EN_PROJECTS } from '../data/content.js';
import { getProjectSteps } from '../utils/nemotry.js';

const projectsCopy = CONTENT.en.projects;

export default function NemotryArticle() {
  const containerRef = useRef(null);
  const [steps, setSteps] = useState([]);
  const currentCredit = steps[visibleCount - 1]?.credit ?? 0;
  const [visibleCount, setVisibleCount] = useState(0);

  const byId = useMemo(
    () => Object.fromEntries(EN_PROJECTS.map((p) => [p.id, p])),
    []
  );

  useEffect (() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSteps = () => {
      const { clientWidth: W, clientHeight: H } = el;
      console.log('[NemotryArticle] container size:', W, H);   // ← add this
      if (W > 0 && H > 0) {
        const s = getProjectSteps(W, H, EN_PROJECTS);
        console.log('[NemotryArticle] steps produced:', s.length);
        setSteps(s);
        setVisibleCount(0);
      }
    };

    updateSteps();
    const ro = new ResizeObserver(updateSteps);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <article className="relative flex flex-col gap-6">
      <header className="max-w-2xl space-y-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {projectsCopy.eyebrow}
        </p>
        <h1 className="text-2xl font-semibold">{projectsCopy.title}</h1>
        <p className="text-sm text-slate-600">{projectsCopy.deck}</p>
      </header>

<div className="flex items-center gap-4">
  <button
    type="button"
    onClick={() => setVisibleCount((prev) => Math.min(prev + 1, steps.length))}
    className="rounded border border-slate-400 px-3 py-1 text-xs font-medium hover:bg-slate-50 active:bg-slate-100"
  >
    {visibleCount < steps.length ? 'Show next' : 'All shown'}
  </button>

  <span className="text-xs text-slate-500">
    Step {Math.min(visibleCount, steps.length)} / {steps.length}
  </span>

  {/* Credit indicator */}
  <div className="flex items-center gap-2">
    <span className="text-xs font-mono text-slate-500">credit</span>
    <span
      className="text-xs font-mono font-bold"
      style={{ color: currentCredit > 0 ? '#16a34a' : currentCredit < 0 ? '#dc2626' : '#64748b' }}
    >
      {currentCredit > 0 ? '+' : ''}{Math.round(currentCredit)}px²
    </span>
    <span
      className="text-xs font-mono text-slate-400"
      style={{ color: currentCredit > 0 ? '#16a34a' : currentCredit < 0 ? '#dc2626' : '#64748b' }}
    >
      [{steps[visibleCount - 1]?.mode ?? '—'}]
    </span>
  </div>
</div>

      <div
  ref={containerRef}
  style={{ position: 'relative', width: '100%', height: '60vh' }}
  className="rounded border border-dashed border-slate-300 bg-slate-50/40"
>
        {steps.slice(0, visibleCount).map((step, i) => {
          const { card, mode, overlay, actualArea, desiredArea } = step;
          const project = byId[card.id];
          if (!project) return null;

          const hue = (i * 45) % 360;
          const debugBg = `hsla(${hue}, 70%, 90%, 0.1)`;
          const debugBorder = `hsla(${hue}, 70%, 50%, 0.6)`;
          const debugLabelBg = `hsla(${hue}, 70%, 20%, 0.8)`;

          const overlayColor =
            overlay?.type === 'buy'
              ? 'rgba(255, 0, 0, 0.35)'
              : overlay?.type === 'sell'
              ? 'rgba(0, 200, 0, 0.35)'
              : 'transparent';

          return (
            <Motion.div
              key={`${project.id}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'absolute',
                left: card.startx,
                top: card.starty,
                width: card.width,
                height: card.height,
                border: `2px solid ${debugBorder}`,
                background: debugBg,
                boxSizing: 'border-box',
                overflow: 'hidden',
                borderRadius: 8,
              }}
            >
              {/* Debug label */}
              <div
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  padding: '2px 6px',
                  borderRadius: 999,
                  background: debugLabelBg,
                  color: 'white',
                  fontSize: 10,
                  display: 'inline-flex',
                  gap: 6,
                  alignItems: 'center',
                }}
              >
                <span>{project.id}</span>
                <span>· {mode}</span>
                <span>
                  {Math.round(actualArea)} / {Math.round(desiredArea)}
                </span>
              </div>

              {/* BUY/SELL overlay */}
              {overlay && (
                <div
                  style={{
                    position: 'absolute',
                    left: overlay.x - card.startx,
                    top: overlay.y - card.starty,
                    width: overlay.width,
                    height: overlay.height,
                    background: overlayColor,
                    borderRadius: 4,
                  }}
                />
              )}

              {/* Minimal content preview (optional) */}
              <div className="flex h-full flex-col justify-end p-2">
                <p className="truncate text-[10px] font-semibold">
                  {project.title}
                </p>
                <p className="line-clamp-2 text-[9px] text-slate-600">
                  {project.body}
                </p>
              </div>
            </Motion.div>
          );
        })}
      </div>

      <footer className="max-w-2xl text-xs text-slate-500">
        {projectsCopy.deck}
      </footer>
    </article>
  );
}