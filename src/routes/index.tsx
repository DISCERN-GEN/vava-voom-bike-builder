import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, Palette, Users } from "lucide-react";
import hero from "@/assets/hero.jpg.asset.json";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("VaVa Voom Cycles — Built Different. Ride Different.", "Custom bicycles from 12\" kids' bikes to the 27.5\" Flagship, built in Willowmore. Shop or design your own."),
  component: Home,
});

const PILLARS = [
  { icon: Wrench, title: "South African assembled", body: "Every bike is put together by hand in our Willowmore workshop." },
  { icon: Palette, title: "Custom paint mixing", body: "Any accent colour you can dream up, mixed to your exact shade." },
  { icon: Users, title: "Matching family builds", body: "From 12\" first bikes to adult trail rigs — ride out as a crew." },
];

function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <img src={hero.url} alt="Neon-lit custom VaVa Voom mountain bike in the garage" className="absolute inset-0 h-full w-full object-cover opacity-45" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-36">
          <p className="font-display-slant text-primary">Custom bikes · 12" to 27.5"</p>
          <h1 className="font-display-slant text-glow mt-3 max-w-3xl text-5xl leading-none md:text-7xl">Built Different. Ride Different.</h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">Pick your frame, fork, bars and paint. We build it in Willowmore — for kids, grown-ups and everyone in between.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/build" className="font-display-slant neon-glow rounded-md bg-primary px-6 py-3 text-lg text-primary-foreground">Build Your Bike</Link>
            <Link to="/collection" className="font-display-slant rounded-md border border-border bg-card px-6 py-3 text-lg">Shop the collection</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 md:grid-cols-3">
        {PILLARS.map((p) => (
          <div key={p.title} className="rounded-lg border border-border bg-card p-6">
            <p.icon className="h-7 w-7 text-primary" />
            <h2 className="font-display-slant mt-3 text-2xl">{p.title}</h2>
            <p className="mt-2 text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </section>

    </>
  );
}
