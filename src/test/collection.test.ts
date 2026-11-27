import { describe, expect, it } from "vitest";
import { RIDER_COLLECTIONS } from "@/routes/collection";

describe("Collection wheel-size groups", () => {
  it("offers 12 and 14 inch bikes for First riders", () => {
    expect(RIDER_COLLECTIONS.find((group) => group.name === "First riders")?.sizes).toEqual(["12", "14"]);
  });
  it("offers 16 through 24 inch bikes for Confident riders", () => {
    expect(RIDER_COLLECTIONS.find((group) => group.name === "Confident riders")?.sizes).toEqual(["16", "18", "20", "22", "24"]);
  });
  it("offers 26 inch bikes for Young Adults", () => {
    expect(RIDER_COLLECTIONS.find((group) => group.name === "Young Adults")?.sizes).toEqual(["26"]);
  });
  it("offers 27.5 inch bikes for Flagship Pro riders", () => {
    expect(RIDER_COLLECTIONS.find((group) => group.name === "Flagship Pro riders")?.sizes).toEqual(["27.5"]);
  });
});