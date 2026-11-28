import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageCircle, Trash2 } from "lucide-react";
import { BikePhoto } from "@/components/vv/BikePhoto";
import { cart, cartTotals, emailUrl, orderSpec, useCart, whatsappUrl } from "@/lib/cart";
import { encodeConfig, formatZAR, priceLines, totalCents } from "@/lib/catalog";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () => seo("Your Cart — VaVa Voom Cycles", "Review your custom builds, VAT breakdown and send your order to our Willowmore workshop."),
  component: CartPage,
});

function CartPage() {
  const items = useCart();
  const t = cartTotals(items);
  if (!items.length)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display-slant text-4xl">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Start a build or grab one from the collection.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/build" className="font-display-slant rounded-md bg-primary px-5 py-2.5 text-primary-foreground">Build your bike</Link>
          <Link to="/catalogue" className="font-display-slant rounded-md border border-border px-5 py-2.5">Catalogue</Link>
        </div>
      </div>
    );
  const spec = orderSpec(items);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display-slant text-4xl">Your cart</h1>
      <p className="mt-1 text-xs text-muted-foreground">Saved on this device only.</p>
      <div className="mt-6 grid gap-4">
        {items.map((i) => (
          <article key={i.ref} className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[180px_1fr]" data-testid="cart-item">
            <BikePhoto config={i.config} className="w-full" title={i.name} />
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display-slant text-xl">{i.name}</h2>
                  <p className="num text-xs text-muted-foreground">Ref {i.ref}</p>
                </div>
                <button aria-label={`Remove ${i.name}`} onClick={() => cart.remove(i.ref)} className="rounded p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-2 space-y-0.5 text-sm">
                {priceLines(i.config).map((l) => <div key={l.label} className="flex justify-between"><span className="text-muted-foreground">{l.label}</span><span className="num">{formatZAR(l.cents)}</span></div>)}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button aria-label="Decrease quantity" onClick={() => cart.setQty(i.ref, i.qty - 1)} className="h-8 w-8 rounded border border-border">−</button>
                  <span className="num w-6 text-center">{i.qty}</span>
                  <button aria-label="Increase quantity" onClick={() => cart.setQty(i.ref, i.qty + 1)} className="h-8 w-8 rounded border border-border">+</button>
                </div>
                <Link to="/build" search={{ step: "summary", config: encodeConfig(i.config) }} className="text-sm text-primary">Edit build</Link>
                <span className="num font-bold">{formatZAR(totalCents(i.config) * i.qty)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        <div className="flex justify-between text-sm"><span>Subtotal excl. VAT</span><span className="num">{formatZAR(t.exVat)}</span></div>
        <div className="flex justify-between text-sm"><span>VAT (15%)</span><span className="num" data-testid="cart-vat">{formatZAR(t.vat)}</span></div>
        <div className="mt-2 flex justify-between border-t border-border pt-2 text-xl font-bold"><span>Total</span><span className="num text-primary" data-testid="cart-total">{formatZAR(t.total)}</span></div>
        <p className="mt-2 text-xs text-muted-foreground">Every bike is made to order. We confirm your spec and payment details on WhatsApp before building.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <a data-testid="whatsapp-order" href={whatsappUrl(spec)} target="_blank" rel="noreferrer" className="font-display-slant inline-flex items-center justify-center gap-2 rounded-md bg-primary py-3 text-primary-foreground"><MessageCircle className="h-4 w-4" /> Send build to WhatsApp</a>
          <a href={emailUrl(spec)} className="font-display-slant inline-flex items-center justify-center gap-2 rounded-md border border-border py-3"><Mail className="h-4 w-4" /> Email order spec</a>
        </div>
      </div>
    </div>
  );
}
