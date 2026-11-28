import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Copy, MessageCircle, ShoppingCart } from "lucide-react";
import {
  BARS, DECAL_CENTS, DECAL_MAX, DRIVE28_CENTS, FORKS, FRAMES, GEARS, SIZES, SIZE_INFO, STEP_TITLES, UPGRADE_CENTS,
  type BikeConfig, type StepId, activeSteps, clampConfig, clampStep, decodeConfig, PACKAGE_CENTS, encodeConfig, formatZAR,
  isFlagship, isKids, priceLines, sanitizeDecal, summaryRows, totalCents, vatOf, type BarId, type ForkId, type FrameId, type GearId,
} from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { BikePhoto } from "@/components/vv/BikePhoto";
import { BAR_PHOTO, FORK_PHOTO, FRAME_PHOTO, SIZE_PHOTO } from "@/lib/photos";
import { AiStudio } from "@/components/vv/AiStudio";
import { cart, buildRef, orderSpec, whatsappUrl } from "@/lib/cart";
import { seo } from "@/lib/seo";

type Search = { step?: string; config?: string };

export const Route = createFileRoute("/build")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ...(typeof s["step"] === "string" ? { step: s["step"] } : {}),
    ...(typeof s["config"] === "string" ? { config: s["config"] } : {}),
  }),
  head: () => seo("Build Studio — Design Your Custom Bike | VaVa Voom", "Pick size, frame, fork, handlebar, gears, brakes, colour and your own name decal. Live price incl. VAT."),
  component: Build,
});

const SWATCHES = ["#A3E635", "#22D3EE", "#F43F5E", "#FFB020", "#8B5CF6", "#F97316", "#3B82F6", "#EC4899"];

function Opt({ selected, onClick, title, desc, price, children, testId }: { selected: boolean; onClick: () => void; title: string; desc?: string; price?: string; children?: React.ReactNode; testId?: string }) {
  return (
    <Button variant="outline" type="button" role="radio" aria-checked={selected} onClick={onClick} data-testid={testId} className={`relative flex flex-col rounded-lg border h-auto items-stretch whitespace-normal bg-card p-3 text-left transition ${selected ? "border-primary neon-glow" : "border-border hover:border-muted-foreground"}`}>
      {selected && <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />}
      {children}
      <span className="font-display-slant text-lg leading-tight">{title}</span>
      {desc && <span className="mt-1 text-xs text-muted-foreground">{desc}</span>}
      {price && <span className="num mt-1 text-sm font-semibold text-primary">{price}</span>}
    </Button>
  );
}

function Build() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/build" });
  const cfg = decodeConfig(search.config);
  const step = clampStep(search.step ?? "size", cfg);
  const steps = activeSteps(cfg);
  const i = steps.indexOf(step);

  const go = (next: StepId, c: BikeConfig = cfg) => navigate({ search: { step: next, config: encodeConfig(clampConfig(c)) }, replace: false });
  const set = (patch: Partial<BikeConfig>) => navigate({ search: { step, config: encodeConfig(clampConfig({ ...cfg, ...patch })) }, replace: true });
  const kids = isKids(cfg.size);
  const up = (cents: number) => `+${formatZAR(kids ? cents / 2 : cents)}`;
  const total = totalCents(cfg);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/build?step=summary&config=${encodeURIComponent(encodeConfig(cfg))}` : "";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs" aria-label="Steps">
        {steps.map((s, k) => (
          <button key={s} onClick={() => go(s)} className={`shrink-0 rounded-full border px-3 py-1 ${s === step ? "border-primary bg-primary text-primary-foreground" : k < i ? "border-primary/50 text-primary" : "border-border text-muted-foreground"}`}>
            {k + 1}. {STEP_TITLES[s]}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-[1fr_1.1fr]">
        <div className="md:sticky md:top-20 md:self-start">
          <div className="rounded-lg border border-border bg-card p-4">
            <BikePhoto config={cfg} eager title={`VaVa Voom ${SIZE_INFO[cfg.size].label} catalogue bike`} />
            <p className="mt-2 text-xs text-muted-foreground">Catalogue photo for this wheel size. Your frame, parts and colours follow your choices.</p>
          </div>
          <div className="mt-3 rounded-lg border border-border bg-card p-4" data-testid="live-summary">
            <p className="font-display-slant text-lg">Build summary</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              {summaryRows(cfg).map(([k, v]) => (
                <div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd className="flex items-center gap-2 text-right justify-end">{k === "Accent colour" && <span className="inline-block h-3 w-3 rounded-full border border-border" style={{ backgroundColor: v }} />}{v}</dd></div>
              ))}
            </dl>
          </div>
        </div>

        <div>
          <h1 className="font-display-slant text-3xl md:text-4xl" data-testid="step-title">{STEP_TITLES[step]}</h1>

          {step === "size" && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup">
              {SIZES.map((s) => (
                <Opt key={s} testId={`size-${s}`} selected={cfg.size === s} onClick={() => set({ size: s })} title={SIZE_INFO[s].label} desc={SIZE_INFO[s].highlights} price={formatZAR(SIZE_INFO[s].baseCents)} />
              ))}
            </div>
          )}

          {step === "frame" && (
            <div className="mt-4 grid grid-cols-2 gap-3" role="radiogroup">
              {(Object.keys(FRAMES) as FrameId[]).filter((f) => f !== "yframe" || kids).map((f) => (
                <Opt key={f} selected={cfg.frame === f} onClick={() => set({ frame: f })} title={FRAMES[f].name} desc={FRAMES[f].desc} price="R0 extra">
                  {FRAME_PHOTO[f] ? <img src={FRAME_PHOTO[f]} alt={FRAMES[f].name} loading="lazy" className="mb-2 aspect-[16/10] w-full rounded-md object-contain bg-foreground/90" /> : null}
                </Opt>
              ))}
            </div>
          )}

          {step === "fork" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup">
              {(Object.keys(FORKS) as ForkId[]).filter((f) => !isFlagship(cfg.size) || f === "double").map((f) => (
                <Opt key={f} selected={cfg.fork === f} onClick={() => set({ fork: f })} title={FORKS[f].name} desc={FORKS[f].desc} price={isFlagship(cfg.size) || f === "standard" ? "Included" : up(UPGRADE_CENTS[f])}>
                  {FORK_PHOTO[f] ? <img src={FORK_PHOTO[f]} alt={FORKS[f].name} loading="lazy" className="mb-2 h-28 w-full rounded-md object-contain bg-foreground/90" /> : null}
                </Opt>
              ))}
            </div>
          )}

          {step === "bars" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3" role="radiogroup">
              {(Object.keys(BARS) as BarId[]).map((b) => (
                <Opt key={b} selected={cfg.bars === b} onClick={() => set({ bars: b })} title={BARS[b].name} desc={BARS[b].desc} price="R0 extra">
                  <img src={BAR_PHOTO[b]} alt={BARS[b].name} loading="lazy" className="mb-2 h-16 w-full rounded-md object-contain bg-foreground/90" />
                </Opt>
              ))}
            </div>
          )}

          {step === "drive" && (
            <div className="mt-4 grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
                {(Object.keys(GEARS) as GearId[]).map((g) => (
                  <Opt key={g} testId={`gears-${g}`} selected={cfg.gears === g} onClick={() => set({ gears: g })} title={GEARS[g].name} desc={GEARS[g].desc} price="Included" />
                ))}
              </div>
              {cfg.size === "26" && cfg.gears === "derailleur" && (
                <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
                  <Opt selected={!cfg.drive28} onClick={() => set({ drive28: false })} title="21-speed (3x7)" desc="Included with every 26-inch build." price="Included" />
                  <Opt testId="drive28" selected={cfg.drive28} onClick={() => set({ drive28: true })} title="28-speed (3x8)" desc="More range for long climbs. 26-inch only." price={`+${formatZAR(DRIVE28_CENTS)}`} />
                </div>
              )}
              {cfg.size !== "26" && <p className="text-xs text-muted-foreground">Speeds for this size: {SIZE_INFO[cfg.size].drivetrain}.</p>}
            </div>
          )}

          {step === "brakes" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup">
              {isFlagship(cfg.size) ? (
                <>
                  <Opt selected onClick={() => {}} title="Disc brakes" desc={`Standard on the ${SIZE_INFO[cfg.size].label}.`} price="Included" />
                  <Opt selected onClick={() => {}} title="Upgraded tyres" desc={`Standard on the ${SIZE_INFO[cfg.size].label}.`} price="Included" />
                </>
              ) : (
                <>
                  <Opt testId="package" selected={cfg.fork === "double" && cfg.discs && cfg.tyres} onClick={() => set({ fork: "double", discs: true, tyres: true })} title="Full package" desc={`Dual-crown fork + disc brakes + upgraded tyres. Saves ${formatZAR(kids ? 12500 : 25000)}.`} price={up(PACKAGE_CENTS)} />
                  <Opt selected={!cfg.discs} onClick={() => set({ discs: false })} title="Standard rim brakes" price="Included" />
                  <Opt testId="discs" selected={cfg.discs} onClick={() => set({ discs: true })} title="Disc brakes" desc="Stronger stopping in any weather." price={up(UPGRADE_CENTS.discs)} />
                  <Opt selected={!cfg.tyres} onClick={() => set({ tyres: false })} title="Medium-fat tyres" price="Included" />
                  <Opt testId="tyres" selected={cfg.tyres} onClick={() => set({ tyres: true })} title="Tyre upgrade" desc="Tougher all-terrain tread." price={up(UPGRADE_CENTS.tyres)} />
                </>
              )}
            </div>
          )}

          {step === "paint" && (
            <div className="mt-4 grid gap-5">
              <div>
                <p className="text-sm text-muted-foreground">Base colour</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <Opt selected={cfg.base === "black"} onClick={() => set({ base: "black" })} title="Charcoal Black" />
                  <Opt selected={cfg.base === "white"} onClick={() => set({ base: "white" })} title="White" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accent colour — mixed to your exact shade</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <input aria-label="Accent colour wheel" type="color" value={cfg.accent} onChange={(e) => set({ accent: e.target.value })} className="h-12 w-16 cursor-pointer rounded border border-border bg-transparent" />
                  <input aria-label="Accent hex" defaultValue={cfg.accent} key={cfg.accent} onBlur={(e) => set({ accent: e.target.value })} onKeyDown={(e) => e.key === "Enter" && set({ accent: (e.target as HTMLInputElement).value })} className="num w-28 rounded-md border border-input bg-background px-3 py-2 uppercase" />
                  {SWATCHES.map((h) => (
                    <button key={h} aria-label={`Accent ${h}`} onClick={() => set({ accent: h })} className={`h-8 w-8 rounded-full border-2 ${cfg.accent === h ? "border-foreground" : "border-transparent"}`} style={{ backgroundColor: h }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "decal" && (
            <div className="mt-4 grid gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Decal scheme</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <Opt selected={cfg.decalScheme === "wob"} onClick={() => set({ decalScheme: "wob" })} title="White on Black" />
                  <Opt selected={cfg.decalScheme === "bow"} onClick={() => set({ decalScheme: "bow" })} title="Black on White" />
                </div>
              </div>
              <p className="text-muted-foreground">Add a name, word or nickname to the down tube for {formatZAR(DECAL_CENTS)}. Leave empty for no decal.</p>
              <input data-testid="decal-input" aria-label="Decal text" maxLength={DECAL_MAX} defaultValue={cfg.decal} onChange={(e) => set({ decal: sanitizeDecal(e.target.value) })} placeholder="e.g. THANDO" className="rounded-md border border-input bg-background px-3 py-3 text-lg uppercase" />
              <p className="text-xs text-muted-foreground">Up to {DECAL_MAX} letters, numbers, spaces and . ' ! -</p>
              <div className={`grid h-24 place-items-center rounded-md border border-border ${cfg.decalScheme === "wob" ? "bg-extrusion text-foreground" : "bg-foreground text-extrusion"}`}>
                <span className="font-display-slant text-4xl">{cfg.decal || "YOUR NAME"}</span>
              </div>
            </div>
          )}

          {step === "summary" && (
            <div className="mt-4 grid gap-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <ul className="space-y-1 text-sm text-muted-foreground">{summaryRows(cfg).map(([k, v]) => <li key={k}>{k}: {v}</li>)}{kids && <li>Training wheels: Included</li>}</ul>
                <div className="mt-4 border-t border-border pt-3">
                  {priceLines(cfg).map((l) => (
                    <div key={l.label} className="flex justify-between text-sm"><span>{l.label}</span><span className="num">{formatZAR(l.cents)}</span></div>
                  ))}
                  <div className="mt-2 flex justify-between border-t border-border pt-2 text-lg font-bold"><span>Total incl. VAT</span><span className="num text-primary" data-testid="summary-total">{formatZAR(total)}</span></div>
                  <div className="flex justify-between text-xs text-muted-foreground"><span>VAT (15%) included</span><span className="num">{formatZAR(vatOf(total))}</span></div>
                  <div className="flex justify-between text-xs text-muted-foreground"><span>Build reference</span><span className="num">{buildRef(cfg)}</span></div>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <button data-testid="add-to-cart" onClick={() => { cart.add(`Custom ${SIZE_INFO[cfg.size].label} ${FRAMES[cfg.frame].name}`, cfg); toast.success("Build added to cart"); }} className="font-display-slant inline-flex items-center justify-center gap-2 rounded-md bg-primary py-3 text-primary-foreground">
                  <ShoppingCart className="h-4 w-4" /> Add to cart
                </button>
                <a href={whatsappUrl(orderSpec([{ ref: buildRef(cfg), name: "Custom build", config: cfg, qty: 1, addedAt: "" }]))} target="_blank" rel="noreferrer" className="font-display-slant inline-flex items-center justify-center gap-2 rounded-md border border-border py-3">
                  <MessageCircle className="h-4 w-4" /> Request build
                </a>
                <button onClick={() => { void navigator.clipboard?.writeText(shareUrl); toast.success("Share link copied"); }} className="font-display-slant inline-flex items-center justify-center gap-2 rounded-md border border-border py-3">
                  <Copy className="h-4 w-4" /> Copy share link
                </button>
              </div>
              <AiStudio config={cfg} referenceUrl={SIZE_PHOTO[cfg.size]} />
            </div>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{SIZE_INFO[cfg.size].label} · {FRAMES[cfg.frame].name} · {FORKS[cfg.fork].name}{isFlagship(cfg.size) ? " · all upgrades" : ""}</p>
            <p className="num text-xl font-bold text-primary" data-testid="live-price">{formatZAR(total)}</p>
          </div>
          <button disabled={i <= 0} onClick={() => { const previous = steps[i - 1]; if (previous) void go(previous); }} className="font-display-slant rounded-md border border-border px-4 py-2.5 disabled:opacity-40">Back</button>
          {i < steps.length - 1 && (
            <button data-testid="next" onClick={() => { const next = steps[i + 1]; if (next) void go(next); }} className="font-display-slant rounded-md bg-primary px-5 py-2.5 text-primary-foreground">Next</button>
          )}
        </div>
      </div>
    </div>
  );
}
