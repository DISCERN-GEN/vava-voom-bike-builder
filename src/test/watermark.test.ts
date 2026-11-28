import { afterEach, describe, expect, it, vi } from "vitest";
import { watermarkedImageUrl } from "@/lib/watermark";

afterEach(() => vi.restoreAllMocks());

describe("watermarked download", () => {
  function imageMock(fail = false) {
    class LoadedImage {
      naturalWidth = 1024;
      naturalHeight = 1024;
      crossOrigin = "";
      onload?: () => void;
      onerror?: () => void;
      set src(_src: string) { queueMicrotask(() => fail ? this.onerror?.() : this.onload?.()); }
    }
    vi.stubGlobal("Image", LoadedImage);
  }
  afterEach(() => vi.unstubAllGlobals());

  it("stamps the loaded image before exporting a PNG", async () => {
    imageMock();
    const context = {
      drawImage: vi.fn(), save: vi.fn(), restore: vi.fn(), translate: vi.fn(), rotate: vi.fn(),
      strokeText: vi.fn(), fillText: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => {
      expect(context.drawImage).toHaveBeenCalledOnce();
      expect(context.fillText).toHaveBeenCalled();
      callback(new Blob(["stamped"], { type: "image/png" }));
    });
    const createUrl = vi.fn(() => "blob:marked-download");
    vi.stubGlobal("URL", { createObjectURL: createUrl });
    await expect(watermarkedImageUrl("blob:preview")).resolves.toBe("blob:marked-download");
    expect(createUrl).toHaveBeenCalledWith(expect.any(Blob));
  });
  it("rejects failed image loading rather than returning an unmarked image", async () => {
    imageMock(true);
    await expect(watermarkedImageUrl("blob:broken")).rejects.toThrow("Image failed to load");
  });
  it("rejects export failure rather than returning the original image", async () => {
    imageMock();
    const context = { drawImage: vi.fn(), save: vi.fn(), restore: vi.fn(), translate: vi.fn(), rotate: vi.fn(), strokeText: vi.fn(), fillText: vi.fn() };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => callback(null));
    await expect(watermarkedImageUrl("blob:preview")).rejects.toThrow("Could not create the image");
  });
});
