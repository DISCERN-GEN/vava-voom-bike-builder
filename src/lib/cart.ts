import { useSyncExternalStore } from "react";
import { type BikeConfig, clampConfig, configHash, formatZAR, priceLines, specLines, totalCents, vatOf, BUSINESS } from "./catalog";

export type CartItem = { ref: string; name: string; config: BikeConfig; qty: number; addedAt: string };
const KEY = "vv.cart.v1";
const listeners = new Set<() => void>();
let cache: CartItem[] | null = null;
const EMPTY: CartItem[] = [];

function read(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]") as CartItem[];
    cache = Array.isArray(raw) ? raw.map((i) => ({ ...i, config: clampConfig(i.config), qty: Math.max(1, Math.min(10, i.qty | 0 || 1)) })) : [];
  } catch {
    cache = [];
  }
  return cache;
}
function write(items: CartItem[]) {
  cache = items;
  localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}
export function buildRef(c: BikeConfig) {
  return `VV-${configHash(c).slice(0, 6)}`;
}
export const cart = {
  add(name: string, config: BikeConfig) {
    const c = clampConfig(config);
    const ref = buildRef(c);
    const items = read();
    const existing = items.find((i) => i.ref === ref);
    if (existing) write(items.map((i) => (i.ref === ref ? { ...i, qty: Math.min(10, i.qty + 1) } : i)));
    else write([...items, { ref, name, config: c, qty: 1, addedAt: new Date().toISOString() }]);
    return ref;
  },
  setQty(ref: string, qty: number) {
    write(read().map((i) => (i.ref === ref ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i)));
  },
  remove(ref: string) {
    write(read().filter((i) => i.ref !== ref));
  },
  clear() {
    write([]);
  },
};
export function useCart(): CartItem[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => EMPTY,
  );
}

export function cartTotals(items: CartItem[]) {
  const total = items.reduce((s, i) => s + totalCents(i.config) * i.qty, 0);
  const vat = vatOf(total);
  return { total, vat, exVat: total - vat };
}

export function orderSpec(items: CartItem[]): string {
  const t = cartTotals(items);
  const parts = [`${BUSINESS.name} — build order request`, ""];
  for (const i of items) {
    parts.push(`[${i.ref}] ${i.name} x${i.qty}`);
    specLines(i.config).forEach((l) => parts.push(`  ${l}`));
    priceLines(i.config).forEach((l) => parts.push(`  + ${l.label}: ${formatZAR(l.cents)}`));
    parts.push(`  Each: ${formatZAR(totalCents(i.config))}`, "");
  }
  parts.push(`Total (incl. VAT): ${formatZAR(t.total)}`, `VAT 15% included: ${formatZAR(t.vat)}`, `Excl. VAT: ${formatZAR(t.exVat)}`);
  return parts.join("\n");
}
export const whatsappUrl = (text: string) => `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`;
export const emailUrl = (text: string) =>
  `mailto:${BUSINESS.email}?subject=${encodeURIComponent("Build order request")}&body=${encodeURIComponent(text)}`;
