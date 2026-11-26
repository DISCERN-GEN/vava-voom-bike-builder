import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { COLLECTION } from "@/lib/collection";
import { BikePhoto } from "@/components/vv/BikePhoto";
import { encodeConfig, formatZAR, specLines, totalCents } from "@/lib/catalog";
import { cart } from "@/lib/cart";
import { seo } from "@/lib/seo";
import { useState } from "react";

export const Route = createFileRoute("/collection")({
  head: () => seo("Shop the Collection — VaVa Voom Cycles", "Ready-spec custom bikes: 26\" Dirt Jumper, 28-Speed Trail Cruiser and the Matching Mini-Hardtail."),
  component: Collection,
});

const FILTERS = [
  { id: "all", label: "All" },
  { id: "adult", label: "Adults" },
  { id: "kids", label: "Kids" },
] as const;

function Collection() {
  const [f, setF] = useState<(typeof FILTERS)[number]["id"]>("all");
  const list = COLLECTION.filter((b) => f === "all" || (f === "kids") === ["12", "14", "16"].includes(b.config.size));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display-slant text-4xl md:text-5xl">The Collection</h1>
      <p className="mt-2 text-muted-foreground">Add straight to cart, or open any build in the studio and make it yours.</p>
      <div className="mt-6 flex gap-2" role="tablist">
        {FILTERS.map((x) => (
          <button key={x.id} role="tab" aria-selected={f === x.id} onClick={() => setF(x.id)} className={`rounded-full border px-4 py-1.5 text-sm ${f === x.id ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
            {x.label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {list.map((b) => (
          <article key={b.slug} className="flex flex-col rounded-lg border border-border bg-card p-4" data-testid="product-card">
            <BikePhoto config={b.config} className="w-full" title={b.name} />
            <h2 className="font-display-slant mt-3 text-2xl">{b.name}</h2>
            <p className="text-sm text-muted-foreground">{b.tagline}</p>
            <ul className="mt-3 space-y-0.5 text-xs text-muted-foreground">
              {specLines(b.config).slice(0, 7).map((l) => <li key={l}>{l}</li>)}
            </ul>
            <p className="num mt-4 text-2xl font-bold text-primary">{formatZAR(totalCents(b.config))}</p>
            <p className="text-xs text-muted-foreground">incl. VAT</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="font-display-slant rounded-md bg-primary py-2.5 text-primary-foreground" onClick={() => { cart.add(b.name, b.config); toast.success(`${b.name} added to cart`); }}>
                Add to cart
              </button>
              <Link to="/build" search={{ step: "frame", config: encodeConfig(b.config) }} className="font-display-slant rounded-md border border-border py-2.5 text-center">
                Customise this build
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
