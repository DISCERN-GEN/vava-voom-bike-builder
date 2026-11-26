/**
 * VaVa Voom Cycles — single source of truth for catalog, prices and build rules.
 * Used by the storefront, pricing engine, cart/order spec generator and AI prompt builder.
 * All money is integer cents (ZAR), VAT-inclusive (15%).
 */
import { z } from "zod";

export const PRICE_TABLE_EFFECTIVE = "2026-11-01";
export const VAT_RATE_PERCENT = 15;

export const SIZES = ["12", "14", "16", "18", "20", "22", "24", "26", "27.5"] as const;
export type Size = (typeof SIZES)[number];

export const SIZE_INFO: Record<Size, { baseCents: number; drivetrain: string; label: string; kids: boolean }> = {
  "12": { baseCents: 38000, drivetrain: "Single-speed", label: '12"', kids: true },
  "14": { baseCents: 52000, drivetrain: "Single-speed", label: '14"', kids: true },
  "16": { baseCents: 72000, drivetrain: "Single-speed", label: '16"', kids: true },
  "18": { baseCents: 92000, drivetrain: "21-speed (3x7)", label: '18"', kids: false },
  "20": { baseCents: 129000, drivetrain: "21-speed (3x7)", label: '20"', kids: false },
  "22": { baseCents: 149000, drivetrain: "21-speed (3x7)", label: '22"', kids: false },
  "24": { baseCents: 169000, drivetrain: "21-speed (3x7)", label: '24"', kids: false },
  "26": { baseCents: 189000, drivetrain: "21-speed (3x7)", label: '26"', kids: false },
  "27.5": { baseCents: 325000, drivetrain: "12-speed (10:51)", label: '27.5" Flagship', kids: false },
};

export const FRAMES = {
  hardtail: { name: "Standard MTB Hardtail", desc: "Classic trail geometry. Does everything well." },
  dirtjump: { name: "Sloping Dirt-Jump", desc: "Low, sloping top tube for tricks and pump tracks." },
  hybrid: { name: "Cruiser-Sport Hybrid", desc: "Relaxed and upright for town and gravel." },
  curved: { name: "Feminine Curved", desc: "Gently curved top tube, easy step-over." }, // TODO: final silhouette art
  yframe: { name: "Classic Kiddies Y-frame", desc: "Tough Y-shape made for little riders." }, // TODO: final silhouette art
} as const;
export type FrameId = keyof typeof FRAMES;

export const FORKS = {
  standard: { name: "Standard rigid fork", desc: "Light and simple. Included." },
  single: { name: "Single-crown shock fork", desc: "Suspension that soaks up bumps." },
  double: { name: "Double-crown shock fork", desc: "Moto-style, built for big hits." },
} as const;
export type ForkId = keyof typeof FORKS;

export const BARS = {
  flat: { name: "Flat Trail Bar", desc: "Straight and precise." },
  riser: { name: "Riser Moto Bar", desc: "Raised with a crossbar. Attitude." },
  swept: { name: "Swept Cruiser Bar", desc: "Swept back for a comfy upright ride." },
} as const;
export type BarId = keyof typeof BARS;

/** Upgrade prices in cents for 18"–26". Kids (12"–16") pay 50%. */
export const UPGRADE_CENTS = {
  single: 35000,
  double: 45000,
  discs: 30000,
  tyres: 25000,
  package: 75000,
} as const;
export const DRIVE28_CENTS = 35000; // 26" only, outside the package
export const DECAL_CENTS = 5000; // all bikes
// TODO(owner): confirm training wheels price.
export const TRAINING_WHEELS_CENTS = 15000;
// TODO(owner): confirm the full package applies to 12"–16" (currently allowed at 50%).
export const KIDS_PACKAGE_ENABLED = true;
// TODO(owner): confirm decal length/character rules.
export const DECAL_MAX = 12;
export const DECAL_PATTERN = /^[A-Za-z0-9 .'!-]*$/;
// TODO(owner): mechanical vs hydraulic disc brake spec.
export const DISC_BRAKE_SPEC = "Disc brakes (mechanical/hydraulic spec TBC)";

export const HEX = /^#[0-9A-Fa-f]{6}$/;

export const configSchema = z.object({
  size: z.enum(SIZES),
  frame: z.enum(["hardtail", "dirtjump", "hybrid", "curved", "yframe"]),
  fork: z.enum(["standard", "single", "double"]),
  bars: z.enum(["flat", "riser", "swept"]),
  tyres: z.boolean(),
  discs: z.boolean(),
  drive28: z.boolean(),
  base: z.enum(["black", "white"]),
  accent: z.string().regex(HEX),
  decalScheme: z.enum(["wob", "bow"]),
  decal: z.string(),
  training: z.boolean(),
});
export type BikeConfig = z.infer<typeof configSchema>;

export const DEFAULT_CONFIG: BikeConfig = {
  size: "26",
  frame: "hardtail",
  fork: "standard",
  bars: "flat",
  tyres: false,
  discs: false,
  drive28: false,
  base: "black",
  accent: "#A3E635",
  decalScheme: "wob",
  decal: "",
  training: false,
};

export const isKids = (s: Size) => SIZE_INFO[s].kids;
export const isFlagship = (s: Size) => s === "27.5";

export function sanitizeDecal(text: string): string {
  return text
    .split("")
    .filter((c) => DECAL_PATTERN.test(c))
    .join("")
    .slice(0, DECAL_MAX);
}

/** Force any config into a legal combination. */
export function clampConfig(c: BikeConfig): BikeConfig {
  const out = { ...c };
  if (out.frame === "yframe" && !isKids(out.size)) out.frame = "hardtail";
  if (!isKids(out.size)) out.training = false;
  if (out.size !== "26") out.drive28 = false;
  if (isFlagship(out.size)) {
    out.fork = "double";
    out.discs = true;
    out.tyres = true;
  }
  if (!HEX.test(out.accent)) out.accent = DEFAULT_CONFIG.accent;
  out.accent = out.accent.toUpperCase();
  out.decal = sanitizeDecal(out.decal);
  return out;
}

/** Parse anything (e.g. a pasted URL payload) into a valid, clamped config. Field-wise fallback. */
export function parseConfig(input: unknown): BikeConfig {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const shape = configSchema.shape;
  const merged = { ...DEFAULT_CONFIG } as Record<string, unknown>;
  for (const key of Object.keys(shape) as (keyof BikeConfig)[]) {
    const r = shape[key].safeParse(raw[key]);
    if (r.success) merged[key] = r.data;
  }
  return clampConfig(merged as BikeConfig);
}

export function hasPackage(c: BikeConfig) {
  return c.fork === "double" && c.discs && c.tyres;
}

export type LineItem = { label: string; cents: number };

const half = (cents: number) => Math.round(cents / 2);

export function priceLines(input: BikeConfig): LineItem[] {
  const c = clampConfig(input);
  const info = SIZE_INFO[c.size];
  const lines: LineItem[] = [{ label: `${info.label} base bike`, cents: info.baseCents }];
  const adj = (cents: number) => (isKids(c.size) ? half(cents) : cents);
  if (isFlagship(c.size)) {
    lines.push({ label: "All upgrades included (double-crown, discs, tyres)", cents: 0 });
  } else if (hasPackage(c) && (KIDS_PACKAGE_ENABLED || !isKids(c.size))) {
    lines.push({ label: "Full package: double-crown + discs + tyres", cents: adj(UPGRADE_CENTS.package) });
  } else {
    if (c.fork === "single") lines.push({ label: FORKS.single.name, cents: adj(UPGRADE_CENTS.single) });
    if (c.fork === "double") lines.push({ label: FORKS.double.name, cents: adj(UPGRADE_CENTS.double) });
    if (c.discs) lines.push({ label: "Disc brakes", cents: adj(UPGRADE_CENTS.discs) });
    if (c.tyres) lines.push({ label: "Tyre upgrade", cents: adj(UPGRADE_CENTS.tyres) });
  }
  if (c.drive28) lines.push({ label: "28-speed drivetrain", cents: DRIVE28_CENTS });
  if (c.decal.trim()) lines.push({ label: `Personalised decal "${c.decal.trim()}"`, cents: DECAL_CENTS });
  if (c.training) lines.push({ label: "Training wheels", cents: TRAINING_WHEELS_CENTS });
  return lines;
}

export const totalCents = (c: BikeConfig) => priceLines(c).reduce((s, l) => s + l.cents, 0);

/** VAT portion contained in a VAT-inclusive amount. */
export const vatOf = (inclusiveCents: number) => Math.round((inclusiveCents * VAT_RATE_PERCENT) / (100 + VAT_RATE_PERCENT));

export function formatZAR(cents: number) {
  const r = Math.floor(Math.abs(cents) / 100);
  const c = Math.abs(cents) % 100;
  return `${cents < 0 ? "-" : ""}R${r.toLocaleString("en-US")}.${String(c).padStart(2, "0")}`;
}

export function drivetrainLabel(c: BikeConfig) {
  return c.drive28 ? "28-speed" : SIZE_INFO[c.size].drivetrain;
}

/* ---------------- Wizard steps ---------------- */
export const STEPS = ["size", "frame", "fork", "bars", "wheels", "drive", "paint", "decal", "extras", "summary"] as const;
export type StepId = (typeof STEPS)[number];
export const STEP_TITLES: Record<StepId, string> = {
  size: "Wheel size",
  frame: "Frame style",
  fork: "Front fork",
  bars: "Handlebars",
  wheels: "Wheels & brakes",
  drive: "Drivetrain",
  paint: "Paint studio",
  decal: "Your decal",
  extras: "Extras",
  summary: "Summary",
};

export function stepApplies(step: StepId, c: BikeConfig) {
  if (step === "fork" || step === "wheels") return !isFlagship(c.size);
  if (step === "drive") return c.size === "26";
  if (step === "extras") return isKids(c.size);
  return true;
}
export const activeSteps = (c: BikeConfig) => STEPS.filter((s) => stepApplies(s, c));
export function clampStep(step: string, c: BikeConfig): StepId {
  const idx = Math.max(0, STEPS.indexOf(step as StepId));
  for (let i = idx; i < STEPS.length; i++) if (stepApplies(STEPS[i]!, c)) return STEPS[i]!;
  return "summary";
}

/* ---------------- URL encoding ---------------- */
const KEYS = Object.keys(DEFAULT_CONFIG) as (keyof BikeConfig)[];
export function encodeConfig(c: BikeConfig): string {
  return KEYS.map((k) => {
    const v = c[k];
    return `${k}:${typeof v === "boolean" ? (v ? "1" : "0") : encodeURIComponent(String(v))}`;
  }).join("~");
}
export function decodeConfig(s: string | undefined): BikeConfig {
  if (!s) return { ...DEFAULT_CONFIG };
  const raw: Record<string, unknown> = {};
  for (const part of s.split("~")) {
    const i = part.indexOf(":");
    if (i < 0) continue;
    const k = part.slice(0, i) as keyof BikeConfig;
    let v: string;
    try {
      v = decodeURIComponent(part.slice(i + 1));
    } catch {
      continue;
    }
    if (typeof DEFAULT_CONFIG[k] === "boolean") raw[k] = v === "1";
    else raw[k] = v;
  }
  return parseConfig(raw);
}

/* ---------------- Spec + hashing ---------------- */
export function configHash(c: BikeConfig): string {
  const s = encodeConfig(clampConfig(c));
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36).toUpperCase();
}

export function specLines(c0: BikeConfig): string[] {
  const c = clampConfig(c0);
  return [
    `Size: ${SIZE_INFO[c.size].label}`,
    `Frame: ${FRAMES[c.frame].name}`,
    `Fork: ${FORKS[c.fork].name}`,
    `Handlebars: ${BARS[c.bars].name}`,
    `Tyres: ${c.tyres ? "Upgraded" : "Medium-fat standard"}`,
    `Brakes: ${c.discs ? DISC_BRAKE_SPEC : "Standard rim brakes"}`,
    `Drivetrain: ${drivetrainLabel(c)}`,
    `Paint: ${c.base === "black" ? "Gloss Deep Black" : "Arctic White"} base, accent ${c.accent}`,
    `Decal scheme: ${c.decalScheme === "wob" ? "White-on-Black" : "Black-on-White"}`,
    `Decal text: ${c.decal.trim() || "(none)"}`,
    ...(isKids(c.size) ? [`Training wheels: ${c.training ? "Yes" : "No"}`] : []),
  ];
}

/** AI prompt builder — describes the bike only; text/branding is overlaid client-side. */
export function buildAiPrompt(c0: BikeConfig): string {
  const c = clampConfig(c0);
  return [
    `Photorealistic studio product render of a ${SIZE_INFO[c.size].label} bicycle, side view, on a dark neon garage floor.`,
    `Frame: ${FRAMES[c.frame].name}. Fork: ${FORKS[c.fork].name}. Handlebars: ${BARS[c.bars].name}.`,
    `${c.tyres ? "Chunky upgraded off-road tyres" : "Medium-fat tyres"}, ${c.discs ? "disc brakes" : "rim brakes"}.`,
    `Frame paint: ${c.base === "black" ? "gloss deep black (#0A0A0A)" : "arctic white (#F4F6F8)"} base with accent colour exactly ${c.accent} on the fork, rims and frame stripes.`,
    c.training ? "Fitted with training wheels." : "",
    "The reference is a VaVa Voom catalogue photo: match its real-bike style and proportions, but show ONE bike only, centred, with your specified frame, fork, bars and paint. Do NOT draw any text, letters, logos, price tags, badges or banners anywhere in the image.",
  ]
    .filter(Boolean)
    .join(" ");
}

/* ---------------- Business config ---------------- */
export const BUSINESS = {
  name: "VaVa Voom Cycles",
  address: "123 Victoria Street, Willowmore, 6445, Western Cape, South Africa",
  // TODO(owner): real WhatsApp number in international format, digits only.
  whatsapp: "27000000000",
  // TODO(owner): real orders email.
  email: "orders@vavavoomcycles.co.za",
  // TODO(owner): choose WhatsApp vs EFT as the primary order flow.
  orderFlow: "whatsapp" as "whatsapp" | "eft",
};
