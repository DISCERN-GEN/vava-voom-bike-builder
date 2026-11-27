import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { BikePhoto } from "@/components/vv/BikePhoto";
import { Button } from "@/components/ui/button";
import { DEFAULT_CONFIG, SIZE_INFO, clampConfig, encodeConfig, formatZAR, totalCents, type Size } from "@/lib/catalog";
import { cart } from "@/lib/cart";
import { seo } from "@/lib/seo";
import { useState } from "react";

export const Route = createFileRoute("/collection")({
  head: () => seo("Shop the Collection — VaVa Voom Cycles", "Shop First riders (12–14 inch), Confident riders (16–24 inch), Young Adults (26 inch) and Flagship Pro riders (27.5 inch)."),
  component: Collection,
});

export const RIDER_COLLECTIONS: { id: string; name: string; range: string; sizes: Size[] }[] = [
  { id: "first", name: "First riders", range: '12" · 14"', sizes: ["12", "14"] },
  { id: "confident", name: "Confident riders", range: '16" – 24"', sizes: ["16", "18", "20", "22", "24"] },
  { id: "young-adults", name: "Young Adults", range: '26"', sizes: ["26"] },
  { id: "flagship", name: "Flagship Pro riders", range: '27.5"', sizes: ["27.5"] },
];

function Collection() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display-slant text-4xl md:text-5xl">Shop the Collection</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {RIDER_COLLECTIONS.map((collection) => <RiderCollection key={collection.id} collection={collection} />)}
      </div>
    </div>
  );
}

function RiderCollection({ collection }: { collection: (typeof RIDER_COLLECTIONS)[number] }) {
  const [size, setSize] = useState<Size>(collection.sizes[0] ?? DEFAULT_CONFIG.size);
  const config = clampConfig({ ...DEFAULT_CONFIG, size });
  const name = `${collection.name} — ${SIZE_INFO[size].label}`;
  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-4" data-testid="product-card" aria-label={collection.name}>
      <BikePhoto config={config} title={`${collection.name} — ${SIZE_INFO[size].label} catalogue bike`} eager />
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display-slant text-2xl">{collection.name}</h2>
        <p className="num text-lg font-semibold text-primary">{collection.range}</p>
      </div>
      <div className="mt-4 flex min-h-9 flex-wrap gap-2" role="group" aria-label={`${collection.name} wheel size`}>
        {collection.sizes.map((wheelSize) => (
          <Button key={wheelSize} size="sm" variant={size === wheelSize ? "default" : "outline"} aria-pressed={size === wheelSize} onClick={() => setSize(wheelSize)}>
            {wheelSize}"
          </Button>
        ))}
      </div>
      <p className="mt-3 min-h-10 text-sm text-muted-foreground">{SIZE_INFO[size].drivetrain} · {SIZE_INFO[size].highlights}</p>
      <p className="num mt-4 text-2xl font-bold text-primary">{formatZAR(totalCents(config))}</p>
      <p className="text-xs text-muted-foreground">incl. VAT</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button className="flex-1" onClick={() => { cart.add(name, config); toast.success(`${name} added to cart`); }}>Add to cart</Button>
        <Button asChild variant="outline" className="flex-1">
          <Link to="/build" search={{ step: "frame", config: encodeConfig(config) }}>Customise this build</Link>
        </Button>
      </div>
    </article>
  );
}
