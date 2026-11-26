import type { BikeConfig } from "@/lib/catalog";
import { SIZE_INFO } from "@/lib/catalog";
import { SIZE_PHOTO } from "@/lib/photos";

export function BikePhoto({ config, className = "", title, eager }: { config: BikeConfig; className?: string; title?: string; eager?: boolean }) {
  return (
    <img
      src={SIZE_PHOTO[config.size]}
      alt={title ?? `VaVa Voom ${SIZE_INFO[config.size].label} bike`}
      width={1280}
      height={853}
      loading={eager ? "eager" : "lazy"}
      className={`aspect-[3/2] w-full rounded-md object-cover ${className}`}
    />
  );
}
