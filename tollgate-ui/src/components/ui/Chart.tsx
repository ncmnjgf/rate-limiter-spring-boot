import { useMemo } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Series {
  id: string;
  color: string;
  data: number[];
}

interface ChartProps {
  series: Series[];
  height?: number;
}

export function SparklineChart({ series, height = 200 }: ChartProps) {
  // Simple sparkline using SVG
  const width = 800; // viewbox width
  const pad = 20;

  const paths = useMemo(() => {
    return series.map(s => {
      if (s.data.length === 0) return { ...s, path: '', fillPath: '' };
      
      const maxVal = Math.max(...series.flatMap(si => si.data), 10);
      const stepX = (width - pad * 2) / Math.max(s.data.length - 1, 1);
      
      const points: Point[] = s.data.map((val, i) => ({
        x: pad + i * stepX,
        y: height - pad - (val / maxVal) * (height - pad * 2)
      }));

      // Generate straight SVG path
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
      }

      // Generate fill path closing to bottom
      const fillPath = `${d} L ${points[points.length - 1].x} ${height - pad} L ${points[0].x} ${height - pad} Z`;

      return { ...s, path: d, fillPath };
    });
  }, [series, height]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-white" preserveAspectRatio="none">
      <defs>
        {series.map((s) => (
          <linearGradient key={`grad-${s.id}`} id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
          </linearGradient>
        ))}
      </defs>
      {/* Grid lines */}
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <line x1={pad} y1={pad} x2={width - pad} y2={pad} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4"/>
      
      {paths.map((p) => (
        <g key={p.id}>
          <path d={p.fillPath} fill={`url(#grad-${p.id})`} />
          <path d={p.path} fill="none" stroke={p.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md" />
        </g>
      ))}
    </svg>
  );
}
