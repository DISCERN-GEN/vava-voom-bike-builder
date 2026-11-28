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

export const SIZE_INFO: Record<Size, { baseCents: number; drivetrain: string; label: string; kids: boolean; highlights: string }> = {
  "12": { baseCents: 38000, drivetrain: "Single-speed", label: '12"', kids: true, highlights: "Training wheels, sturdy build" },
  "14": { baseCents: 52000, drivetrain: "Single-speed", label: '14"', kids: true, highlights: "Training wheels, sturdy build" },
  "16": { baseCents: 72000, drivetrain: "Single-speed", label: '16"', kids: true, highlights: "Training wheels, sturdy build" },
  "18": { baseCents: 92000, drivetrain: "21-speed (3x7)", label: '18"', kids: false, highlights: "21-speed 3x7" },
  "20": { baseCents: 129000, drivetrain: "21-speed (3x7)", label: '20"', kids: false, highlights: "21-speed 3x7" },
  "22": { baseCents: 149000, drivetrain: "21-speed (3x7)", label: '22"', kids: false, highlights: "21-speed 3x7" },
  "24": { baseCents: 169000, drivetrain: "21-speed (3x7)", label: '24"', kids: false, highlights: "21-speed 3x7" },
  "26": { baseCents: 189000, drivetrain: "21-speed (3x7)", label: '26"', kids: false, highlights: "21-speed 3x7 or 28-speed 3x8 (+R350)" },
  "27.5": { baseCents: 325000, drivetrain: "1x12-speed (10-51)", label: '27.5" Flagship', kids: false, highlights: "1x12-speed 10-51, all upgrades included" },
};

export const FRAMES = {
  hardtail: { name: "Standard MTB Hardtail", desc: "Classic trail geometry. Does everything well." },
  hybrid: { name: "Cruiser-Sport Hybrid", desc: "Relaxed and upright for town and gravel." },
  dirtjump: { name: "Sloping Dirt-Jump Style", desc: "Low, sloping top tube for tricks and pump tracks." },
  curved: { name: "Slightly Curved Ladies MTB", desc: "Gently curved top tube, easy step-over." }, // TODO: final photo
  yframe: { name: "Kiddies Y Frame", desc: "Tough Y-shape made for little riders." }, // TODO: final photo
} as const;
export type FrameId = keyof typeof FRAMES;

export const FORKS = {
  standard: { name: "Standard Rigid Fork", desc: "Sturdy, no-fuss front end." },
  single: { name: "Single-Crown Gas Suspension Fork", desc: "Suspension that soaks up bumps." },
  double: { name: "Dual-Crown Gas Shock Fork", desc: "Moto-style, built for big hits." },
} as const;
export type ForkId = keyof typeof FORKS;

export const BARS = {
  flat: { name: "Flat Trail Bar", desc: "Straight and precise." },
  riser: { name: "Riser Moto Bar", desc: "Raised with a crossbar. Attitude." },
  swept: { name: "Swept Cruiser Bar", desc: "Swept back for a comfy upright ride." },
} as const;
export type BarId = keyof typeof BARS;

export const GEARS = {
  derailleur: { name: "Derailleur System", desc: "Classic external gears with the most range." },
  hub: { name: "Internal Hub Gear", desc: "Gears sealed inside the rear hub. Low maintenance." },
} as const;
export type GearId = keyof typeof GEARS;

/** Upgrade prices in cents for 18"–26". Kids (12"–16") pay 50%. Standard rigid fork is included in the base price. */
export const UPGRADE_CENTS = {
  single: 35000,
  double: 45000,
  discs: 30000,
  tyres: 25000,
} as const;
/** Full package = dual-crown fork + disc brakes + tyre upgrade. Kids' sizes pay half (like every upgrade). */
export const PACKAGE_CENTS = 75000;
export const DRIVE28_CENTS = 35000; // 26" derailleur only
export const DECAL_CENTS = 5000; // all bikes
// TODO(owner): confirm internal hub gear price (currently R0).
export const HUB_GEAR_CENTS = 0;
// TODO(owner): confirm decal length/character rules.
export const DECAL_MAX = 12;
export const DECAL_PATTERN = /^[A-Za-z0-9 .'!-]*$/;
// TODO(owner): mechanical vs hydraulic disc brake spec.
export const DISC_BRAKE_SPEC = "Disc brakes (mechanical/hydraulic spec TBC)";

export const HEX = /^#[0-9A-Fa-f]{6}$/;

export const configSchema = z.object({
  size: z.enum(SIZES),
  frame: z.enum(["hardtail", "hybrid", "dirtjump", "curved", "yframe"]),
  fork: z.enum(["standard", "single", "double"]),
  bars: z.enum(["flat", "riser", "swept"]),
  gears: z.enum(["derailleur", "hub"]),
  discs: z.boolean(),
  tyres: z.boolean(),
  drive28: z.boolean(),
  base: z.enum(["black", "white"]),
  accent: z.string().regex(HEX),
  decalScheme: z.enum(["wob", "bow"]),
  decal: z.string(),
});
export type BikeConfig = z.infer<typeof configSchema>;

export const DEFAULT_CONFIG: BikeConfig = {
  size: "26",
  frame: "hardtail",
  fork: "standard",
  bars: "flat",
  gears: "derailleur",
  discs: false,
  tyres: false,
  drive28: false,
  base: "black",
  accent: "#A3E635",
  decalScheme: "wob",
  decal: "",
};

export const isKids = (s: Size) => SIZE_INFO[s].kids;
export const isFlagship = (s: Size) => s === "27.5";
/** Only the Flagship includes disc brakes; on every other size they are a paid upgrade. */
export const discsIncluded = (s: Size) => isFlagship(s);
export const baseColourName = (b: BikeConfig["base"]) => (b === "black" ? "Charcoal Black" : "White");

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
  out.tyres = out.tyres === true;
  if (isKids(out.size)) out.gears = "derailleur";
  if (out.size !== "26" || out.gears !== "derailleur") out.drive28 = false;
  if (isFlagship(out.size)) { out.fork = "double"; out.discs = true; out.tyres = true; }
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

export type LineItem = { label: string; cents: number };

const half = (cents: number) => Math.round(cents / 2);

export function priceLines(input: BikeConfig): LineItem[] {
  const c = clampConfig(input);
  const info = SIZE_INFO[c.size];
  const lines: LineItem[] = [{ label: `${info.label} base bike`, cents: info.baseCents }];
  const adj = (cents: number) => (isKids(c.size) ? half(cents) : cents);
  if (isFlagship(c.size)) {
    lines.push({ label: `All upgrades included (${FORKS[c.fork].name}, disc brakes, upgraded tyres)`, cents: 0 });
  } else if (c.fork === "double" && c.discs && c.tyres) {
    lines.push({ label: "Full package (dual-crown fork, disc brakes, tyre upgrade)", cents: adj(PACKAGE_CENTS) });
  } else {
    if (c.fork === "double") lines.push({ label: FORKS.double.name, cents: adj(UPGRADE_CENTS.double) });
    if (c.fork === "single") lines.push({ label: FORKS.single.name, cents: adj(UPGRADE_CENTS.single) });
    if (c.discs) lines.push({ label: "Disc brakes", cents: adj(UPGRADE_CENTS.discs) });
    if (c.tyres) lines.push({ label: "Tyre upgrade", cents: adj(UPGRADE_CENTS.tyres) });
  }
  if (c.gears === "hub" && HUB_GEAR_CENTS) lines.push({ label: GEARS.hub.name, cents: HUB_GEAR_CENTS });
  if (c.drive28) lines.push({ label: "28-speed (3x8) drivetrain", cents: DRIVE28_CENTS });
  if (c.decal.trim()) lines.push({ label: `Personalised decal "${c.decal.trim()}"`, cents: DECAL_CENTS });
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
  if (isKids(c.size)) return SIZE_INFO[c.size].drivetrain;
  const speed = c.drive28 ? "28-speed (3x8)" : SIZE_INFO[c.size].drivetrain;
  return `${GEARS[c.gears].name}, ${speed}`;
}

/** Live build summary rows: Size, Frame, Fork, Handlebar, Gears, Brakes, Base, Accent, Decal, Name. */
export function summaryRows(c0: BikeConfig): [string, string][] {
  const c = clampConfig(c0);
  return [
    ["Size", SIZE_INFO[c.size].label],
    ["Frame", FRAMES[c.frame].name],
    ["Fork", FORKS[c.fork].name],
    ["Handlebar", BARS[c.bars].name],
    ["Gears", drivetrainLabel(c)],
    ["Brakes", c.discs ? (discsIncluded(c.size) ? "Disc brakes (included)" : "Disc brakes") : "Standard rim brakes"],
    ["Tyres", c.tyres ? "Upgraded tyres" : "Medium-fat tyres"],
    ["Base colour", baseColourName(c.base)],
    ["Accent colour", c.accent],
    ["Decal", c.decalScheme === "wob" ? "White on Black" : "Black on White"],
    ["Name", c.decal.trim() || "(none)"],
  ];
}

/* ---------------- Wizard steps ---------------- */
export const STEPS = ["size", "frame", "fork", "bars", "drive", "brakes", "paint", "decal", "summary"] as const;
export type StepId = (typeof STEPS)[number];
export const STEP_TITLES: Record<StepId, string> = {
  size: "Wheel size",
  frame: "Frame style",
  fork: "Front fork",
  bars: "Handlebars",
  drive: "Gears & drive",
  brakes: "Wheels & brakes",
  paint: "Colour",
  decal: "Decals",
  summary: "Summary",
};

export function stepApplies(step: StepId, c: BikeConfig) {
  if (step === "fork" || step === "brakes") return !isFlagship(c.size);
  if (step === "drive") return !isKids(c.size);
  return true;
}
export const activeSteps = (c: BikeConfig) => STEPS.filter((s) => stepApplies(s, c));
export function clampStep(step: string, c: BikeConfig): StepId {
  const idx = Math.max(0, STEPS.indexOf(step as StepId));
  for (const candidate of STEPS.slice(idx)) if (stepApplies(candidate, c)) return candidate;
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
    ...summaryRows(c).map(([k, v]) => `${k}: ${v}`),
    ...(isKids(c.size) ? ["Training wheels: Included"] : []),
  ];
}

/** AI prompt builder — describes the bike only; text/branding is overlaid client-side. */
export function buildAiPrompt(c0: BikeConfig): string {
  const c = clampConfig(c0);
  return [
    `Photorealistic studio product render of a ${SIZE_INFO[c.size].label} bicycle, side view, on a dark neon garage floor.`,
    `Frame: ${FRAMES[c.frame].name}. Fork: ${FORKS[c.fork].name}. Handlebars: ${BARS[c.bars].name}. Gears: ${drivetrainLabel(c)}.`,
    `${c.discs ? "Disc brakes" : "Rim brakes"}. ${c.tyres ? "Upgraded all-terrain tyres" : "Medium-fat tyres"}.`,
    `Frame paint: ${c.base === "black" ? "charcoal black (#1F2124)" : "white (#F4F6F8)"} base with accent colour exactly ${c.accent} on the fork, rims and frame stripes.`,
    isKids(c.size) ? "Fitted with training wheels." : "",
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
