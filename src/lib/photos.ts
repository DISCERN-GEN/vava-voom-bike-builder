/** Owner's catalogue photography (from Google Drive), one photo per wheel size, plus part cut-outs. */
import type { BarId, ForkId, FrameId, Size } from "./catalog";
import b12 from "@/assets/catalogue/bike-12in.webp.asset.json";
import b14 from "@/assets/catalogue/bike-14in.webp.asset.json";
import b16 from "@/assets/catalogue/bike-16in.webp.asset.json";
import b18 from "@/assets/catalogue/bike-18in.webp.asset.json";
import b20 from "@/assets/catalogue/bike-20in.webp.asset.json";
import b22 from "@/assets/catalogue/bike-22in.webp.asset.json";
import b24 from "@/assets/catalogue/bike-24in.webp.asset.json";
import b26 from "@/assets/catalogue/bike-26in.webp.asset.json";
import b275 from "@/assets/catalogue/bike-27_5in.webp.asset.json";
import fHard from "@/assets/catalogue/frame-hardtail.webp.asset.json";
import fDirt from "@/assets/catalogue/frame-dirtjump.webp.asset.json";
import fHyb from "@/assets/catalogue/frame-hybrid.webp.asset.json";
import kSingle from "@/assets/catalogue/fork-single.webp.asset.json";
import kDouble from "@/assets/catalogue/fork-double.webp.asset.json";
import rFlat from "@/assets/catalogue/bar-flat.webp.asset.json";
import rRiser from "@/assets/catalogue/bar-riser.webp.asset.json";
import rSwept from "@/assets/catalogue/bar-swept.webp.asset.json";

export const SIZE_PHOTO: Record<Size, string> = {
  "12": b12.url, "14": b14.url, "16": b16.url, "18": b18.url, "20": b20.url,
  "22": b22.url, "24": b24.url, "26": b26.url, "27.5": b275.url,
};
export const FRAME_PHOTO: Partial<Record<FrameId, string>> = { hardtail: fHard.url, dirtjump: fDirt.url, hybrid: fHyb.url };
export const FORK_PHOTO: Partial<Record<ForkId, string>> = { single: kSingle.url, double: kDouble.url };
export const BAR_PHOTO: Record<BarId, string> = { flat: rFlat.url, riser: rRiser.url, swept: rSwept.url };
