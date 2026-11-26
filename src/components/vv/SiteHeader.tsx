import { Link } from "@tanstack/react-router";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png.asset.json";
import { useCart } from "@/lib/cart";

const NAV = [
  { to: "/collection", label: "Shop" },
  { to: "/build", label: "Build" },
  { to: "/story", label: "Story" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const items = useCart();
  const count = items.reduce((s, i) => s + i.qty, 0);
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="shrink-0" aria-label="VaVa Voom Cycles home">
          <img src={logo.url} alt="VaVa Voom Cycles" width={140} height={52} className="h-11 w-auto drop-shadow-[0_0_10px_var(--primary)]" />
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="font-display-slant rounded px-3 py-2 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-primary" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link to="/cart" className="relative ml-auto rounded-md border border-border p-2 md:ml-2" aria-label={`Cart, ${count} items`} data-testid="cart-link">
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span data-testid="cart-count" className="num absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </Link>
        <button className="rounded-md border border-border p-2 md:hidden" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="grid border-t border-border px-4 py-2 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="font-display-slant py-3 text-lg">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-muted-foreground md:grid-cols-3">
        <div>
          <p className="font-display-slant text-xl text-foreground">Built Different. Ride Different.</p>
          <p className="mt-2">123 Victoria Street, Willowmore, 6445, Western Cape</p>
        </div>
        <div className="grid gap-1">
          <Link to="/collection">Shop</Link>
          <Link to="/build">Build Studio</Link>
          <Link to="/contact">Contact & FAQ</Link>
        </div>
        <div className="grid gap-1">
          <Link to="/privacy">Privacy (POPIA)</Link>
          <Link to="/terms">Store terms & cancellations</Link>
          <p className="mt-2">Prices in ZAR, incl. 15% VAT.</p>
        </div>
      </div>
    </footer>
  );
}
