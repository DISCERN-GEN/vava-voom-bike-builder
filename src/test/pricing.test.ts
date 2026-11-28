import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG as D, type BikeConfig, decodeConfig, encodeConfig, priceLines, totalCents, vatOf, stepApplies, summaryRows, clampConfig, specLines, buildAiPrompt } from "@/lib/catalog";
import { cartTotals, type CartItem } from "@/lib/cart";
import { accentCoverage, classifyStatus } from "@/lib/ai-mockup";

const c = (p: Partial<BikeConfig>): BikeConfig => ({ ...D, ...p });

describe("base prices", () => {
  const table: [BikeConfig["size"], number][] = [["12", 38000], ["14", 52000], ["16", 72000], ["18", 92000], ["20", 129000], ["22", 149000], ["24", 169000], ["26", 189000], ["27.5", 325000]];
  it.each(table)("%s\" costs %i cents", (size, cents) => expect(totalCents(c({ size }))).toBe(cents));
});

describe("forks", () => {
  it("single-crown +R350", () => expect(totalCents(c({ size: "18", fork: "single" }))).toBe(127000));
  it("single-crown R175 on kids", () => expect(totalCents(c({ size: "14", fork: "single" }))).toBe(69500));
  it("dual-crown +R450", () => expect(totalCents(c({ size: "18", fork: "double" }))).toBe(92000 + 45000));
  it("dual-crown R225 on kids", () => expect(totalCents(c({ size: "14", fork: "double" }))).toBe(52000 + 22500));
  it("flagship dual-crown free", () => expect(totalCents(c({ size: "27.5", fork: "double" }))).toBe(325000));
});

describe("disc brakes", () => {
  it("+R300 on 18\"", () => expect(totalCents(c({ size: "18", discs: true }))).toBe(92000 + 30000));
  it("+R300 on 26\"", () => expect(totalCents(c({ size: "26", discs: true }))).toBe(189000 + 30000));
  it("R150 on kids", () => expect(totalCents(c({ size: "16", discs: true }))).toBe(72000 + 15000));
  it.each(["27.5"] as const)("included on %s\"", (size) => {
    expect(totalCents(c({ size, discs: true }))).toBe(totalCents(c({ size })));
    expect(decodeConfig(`size:${size}~discs:0`).discs).toBe(true);
  });
});

describe("gears", () => {
  it("28-speed +R350 on 26\" derailleur", () => expect(totalCents(c({ size: "26", drive28: true }))).toBe(189000 + 35000));
  it("28-speed dropped with hub gear", () => expect(totalCents(c({ size: "26", gears: "hub", drive28: true }))).toBe(189000));
  it("28-speed dropped on 24\"", () => expect(totalCents(c({ size: "24", drive28: true }))).toBe(169000));
  it("gears step hidden for kids", () => expect(stepApplies("drive", c({ size: "12" }))).toBe(false));
});

describe("decal and summary", () => {
  it("decal +R50 on any bike", () => {
    expect(totalCents(c({ size: "12", decal: "ZOE" }))).toBe(38000 + 5000);
    expect(totalCents(c({ size: "27.5", decal: "BOSS" }))).toBe(325000 + 5000);
  });
  it("flagship lists upgrades as included", () => expect(priceLines(c({ size: "27.5" })).some((l) => l.label.includes("included"))).toBe(true));
  it("summary lists every group", () => expect(summaryRows(D).map(([k]) => k)).toEqual(["Size", "Frame", "Fork", "Handlebar", "Gears", "Brakes", "Tyres", "Base colour", "Accent colour", "Decal", "Name"]));
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
    const x = c({ size: "26", frame: "dirtjump", gears: "derailleur", drive28: true, accent: "#22D3EE", decal: "MAX" });
    expect(decodeConfig(encodeConfig(x))).toEqual(x);
  });
  it("clamps illegal pasted combinations", () => {
    const out = decodeConfig("size:18~frame:yframe~fork:invalid~drive28:1~accent:red~decal:%3Cscript%3EHELLOWORLDLONGNAME");
    expect(out.frame).toBe("hardtail");
    expect(out.fork).toBe("standard");
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


describe("final parts upgrade rules", () => {
  it.each([["20", 159000], ["22", 179000], ["24", 199000]] as const)("disc brakes are +R300 on %s inch", (size, cents) => {
    expect(totalCents(c({ size, discs: true }))).toBe(cents);
    expect(decodeConfig(`size:${size}~discs:0`).discs).toBe(false);
  });
  it.each([["18", 117000], ["20", 154000], ["22", 174000], ["24", 194000], ["26", 214000]] as const)("tyres cost R250 on %s inch", (size, cents) => expect(totalCents(c({ size, tyres: true }))).toBe(cents));
  it.each([["12", 50500], ["14", 64500], ["16", 84500]] as const)("tyres cost R125 on %s inch", (size, cents) => expect(totalCents(c({ size, tyres: true }))).toBe(cents));
  it.each([["18", 167000], ["20", 204000], ["22", 224000], ["24", 244000], ["26", 264000], ["12", 75500], ["14", 89500], ["16", 109500]] as const)("full package price on %s inch", (size, cents) => {
    expect(totalCents(c({ size, fork: "double", discs: true, tyres: true }))).toBe(cents);
  });
  it("single-crown is not the package", () => expect(totalCents(c({ size: "20", fork: "single", discs: true, tyres: true }))).toBe(219000));
  it("26-inch 28-speed remains R350 outside the package", () => expect(totalCents(c({ size: "26", fork: "double", discs: true, tyres: true, drive28: true }))).toBe(299000));
  it("Flagship includes dual-crown, discs and tyres and skips their steps", () => {
    expect(clampConfig(c({ size: "27.5", fork: "standard", discs: false, tyres: false }))).toMatchObject({ fork: "double", discs: true, tyres: true });
    expect(stepApplies("fork", c({ size: "27.5" }))).toBe(false);
    expect(stepApplies("brakes", c({ size: "27.5" }))).toBe(false);
  });
  it("old saved builds default missing tyres to false", () => {
    expect(decodeConfig("size:20").tyres).toBe(false);
    const old = { ...D };
    Reflect.deleteProperty(old, "tyres");
    expect(clampConfig(old).tyres).toBe(false);
  });
  it("package selections round-trip into the order and AI specification", () => {
    const build = c({ size: "26", fork: "double", discs: true, tyres: true });
    expect(decodeConfig(encodeConfig(build))).toEqual(build);
    expect(specLines(build)).toContain("Tyres: Upgraded tyres");
    expect(buildAiPrompt(build)).toContain("Upgraded all-terrain tyres");
  });
});
