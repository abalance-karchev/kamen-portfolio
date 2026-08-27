// SpaceDebugView.jsx
import { useMemo } from 'react'
import { Space } from '../utils/v3.js'          // your Space/SpaceAllocator file
import { SpaceAllocator } from '../utils/v3.js'

// ─── palette: distinct hues for each card ────────────────────────────────────
const PALETTE = [
  '#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f',
  '#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ac',
  '#d4a5a5','#a8d8ea','#aa96da','#fcbad3','#ffffb5',
]
const colorFor = (i) => PALETTE[i % PALETTE.length]

/**
 * @param {{
 *   concepts: import('../utils/v3.js').ProjectConcept[]
 *   width?:   number
 *   height?:  number
 * }} props
 */
export function SpaceDebugView({ concepts, width = 1000, height = 300 }) {
  const { cards, freeSegments } = useMemo(() => {
    const space     = new Space(width, height)
    const allocator = new SpaceAllocator(space)
    const cards     = allocator.allocate(concepts)

    // after allocation, remaining segments are free/unallocated
    return { cards, freeSegments: space.segments }
  }, [concepts, width, height])

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ border: '2px solid #333', display: 'block' }}
      >
        {/* ── free segments (ghost) ───────────────────────────── */}
        {freeSegments.map((seg) => (
          <rect
            key={`free-${seg.id}`}
            x={seg.box.xmin}
            y={seg.box.ymin}
            width={seg.getWidth()}
            height={seg.getHeight()}
            fill="none"
            stroke="#bbb"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        ))}

        {/* ── allocated cards ─────────────────────────────────── */}
        {cards.map((card, i) => {
          const fill   = colorFor(i)
          const cx     = card.startx + card.width  / 2
          const cy     = card.starty + card.height / 2
          const ratio  = (card.width / card.height).toFixed(2)
          const area   = Math.round(card.width * card.height)
          const labelY = card.height < 40 ? cy - 6 : cy - 18

          return (
            <g key={card.id}>
              <rect
                x={card.startx + 1}
                y={card.starty + 1}
                width={card.width  - 2}
                height={card.height - 2}
                fill={fill}
                fillOpacity={0.15}
                stroke={fill}
                strokeWidth={2}
                rx={3}
              />

              {/* index badge */}
              <circle cx={card.startx + 14} cy={card.starty + 14} r={11} fill={fill} />
              <text
                x={card.startx + 14} y={card.starty + 18}
                textAnchor="middle" fontSize={11} fontWeight="bold" fill="#fff"
              >
                {i}
              </text>

              {/* id label */}
              <text
                x={cx} y={labelY}
                textAnchor="middle" fontSize={12} fill="#111" fontWeight="600"
              >
                {card.id}
              </text>

              {/* stats: ratio + area */}
              <text
                x={cx} y={labelY + 15}
                textAnchor="middle" fontSize={10} fill="#333"
              >
                {card.width.toFixed(0)}×{card.height.toFixed(0)} ({ratio}:1) ≈{area}px²
              </text>
            </g>
          )
        })}
      </svg>

      {/* ── legend table ────────────────────────────────────────────────────── */}
      <table style={{ marginTop: 16, borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            {['#','id','value→area','w','h','ratio','startx','starty'].map(h => (
              <th key={h} style={{ padding: '4px 10px', border: '1px solid #ccc' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cards.map((card, i) => (
            <tr key={card.id} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
              <td style={{ padding: '3px 10px', border: '1px solid #ddd' }}>
                <span style={{
                  background: colorFor(i), color: '#fff',
                  borderRadius: 10, padding: '1px 7px', fontWeight: 'bold'
                }}>{i}</span>
              </td>
              <td style={{ padding: '3px 10px', border: '1px solid #ddd' }}>{card.id}</td>
              <td style={{ padding: '3px 10px', border: '1px solid #ddd' }}>
                {Math.round(card.width * card.height)}px²
              </td>
              <td style={{ padding: '3px 10px', border: '1px solid #ddd' }}>{card.width.toFixed(1)}</td>
              <td style={{ padding: '3px 10px', border: '1px solid #ddd' }}>{card.height.toFixed(1)}</td>
              <td style={{ padding: '3px 10px', border: '1px solid #ddd' }}>
                {(card.width / card.height).toFixed(2)}
              </td>
              <td style={{ padding: '3px 10px', border: '1px solid #ddd' }}>{card.startx.toFixed(1)}</td>
              <td style={{ padding: '3px 10px', border: '1px solid #ddd' }}>{card.starty.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── free segment count ──────────────────────────────────────────────── */}
      <p style={{ marginTop: 8, fontSize: 12, color: '#111' }}>
        Free segments remaining: <strong>{freeSegments.length}</strong>
        {' '}· Cards placed: <strong>{cards.length}</strong>
        {' '}· Unplaced: <strong>{concepts.length - cards.length}</strong>
      </p>
    </div>
  )
}