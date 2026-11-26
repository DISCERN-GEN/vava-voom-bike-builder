import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG as D, type BikeConfig, decodeConfig, encodeConfig, priceLines, totalCents, vatOf, stepApplies, clampStep } from "@/lib/catalog";
import { cartTotals, type CartItem } from "@/lib/cart";
import { accentCoverage, classifyStatus } from "@/lib/ai-mockup";

const c = (p: Partial<BikeConfig>): BikeConfig => ({ ...D, ...p });

describe("base prices", () => {
  const table: [BikeConfig["size"], number][] = [["12", 38000], ["14", 52000], ["16", 72000], ["18", 92000], ["20", 129000], ["22", 149000], ["24", 169000], ["26", 189000], ["27.5", 325000]];
  it.each(table)("%s\" costs %i cents", (size, cents) => expect(totalCents(c({ size }))).toBe(cents));
});

describe("upgrades on 18–26\"", () => {
  it("single-crown +R350", () => expect(totalCents(c({ size: "20", fork: "single" }))).toBe(129000 + 35000));
  it("double-crown +R450", () => expect(totalCents(c({ size: "20", fork: "double" }))).toBe(129000 + 45000));
  it("discs +R300", () => expect(totalCents(c({ size: "20", discs: true }))).toBe(129000 + 30000));
  it("tyres +R250", () => expect(totalCents(c({ size: "20", tyres: true }))).toBe(129000 + 25000));
  it("package R750 instead of R1,000", () => expect(totalCents(c({ size: "20", fork: "double", discs: true, tyres: true }))).toBe(129000 + 75000));
});

describe("kids 50% discount", () => {
  it("single-crown R175", () => expect(totalCents(c({ size: "12", fork: "single" }))).toBe(38000 + 17500));
  it("double-crown R225", () => expect(totalCents(c({ size: "14", fork: "double" }))).toBe(52000 + 22500));
  it("discs R150", () => expect(totalCents(c({ size: "16", discs: true }))).toBe(72000 + 15000));
  it("tyres R125", () => expect(totalCents(c({ size: "16", tyres: true }))).toBe(72000 + 12500));
  it("package R375", () => expect(totalCents(c({ size: "16", fork: "double", discs: true, tyres: true }))).toBe(72000 + 37500));
});

describe("28-speed rule", () => {
  it("adds R350 on 26\"", () => expect(totalCents(c({ size: "26", drive28: true }))).toBe(189000 + 35000));
  it("is dropped on 24\"", () => expect(totalCents(c({ size: "24", drive28: true }))).toBe(169000));
  it("stays outside the package", () => expect(totalCents(c({ size: "26", drive28: true, fork: "double", discs: true, tyres: true }))).toBe(189000 + 75000 + 35000));
});

describe("decal and flagship", () => {
  it("decal +R50 on any bike", () => {
    expect(totalCents(c({ size: "12", decal: "ZOE" }))).toBe(38000 + 5000);
    expect(totalCents(c({ size: "27.5", decal: "BOSS" }))).toBe(325000 + 5000);
  });
  it("flagship includes all upgrades at no charge", () => {
    expect(totalCents(c({ size: "27.5", fork: "single" }))).toBe(325000);
    expect(priceLines(c({ size: "27.5" })).some((l) => l.label.includes("included"))).toBe(true);
  });
  it("flagship skips fork and wheels steps", () => {
    expect(stepApplies("fork", c({ size: "27.5" }))).toBe(false);
    expect(clampStep("fork", c({ size: "27.5" }))).toBe("bars");
  });
});

describe("cart VAT", () => {
  it("extracts 15% inclusive VAT", () => expect(vatOf(115000)).toBe(15000));
  it("totals multiple builds with quantities", () => {
    const items: CartItem[] = [
      { ref: "a", name: "a", qty: 2, addedAt: "", config: c({ size: "12" }) },
      { ref: "b", name: "b", qty: 1, addedAt: "", config: c({ size: "26", drive28: true }) },
    ];
    const t = cartTotals(items);
    expect(t.total).toBe(76000 + 224000);
    expect(t.vat).toBe(Math.round((300000 * 15) / 115));
    expect(t.exVat + t.vat).toBe(t.total);
  });
});

describe("URL clamping", () => {
  it("round-trips a config", () => {
    const x = c({ size: "26", frame: "dirtjump", drive28: true, accent: "#22D3EE", decal: "MAX" });
    expect(decodeConfig(encodeConfig(x))).toEqual(x);
  });
  it("clamps illegal pasted combinations", () => {
    const out = decodeConfig("size:20~frame:yframe~training:1~drive28:1~accent:red~decal:%3Cscript%3EHELLOWORLDLONGNAME");
    expect(out.frame).toBe("hardtail");
    expect(out.training).toBe(false);
    expect(out.drive28).toBe(false);
    expect(out.accent).toBe("#A3E635");
    expect(out.decal).toBe("scriptHELLOW");
  });
  it("falls back on garbage", () => expect(decodeConfig("%%%~size:99")).toEqual(D));
});

describe("AI helpers", () => {
  it("maps provider errors", () => {
    expect(classifyStatus(401)).toBe("auth");
    expect(classifyStatus(429)).toBe("quota");
    expect(classifyStatus(500)).toBe("provider");
  });
  it("detects accent coverage", () => {
    const px = new Uint8ClampedArray([163, 230, 53, 255, 0, 0, 0, 255]);
    expect(accentCoverage(px, "#A3E635")).toBe(0.5);
  });
});
