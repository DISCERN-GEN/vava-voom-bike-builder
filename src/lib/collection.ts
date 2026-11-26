import { type BikeConfig, DEFAULT_CONFIG, clampConfig } from "./catalog";

export type CollectionItem = { slug: string; name: string; tagline: string; config: BikeConfig };

export const COLLECTION: CollectionItem[] = [
  {
    slug: "dirt-jumper-26",
    name: '26" Dirt Jumper',
    tagline: "Sloping frame, double-crown fork, and disc brakes. Send it.",
    config: clampConfig({ ...DEFAULT_CONFIG, size: "26", frame: "dirtjump", fork: "double", discs: true, bars: "riser", accent: "#A3E635" }),
  },
  {
    slug: "trail-cruiser-28",
    name: "28-Speed Trail Cruiser",
    tagline: "Hybrid comfort with 28 gears and a single-crown shock fork.",
    config: clampConfig({ ...DEFAULT_CONFIG, size: "26", frame: "hybrid", fork: "single", bars: "swept", drive28: true, discs: true, base: "white", decalScheme: "bow", accent: "#22D3EE" }),
  },
  {
    slug: "mini-hardtail-16",
    name: "Matching Mini-Hardtail",
    tagline: 'A 16" hardtail for the little one, with training wheels.',
    config: clampConfig({ ...DEFAULT_CONFIG, size: "16", frame: "hardtail", fork: "single", accent: "#A3E635" }),
  },
];
