/**
 * In-site AI mockup using the shopper's OWN ChatGPT (OpenAI) or Gemini API key.
 * Keys live only in this browser tab's sessionStorage and go straight to the provider —
 * never into URLs, our servers, or analytics.
 */
export type Provider = "openai" | "gemini";
export const PROVIDERS: Record<Provider, { name: string; keyHint: string; keyUrl: string }> = {
  openai: { name: "ChatGPT (OpenAI)", keyHint: "sk-…", keyUrl: "https://platform.openai.com/api-keys" },
  gemini: { name: "Gemini (Google)", keyHint: "AIza…", keyUrl: "https://aistudio.google.com/apikey" },
};

const keyName = (p: Provider) => `vv.ai.key.${p}`;
export const tokenStore = {
  get(p: Provider): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(keyName(p));
  },
  set(p: Provider, token: string) {
    sessionStorage.setItem(keyName(p), token.trim());
  },
  clear(p: Provider) {
    sessionStorage.removeItem(keyName(p));
  },
};

export type AiErrorKind = "auth" | "quota" | "request" | "network" | "provider";
export class AiError extends Error {
  constructor(public kind: AiErrorKind, message: string) {
    super(message);
  }
}
export function classifyStatus(status: number): AiErrorKind {
  if (status === 401 || status === 403) return "auth";
  if (status === 429 || status === 402) return "quota";
  if (status === 400 || status === 404 || status === 422) return "request";
  return "provider";
}
export const AI_ERROR_COPY: Record<AiErrorKind, string> = {
  auth: "Your key was rejected. Check it, or disconnect and connect again.",
  quota: "Your account is out of quota or rate-limited. Try later or switch provider.",
  request: "The provider couldn't process this request. Try again or switch provider.",
  network: "Couldn't reach the provider. Check your connection.",
  provider: "The provider had a problem. Try again in a moment.",
};

async function safeFetch(url: string, init: RequestInit) {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new AiError("network", AI_ERROR_COPY.network);
  }
  if (!res.ok) {
    const kind = classifyStatus(res.status);
    throw new AiError(kind, AI_ERROR_COPY[kind]);
  }
  return res.json() as Promise<unknown>;
}

const blobToB64 = async (b: Blob) => {
  const buf = new Uint8Array(await b.arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
};

export async function generateWithProvider(p: Provider, token: string, prompt: string, reference: Blob): Promise<string> {
  if (p === "openai") {
    const fd = new FormData();
    fd.append("model", "gpt-image-1");
    fd.append("prompt", prompt);
    fd.append("size", "1536x1024");
    fd.append("image", new File([reference], "reference.png", { type: "image/png" }));
    const json = (await safeFetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })) as { data?: { b64_json?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new AiError("provider", "No image returned.");
    return `data:image/png;base64,${b64}`;
  }
  const json = (await safeFetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": token },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/png", data: await blobToB64(reference) } }] }],
      }),
    },
  )) as { candidates?: { content?: { parts?: { inlineData?: { data: string; mimeType: string }; inline_data?: { data: string; mime_type: string } }[] } }[] };
  for (const part of json.candidates?.[0]?.content?.parts ?? []) {
    const d = part.inlineData ?? (part.inline_data && { data: part.inline_data.data, mimeType: part.inline_data.mime_type });
    if (d) return `data:${d.mimeType};base64,${d.data}`;
  }
  throw new AiError("provider", "No image returned.");
}

/* ---------- canvas helpers ---------- */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, fail) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => ok(img);
    img.onerror = () => fail(new Error("image load failed"));
    img.src = src;
  });
}

/** Draw a catalogue photo (cover-fit) onto a PNG canvas to use as the AI reference image. */
export async function imageToPng(src: string, w = 1536, h = 1024): Promise<Blob> {
  const img = await loadImage(src);
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d")!;
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  return await new Promise((ok, fail) => cv.toBlob((b) => (b ? ok(b) : fail(new Error("toBlob failed"))), "image/png"));
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** Share of pixels close to the accent colour (0..1). */
export function accentCoverage(pixels: Uint8ClampedArray, hex: string, tolerance = 60) {
  const [r, g, b] = hexToRgb(hex);
  let hit = 0;
  const total = pixels.length / 4;
  for (let i = 0; i < pixels.length; i += 4) {
    const d = Math.hypot(pixels[i]! - r, pixels[i + 1]! - g, pixels[i + 2]! - b);
    if (d <= tolerance) hit++;
  }
  return hit / total;
}
export async function accentMatches(src: string, hex: string) {
  const img = await loadImage(src);
  const cv = document.createElement("canvas");
  cv.width = 96;
  cv.height = 64;
  const ctx = cv.getContext("2d")!;
  ctx.drawImage(img, 0, 0, 96, 64);
  return accentCoverage(ctx.getImageData(0, 0, 96, 64).data, hex) >= 0.005;
}

/** Overlay rider decal + official branding client-side so text never gets garbled. */
export async function composeMockup(src: string, logoUrl: string, decal: string, scheme: "wob" | "bow"): Promise<string> {
  const img = await loadImage(src);
  const cv = document.createElement("canvas");
  cv.width = img.width;
  cv.height = img.height;
  const ctx = cv.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  try {
    const logo = await loadImage(logoUrl);
    const lw = cv.width * 0.22;
    ctx.drawImage(logo, cv.width * 0.03, cv.height * 0.04, lw, (lw * logo.height) / logo.width);
  } catch {
    /* logo optional */
  }
  if (decal.trim()) {
    const fs = Math.round(cv.height * 0.06);
    ctx.font = `italic 900 ${fs}px Anton, Impact, sans-serif`;
    const text = decal.trim().toUpperCase();
    const tw = ctx.measureText(text).width;
    const x = cv.width - tw - cv.width * 0.05;
    const y = cv.height * 0.12;
    ctx.fillStyle = scheme === "wob" ? "#0A0A0A" : "#F4F6F8";
    ctx.fillRect(x - fs * 0.4, y - fs, tw + fs * 0.8, fs * 1.3);
    ctx.fillStyle = scheme === "wob" ? "#F4F6F8" : "#0A0A0A";
    ctx.fillText(text, x, y);
  }
  const bar = Math.round(cv.height * 0.05);
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, cv.height - bar, cv.width, bar);
  ctx.fillStyle = "#F4F6F8";
  ctx.font = `${Math.round(bar * 0.45)}px system-ui, sans-serif`;
  ctx.fillText("AI-generated illustration. Final build follows your saved spec.", bar * 0.5, cv.height - bar * 0.35);
  return cv.toDataURL("image/png");
}

/* ---------- cache by config hash (memory + session) ---------- */
const mem = new Map<string, string>();
export const mockupCache = {
  get(hash: string, p: Provider) {
    const k = `vv.mock.${p}.${hash}`;
    return mem.get(k) ?? (typeof window !== "undefined" ? sessionStorage.getItem(k) : null);
  },
  set(hash: string, p: Provider, dataUrl: string) {
    const k = `vv.mock.${p}.${hash}`;
    mem.set(k, dataUrl);
    try {
      sessionStorage.setItem(k, dataUrl);
    } catch {
      /* quota — memory only */
    }
  },
};
