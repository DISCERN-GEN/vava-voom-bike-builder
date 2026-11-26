import { type BikeConfig, SIZES } from "@/lib/catalog";

type P = { x: number; y: number };
const pt = (x: number, y: number): P => ({ x, y });
const line = (a: P, b: P) => `M${a.x} ${a.y}L${b.x} ${b.y}`;

export function BikeSvg({ config, className, title }: { config: BikeConfig; className?: string; title?: string }) {
  const c = config;
  const idx = SIZES.indexOf(c.size);
  const r = 44 + idx * 3; // wheel radius by size
  const ground = 225;
  const R = pt(105, ground - r);
  const F = pt(300, ground - r);
  const BB = pt(190, ground - r + 8);
  const S = pt(165, 85 + (8 - idx) * 3);
  const H = pt(278, 92 + (8 - idx) * 2);
  const HB = pt(286, 122 + (8 - idx) * 1.5);
  const base = c.base === "black" ? "#111318" : "#F4F6F8";
  const outline = c.base === "black" ? "#3a4250" : "#c9ced6";
  const accent = c.accent;

  let frame = "";
  switch (c.frame) {
    case "hardtail":
      frame = [line(S, H), line(BB, HB), line(BB, S), line(R, BB), line(R, S), line(H, HB)].join("");
      break;
    case "dirtjump": {
      const S2 = pt(S.x + 8, S.y + 28);
      frame = [line(S2, H), line(BB, HB), line(BB, S2), line(R, BB), line(R, S2), line(H, HB)].join("");
      break;
    }
    case "hybrid": {
      const T = pt(S.x + 2, S.y + 12);
      frame = [line(T, pt(H.x, H.y + 6)), line(BB, HB), line(BB, S), line(R, BB), line(R, T), line(H, HB)].join("");
      break;
    }
    case "curved":
      frame = [`M${S.x} ${S.y + 8}Q${(S.x + HB.x) / 2} ${BB.y - 10} ${HB.x} ${HB.y - 10}`, line(BB, HB), line(BB, S), line(R, BB), line(R, S), line(H, HB)].join("");
      break;
    case "yframe": {
      const J = pt(215, 125);
      frame = [line(BB, J), line(J, H), line(J, S), line(R, BB), line(R, S), line(H, HB)].join("");
      break;
    }
  }

  const forkTop = c.fork === "double" ? pt(H.x - 4, H.y - 14) : HB;
  const tyreW = c.tyres ? 11 : 7;
  const bar =
    c.bars === "flat"
      ? `M${H.x - 22} ${H.y - 14}L${H.x + 22} ${H.y - 14}`
      : c.bars === "riser"
        ? `M${H.x - 24} ${H.y - 26}L${H.x - 12} ${H.y - 14}L${H.x + 6} ${H.y - 14}M${H.x - 18} ${H.y - 20}L${H.x} ${H.y - 20}`
        : `M${H.x - 34} ${H.y - 22}Q${H.x - 4} ${H.y - 6} ${H.x + 4} ${H.y - 14}`;
  const decalFill = c.decalScheme === "wob" ? "#F4F6F8" : "#0A0A0A";
  const decalBg = c.decalScheme === "wob" ? "#0A0A0A" : "#F4F6F8";
  const id = `dt-${c.frame}-${idx}`;

  return (
    <svg viewBox="0 0 400 240" className={className} role="img" aria-label={title ?? "Bike preview"}>
      <ellipse cx="200" cy={ground + 6} rx="170" ry="8" fill={accent} opacity="0.18" />
      {[R, F].map((w, i) => (
        <g key={i}>
          <circle cx={w.x} cy={w.y} r={r} fill="none" stroke="#050607" strokeWidth={tyreW} />
          <circle cx={w.x} cy={w.y} r={r - tyreW / 2 - 2} fill="none" stroke={accent} strokeWidth="2.5" />
          {Array.from({ length: 12 }).map((_, k) => {
            const a = (k / 12) * Math.PI * 2;
            return <line key={k} x1={w.x} y1={w.y} x2={w.x + Math.cos(a) * (r - 8)} y2={w.y + Math.sin(a) * (r - 8)} stroke="#6b7380" strokeWidth="0.8" />;
          })}
          {c.discs && <circle cx={w.x} cy={w.y} r="11" fill="none" stroke="#b9c0ca" strokeWidth="2.5" />}
          <circle cx={w.x} cy={w.y} r="4" fill={accent} />
        </g>
      ))}
      {c.training && (
        <g stroke="#8D96A5" strokeWidth="3" fill="none">
          <path d={line(R, pt(R.x - 22, ground - 14))} />
          <circle cx={R.x - 22} cy={ground - 14} r="13" fill="#0E1117" />
        </g>
      )}
      <path d={frame} fill="none" stroke={outline} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <path d={frame} fill="none" stroke={base} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d={frame} fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      {/* fork */}
      <path d={line(forkTop, F)} stroke={c.fork === "standard" ? base : accent} strokeWidth={c.fork === "standard" ? 6 : 9} strokeLinecap="round" />
      {c.fork !== "standard" && <path d={line(forkTop, pt((forkTop.x + F.x) / 2, (forkTop.y + F.y) / 2))} stroke="#d8dde3" strokeWidth="4" strokeLinecap="round" />}
      {c.fork === "double" && (
        <>
          <path d={`M${H.x - 12} ${H.y - 12}L${H.x + 8} ${H.y - 12}`} stroke="#d8dde3" strokeWidth="4" strokeLinecap="round" />
          <path d={`M${HB.x - 10} ${HB.y + 2}L${HB.x + 10} ${HB.y + 2}`} stroke="#d8dde3" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {/* stem + bars */}
      <path d={line(H, pt(H.x, H.y - 14))} stroke="#9aa3ae" strokeWidth="4" />
      <path d={bar} fill="none" stroke="#c9ced6" strokeWidth="4" strokeLinecap="round" />
      {/* seat */}
      <path d={line(S, pt(S.x - 4, S.y - 14))} stroke="#9aa3ae" strokeWidth="4" />
      <path d={`M${S.x - 22} ${S.y - 16}Q${S.x - 4} ${S.y - 22} ${S.x + 12} ${S.y - 15}`} stroke="#0A0A0A" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* crank */}
      <circle cx={BB.x} cy={BB.y} r="10" fill="none" stroke="#c9ced6" strokeWidth="3" />
      <path d={line(BB, R)} stroke="#6b7380" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* decal on down tube */}
      {c.decal.trim() && (
        <>
          <path id={id} d={line(BB, HB)} fill="none" />
          <text fontSize="11" fontWeight="900" fontStyle="italic" letterSpacing="1" fill={decalFill} stroke={decalBg} strokeWidth="2.5" paintOrder="stroke" style={{ fontFamily: "Anton, Impact, sans-serif", textTransform: "uppercase" }}>
            <textPath href={`#${id}`} startOffset="50%" textAnchor="middle" dy="4">
              {c.decal.trim().toUpperCase()}
            </textPath>
          </text>
        </>
      )}
    </svg>
  );
}
