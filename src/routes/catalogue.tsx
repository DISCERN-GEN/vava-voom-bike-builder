import { createFileRoute, Link } from "@tanstack/react-router";
import { BikePhoto } from "@/components/vv/BikePhoto";
import { Button } from "@/components/ui/button";
import { DECAL_CENTS, DEFAULT_CONFIG, DRIVE28_CENTS, PACKAGE_CENTS, SIZE_INFO, UPGRADE_CENTS, clampConfig, encodeConfig, formatZAR, isFlagship, isKids, totalCents, type Size } from "@/lib/catalog";
import { seo } from "@/lib/seo";
import { useState } from "react";

export const Route = createFileRoute("/catalogue")({
  head: () => seo("Catalogue — VaVa Voom Cycles","Browse VaVa Voom bikes from 12-inch first riders to the 27.5-inch Flagship, with base prices and optional upgrades."),
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
      <h1 className="font-display-slant text-4xl md:text-5xl">Catalogue</h1>
      <p className="mt-2 text-sm text-muted-foreground">Base bikes have a standard fork, rim brakes and medium-fat tyres. Frames and handlebars are standard at no extra charge. All prices include 15% VAT.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {RIDER_COLLECTIONS.map((collection) => <RiderCollection key={collection.id} collection={collection} />)}
      </div>
    </div>
  );
}

function RiderCollection({ collection }: { collection: (typeof RIDER_COLLECTIONS)[number] }) {
  const [size, setSize] = useState<Size>(collection.sizes[0] ?? DEFAULT_CONFIG.size);
  const config = clampConfig({ ...DEFAULT_CONFIG, size });
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
      <Upgrades size={size} />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild className="flex-1">
          <Link to="/build" search={{ step: "frame", config: encodeConfig(config) }}>Customise this build</Link>
        </Button>
      </div>
    </article>
  );
}

function Upgrades({ size }: { size: Size }) {
  if (isFlagship(size)) {
    return <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground" data-testid="upgrades">All parts upgrades included: dual-crown fork, disc brakes and upgraded tyres. Personalised decal +{formatZAR(DECAL_CENTS)}.</p>;
  }
  const adj = (cents: number) => formatZAR(isKids(size) ? cents / 2 : cents);
  const rows: [string, string][] = [
    ["Single-crown fork with shocks", adj(UPGRADE_CENTS.single)],
    ["Dual-crown fork with shocks", adj(UPGRADE_CENTS.double)],
    ["Disc brakes", adj(UPGRADE_CENTS.discs)],
    ["Tyre upgrade", adj(UPGRADE_CENTS.tyres)],
    ["Full package (dual-crown + discs + tyres)", adj(PACKAGE_CENTS)],
    ...(size === "26" ? ([["28-speed drivetrain", formatZAR(DRIVE28_CENTS)]] as [string, string][]) : []),
    ["Personalised decal (name, word or nickname)", formatZAR(DECAL_CENTS)],
  ];
  return (
    <div className="mt-4 border-t border-border pt-3 text-sm" data-testid="upgrades">
      <p className="font-display-slant text-primary">Optional upgrades{isKids(size) ? " (parts 50% off)" : ""}</p>
      <dl className="mt-2 space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="num shrink-0 font-medium">+{v}</dd></div>
        ))}
      </dl>
    </div>
  );
}
