// NemotryDebug.jsx — visual allocator inspector, no prose output
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import { EN_PROJECTS } from '../data/content.js';
import { getProjectSteps } from '../utils/nemotry.js';

// ─── colour palette per project (hue wheel) ──────────────────────────────────
function projectHue(index) {
  return (index * 53) % 360; // prime step keeps colours visually spread
}

// ─── tiny sub-components ─────────────────────────────────────────────────────

/** Horizontal fill bar — value 0..1 */
function FillBar({ fill, color, bg = '#e2e8f0', height = 6 }) {
  return (
    <div style={{ background: bg, borderRadius: 999, overflow: 'hidden', height }}>
      <Motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(fill, 1) * 100}%` }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ height: '100%', background: color, borderRadius: 999 }}
      />
    </div>
  );
}

/** Single numeric metric tile */
function MetricTile({ label, value, unit = '', color = '#334155' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 2, minWidth: 64,
    }}>
      <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color, lineHeight: 1 }}>
        {value}
        {unit && <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8' }}>{unit}</span>}
      </span>
      <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>
        {label}
      </span>
    </div>
  );
}

/** BUY/SELL mode badge */
function ModeBadge({ mode }) {
  const isBuy = mode === 'BUY';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
      background: isBuy ? '#fef2f2' : '#f0fdf4',
      color: isBuy ? '#dc2626' : '#16a34a',
      border: `1px solid ${isBuy ? '#fca5a5' : '#86efac'}`,
    }}>
      {isBuy ? '▲ BUY' : '▼ SELL'}
    </span>
  );
}

/** Credit delta spark — centered bar, left = negative, right = positive */
function CreditBar({ credit, maxAbs }) {
  const ratio = maxAbs > 0 ? Math.abs(credit) / maxAbs : 0;
  const isPos = credit >= 0;
  return (
    <div style={{ position: 'relative', height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
      {/* centre line */}
      <div style={{
        position: 'absolute', left: '50%', top: 0, width: 1,
        height: '100%', background: '#cbd5e1', transform: 'translateX(-50%)',
      }} />
      <Motion.div
        initial={{ width: 0 }}
        animate={{ width: `${ratio * 50}%` }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          height: '100%',
          background: isPos ? '#16a34a' : '#dc2626',
          borderRadius: 999,
          left: isPos ? '50%' : undefined,
          right: isPos ? undefined : '50%',
        }}
      />
    </div>
  );
}

// ─── Canvas viewport ──────────────────────────────────────────────────────────

function AllocCanvas({ steps, visibleCount, byId }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <AnimatePresence>
        {steps.slice(0, visibleCount).map((step, i) => {
          const { card, mode, overlay, actualArea, desiredArea } = step;
          const project = byId[card.id];
          if (!project) return null;

          const hue = projectHue(i);
          const fill = actualArea / desiredArea; // > 1 = over-allocated
          const borderColor = fill > 1.1
            ? `hsla(${hue},70%,45%,0.9)`
            : fill < 0.9
            ? `hsla(${hue},70%,45%,0.5)`
            : `hsla(${hue},70%,45%,0.7)`;

          const overlayColor = overlay?.type === 'buy'
            ? 'rgba(220,38,38,0.3)'
            : 'rgba(22,163,74,0.3)';

          return (
            <Motion.div
              key={card.id + '-' + i}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.22 }}
              style={{
                position: 'absolute',
                left: card.startx,
                top: card.starty,
                width: card.width,
                height: card.height,
                border: `2px solid ${borderColor}`,
                background: `hsla(${hue},65%,92%,0.18)`,
                borderRadius: 6,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              {/* area fill bar along bottom edge */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0,
                width: `${Math.min(fill, 1) * 100}%`,
                height: 3,
                background: `hsla(${hue},70%,48%,0.8)`,
              }} />

              {/* step index chip */}
              <div style={{
                position: 'absolute', top: 3, left: 3,
                background: `hsla(${hue},65%,22%,0.82)`,
                color: '#fff', fontSize: 9, fontWeight: 700,
                padding: '1px 5px', borderRadius: 999,
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                <span>#{i + 1}</span>
                <span style={{ opacity: 0.7 }}>·</span>
                <span>{card.id}</span>
              </div>

              {/* ratio chip top-right */}
              {card.width > 52 && card.height > 28 && (
                <div style={{
                  position: 'absolute', top: 3, right: 3,
                  background: 'rgba(0,0,0,0.45)',
                  color: fill > 1.05 ? '#fca5a5' : fill < 0.95 ? '#93c5fd' : '#86efac',
                  fontSize: 9, fontFamily: 'monospace', fontWeight: 700,
                  padding: '1px 5px', borderRadius: 999,
                }}>
                  {(fill * 100).toFixed(0)}%
                </div>
              )}

              {/* BUY/SELL overlay rect */}
              {overlay && (
                <div style={{
                  position: 'absolute',
                  left: overlay.x - card.startx,
                  top: overlay.y - card.starty,
                  width: overlay.width,
                  height: overlay.height,
                  background: overlayColor,
                  borderRadius: 3,
                  border: `1px dashed ${overlay.type === 'buy' ? '#dc2626' : '#16a34a'}`,
                }} />
              )}

              {/* mode stripe on left edge */}
              <div style={{
                position: 'absolute', left: 0, top: 0,
                width: 3, height: '100%',
                background: mode === 'BUY' ? '#dc2626' : '#16a34a',
                opacity: 0.7,
              }} />
            </Motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ─── Metrics sidebar ──────────────────────────────────────────────────────────

function MetricsSidebar({ steps, visibleCount, totalArea }) {
  const step = steps[visibleCount - 1];
  const allVisible = steps.slice(0, visibleCount);

  const totalDesired = allVisible.reduce((s, x) => s + x.desiredArea, 0);
  const totalActual  = allVisible.reduce((s, x) => s + x.actualArea,  0);
  const coverage     = totalArea > 0 ? totalActual / totalArea : 0;
  const maxAbsCredit = Math.max(...steps.map((x) => Math.abs(x.credit)), 1);

  const efficiencyColor = !step ? '#64748b'
    : Math.abs(step.diff) / (step.desiredArea || 1) < 0.05 ? '#16a34a'
    : Math.abs(step.diff) / (step.desiredArea || 1) < 0.15 ? '#d97706'
    : '#dc2626';

  return (
    <div style={{
      width: 200, flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: 12,
      padding: '10px 12px',
      background: '#f8fafc',
      borderLeft: '1px solid #e2e8f0',
      borderRadius: '0 8px 8px 0',
      overflow: 'hidden',
    }}>

      {/* ── Current step ── */}
      <section>
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', marginBottom: 8 }}>
          Current step
        </div>
        {step ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{step.card.id}</span>
              <ModeBadge mode={step.mode} />
            </div>

            {/* desired vs actual bar */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#64748b', marginBottom: 2 }}>
                <span>desired</span>
                <span style={{ fontFamily: 'monospace' }}>{Math.round(step.desiredArea).toLocaleString()}px²</span>
              </div>
              <FillBar fill={1} color='#bfdbfe' />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#64748b', marginBottom: 2 }}>
                <span>actual</span>
                <span style={{ fontFamily: 'monospace', color: efficiencyColor }}>
                  {Math.round(step.actualArea).toLocaleString()}px²
                </span>
              </div>
              <FillBar
                fill={step.actualArea / (step.desiredArea || 1)}
                color={efficiencyColor}
              />
            </div>

            {/* diff row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 6 }}>
              <span style={{ color: '#64748b' }}>diff</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600,
                color: step.diff > 0 ? '#dc2626' : step.diff < 0 ? '#2563eb' : '#16a34a' }}>
                {step.diff > 0 ? '+' : ''}{Math.round(step.diff).toLocaleString()}px²
              </span>
            </div>

            {/* card dims */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginBottom: 2 }}>
              <span>w × h</span>
              <span style={{ fontFamily: 'monospace' }}>
                {Math.round(step.card.width)} × {Math.round(step.card.height)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b' }}>
              <span>origin</span>
              <span style={{ fontFamily: 'monospace' }}>
                ({Math.round(step.card.startx)}, {Math.round(step.card.starty)})
              </span>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 10, color: '#cbd5e1', textAlign: 'center', padding: '12px 0' }}>
            press step →
          </div>
        )}
      </section>

      <div style={{ borderTop: '1px solid #e2e8f0' }} />

      {/* ── Credit tracker ── */}
      <section>
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', marginBottom: 6 }}>
          Credit
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
          <span style={{ color: '#64748b' }}>running</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 700,
            color: (step?.credit ?? 0) > 0 ? '#16a34a' : (step?.credit ?? 0) < 0 ? '#dc2626' : '#64748b' }}>
            {(step?.credit ?? 0) > 0 ? '+' : ''}{Math.round(step?.credit ?? 0).toLocaleString()}
          </span>
        </div>
        <CreditBar credit={step?.credit ?? 0} maxAbs={maxAbsCredit} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', marginTop: 2 }}>
          <span>← over-sold</span>
          <span>over-bought →</span>
        </div>
      </section>

      <div style={{ borderTop: '1px solid #e2e8f0' }} />

      {/* ── Canvas totals ── */}
      <section>
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', marginBottom: 8 }}>
          Canvas
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 8 }}>
          <MetricTile label="steps" value={visibleCount} color="#334155" />
          <MetricTile label="total" value={steps.length} color="#94a3b8" />
        </div>

        {/* coverage bar */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#64748b', marginBottom: 2 }}>
            <span>coverage</span>
            <span style={{ fontFamily: 'monospace' }}>{(coverage * 100).toFixed(1)}%</span>
          </div>
          <FillBar fill={coverage} color='#6366f1' />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#64748b', marginBottom: 2 }}>
          <span>desired total</span>
          <span style={{ fontFamily: 'monospace' }}>{Math.round(totalDesired).toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#64748b' }}>
          <span>actual total</span>
          <span style={{ fontFamily: 'monospace' }}>{Math.round(totalActual).toLocaleString()}</span>
        </div>
      </section>

      <div style={{ borderTop: '1px solid #e2e8f0' }} />

      {/* ── Per-step mini timeline ── */}
      <section style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', marginBottom: 6 }}>
          Steps
        </div>
        {steps.map((s, i) => {
          const isActive = i === visibleCount - 1;
          const isVisible = i < visibleCount;
          const ratio = s.actualArea / (s.desiredArea || 1);
          const hue = projectHue(i);
          return (
            <div key={s.card.id + i} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '2px 4px', borderRadius: 4, marginBottom: 1,
              background: isActive ? '#f0f9ff' : 'transparent',
              opacity: isVisible ? 1 : 0.3,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: 999, flexShrink: 0,
                background: isVisible ? `hsl(${hue},60%,52%)` : '#e2e8f0',
              }} />
              <span style={{ fontSize: 9, color: '#334155', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.card.id}
              </span>
              <span style={{
                fontSize: 9, fontFamily: 'monospace',
                color: ratio > 1.05 ? '#dc2626' : ratio < 0.95 ? '#2563eb' : '#16a34a',
              }}>
                {(ratio * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </section>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function NemotryDebug() {
  const containerRef = useRef(null);
  const [steps, setSteps] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const currentCredit = steps[visibleCount - 1]?.credit ?? 0;

  const byId = useMemo(
    () => Object.fromEntries(EN_PROJECTS.map((p) => [p.id, p])),
    []
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { clientWidth: W, clientHeight: H } = el;
      if (W > 0 && H > 0) {
        setDims({ w: W, h: H });
        const s = getProjectSteps(W, H, EN_PROJECTS);
        setSteps(s);
        setVisibleCount(0);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const totalArea = dims.w * dims.h;

  const canStep = visibleCount < steps.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Control bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        padding: '6px 12px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
      }}>
        <button
          type="button"
          onClick={() => setVisibleCount((p) => Math.min(p + 1, steps.length))}
          disabled={!canStep}
          style={{
            padding: '4px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: canStep ? 'pointer' : 'default',
            background: canStep ? '#1e293b' : '#e2e8f0',
            color: canStep ? '#f8fafc' : '#94a3b8',
            border: 'none',
          }}
        >
          {canStep ? `Step ${visibleCount + 1} →` : '✓ All shown'}
        </button>

        <button
          type="button"
          onClick={() => setVisibleCount(0)}
          style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
            background: 'transparent', border: '1px solid #cbd5e1', color: '#64748b',
          }}
        >
          Reset
        </button>

        {/* step counter */}
        <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
          {visibleCount} / {steps.length}
        </span>

        {/* credit pill */}
        <span style={{
          marginLeft: 'auto',
          padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
          background: currentCredit > 0 ? '#f0fdf4' : currentCredit < 0 ? '#fef2f2' : '#f1f5f9',
          color:      currentCredit > 0 ? '#16a34a' : currentCredit < 0 ? '#dc2626' : '#64748b',
          border: `1px solid ${currentCredit > 0 ? '#86efac' : currentCredit < 0 ? '#fca5a5' : '#e2e8f0'}`,
        }}>
          credit {currentCredit > 0 ? '+' : ''}{Math.round(currentCredit).toLocaleString()}px²
        </span>

        {/* canvas dims */}
        <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
          {dims.w} × {dims.h}
        </span>
      </div>

      {/* ── Main panel (canvas + sidebar) ── */}
      <div style={{
        display: 'flex',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        overflow: 'hidden',
        height: '62vh',
        minHeight: 320,
      }}>

        {/* canvas */}
        <div
          ref={containerRef}
          style={{ flex: 1, position: 'relative', background: '#f8fafc', overflow: 'hidden' }}
        >
          {/* grid overlay */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <pattern id="dbg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dbg-grid)" />
          </svg>

          <AllocCanvas steps={steps} visibleCount={visibleCount} byId={byId} />

          {/* empty hint */}
          {steps.length > 0 && visibleCount === 0 && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#cbd5e1', fontSize: 13, pointerEvents: 'none',
            }}>
              press Step 1 → to begin
            </div>
          )}
        </div>

        {/* sidebar */}
        <MetricsSidebar
          steps={steps}
          visibleCount={visibleCount}
          totalArea={totalArea}
        />
      </div>
    </div>
  );
}
