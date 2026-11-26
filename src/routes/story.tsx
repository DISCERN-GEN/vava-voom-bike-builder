import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/story")({
  head: () => seo("Our Story — VaVa Voom Cycles", "Why we build every bike to your taste, by hand, in Willowmore."),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display-slant text-glow text-5xl">A bike built to your taste</h1>
      <div className="mt-6 space-y-4 text-lg text-muted-foreground">
        <p>VaVa Voom started in a small garage on Victoria Street, Willowmore, with one idea: your bike should look and ride the way you want — not the way a factory decided.</p>
        <p>You pick the wheel size, frame, fork, bars, brakes and paint. We mix your accent colour by hand, cut your name decal, and assemble every bike right here in South Africa.</p>
        <p>From a 12-inch first bike to the 27.5-inch Flagship, we love building matching family sets so everyone rides out together.</p>
        <p className="font-display-slant text-2xl text-foreground">Built Different. Ride Different.</p>
      </div>
      <Link to="/build" className="font-display-slant mt-8 inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground">Start your build</Link>
    </div>
  ),
});
