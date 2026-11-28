/** Watermark stamped on mockup images when they are DOWNLOADED. The on-screen preview stays clean. */
export const WATERMARK_TEXT = "VAVA VOOM CYCLES";

export type WatermarkPlan = {
  text: string;
  fontPx: number;
  cornerFontPx: number;
  stepPx: number;
  angle: number;
  alpha: number;
  logoHeight: number;
};

/** Pure sizing rules (testable without a canvas). Scales with the image so it is always visible. */
export function watermarkPlan(width: number, height: number): WatermarkPlan {
  const base = Math.max(14, Math.round(Math.min(width, height) / 28));
  return {
    text: WATERMARK_TEXT,
    fontPx: base,
    cornerFontPx: Math.round(base * 1.7),
    stepPx: base * 9,
    angle: -Math.PI / 6,
    alpha: 0.28,
    logoHeight: Math.round(Math.min(width, height) / 9),
  };
}

function loadImage(src: string, cors: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = src;
  });
}

/**
 * Returns an object URL for a watermarked PNG of `src`. Always tiles the brand text diagonally and adds a
 * larger corner mark; the logo is added when it can be loaded without tainting the canvas.
 * Rejects if the image cannot be stamped, so an unmarked file is never handed out.
 */
export async function watermarkedImageUrl(src: string, logoUrl?: string): Promise<string> {
  const img = await loadImage(src, true);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  const p = watermarkPlan(w, h);
  const tokens = getComputedStyle(document.documentElement);
  const foreground = tokens.getPropertyValue("--foreground").trim();
  const extrusion = tokens.getPropertyValue("--extrusion").trim();
  const primary = tokens.getPropertyValue("--primary").trim();
  ctx.drawImage(img, 0, 0, w, h);

  ctx.save();
  ctx.globalAlpha = p.alpha;
  ctx.translate(w / 2, h / 2);
  ctx.rotate(p.angle);
  ctx.font = `700 ${p.fontPx}px Impact, "Arial Narrow Bold", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = foreground;
  ctx.strokeStyle = extrusion;
  ctx.lineWidth = Math.max(1, p.fontPx / 12);
  const reach = Math.hypot(w, h);
  for (let y = -reach; y <= reach; y += p.stepPx * 0.6) {
    for (let x = -reach; x <= reach; x += p.stepPx * 1.9) {
      const off = Math.round(y / (p.stepPx * 0.6)) % 2 ? p.stepPx : 0;
      ctx.strokeText(p.text, x + off, y);
      ctx.fillText(p.text, x + off, y);
    }
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.font = `700 ${p.cornerFontPx}px Impact, "Arial Narrow Bold", sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = primary;
  ctx.strokeStyle = extrusion;
  ctx.lineWidth = Math.max(2, p.cornerFontPx / 10);
  const margin = Math.round(p.cornerFontPx * 0.6);
  ctx.strokeText(p.text, w - margin, h - margin, Math.max(1, w - 2 * margin));
  ctx.fillText(p.text, w - margin, h - margin, Math.max(1, w - 2 * margin));
  if (logoUrl) {
    try {
      const logo = await loadImage(logoUrl, true);
      const lh = p.logoHeight;
      const lw = Math.round((logo.naturalWidth / logo.naturalHeight) * lh);
      ctx.drawImage(logo, margin, h - margin - lh, lw, lh);
    } catch {
      /* logo is best-effort; the text watermark is always applied */
    }
  }
  ctx.restore();

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create the image"))), "image/png"),
  );
  return URL.createObjectURL(blob);
}
