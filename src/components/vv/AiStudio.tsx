import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { watermarkedImageUrl } from "@/lib/watermark";
import { Download, KeyRound, LogOut, Loader2, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.png.asset.json";
import { type BikeConfig, buildAiPrompt, configHash } from "@/lib/catalog";
import { AiError, PROVIDERS, type Provider, accentMatches, composeMockup, generateWithProvider, mockupCache, imageToPng, tokenStore } from "@/lib/ai-mockup";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Status = { kind: "idle" } | { kind: "working"; msg: string } | { kind: "done"; url: string; note?: string } | { kind: "error"; msg: string; auth: boolean };

export function AiStudio({ config, referenceUrl }: { config: BikeConfig; referenceUrl: string }) {
  const [provider, setProvider] = useState<Provider>("openai");
  const [, force] = useState(0);
  const connected = (p: Provider) => !!tokenStore.get(p);
  const [dialog, setDialog] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function fallback(note: string) {
    const blob = await imageToPng(referenceUrl);
    const url = await composeMockup(URL.createObjectURL(blob), logo.url, config.decal, config.decalScheme);
    setStatus({ kind: "done", url, note });
  }

  async function run() {
    const token = tokenStore.get(provider);
    if (!token) {
      setDialog(true);
      return;
    }
    const hash = configHash(config);
    const cached = mockupCache.get(hash, provider);
    if (cached) {
      setStatus({ kind: "done", url: cached, note: "Loaded from your saved mockups." });
      return;
    }
    try {
      setStatus({ kind: "working", msg: "Loading your catalogue photo…" });
      const ref = await imageToPng(referenceUrl);
      const prompt = buildAiPrompt(config);
      for (let attempt = 0; attempt < 2; attempt++) {
        setStatus({ kind: "working", msg: attempt ? "Colour was off — retrying once…" : `Generating with ${PROVIDERS[provider].name}…` });
        const raw = await generateWithProvider(provider, token, attempt ? `${prompt} The accent colour MUST be exactly ${config.accent}.` : prompt, ref);
        if (await accentMatches(raw, config.accent)) {
          const url = await composeMockup(raw, logo.url, config.decal, config.decalScheme);
          mockupCache.set(hash, provider, url);
          setStatus({ kind: "done", url });
          return;
        }
      }
      await fallback("The AI couldn't match your exact accent colour, so here's the catalogue photo for your size instead.");
    } catch (e) {
      const err = e instanceof AiError ? e : new AiError("provider", "Something went wrong.");
      setStatus({ kind: "error", msg: err.message, auth: err.kind === "auth" });
    }
  }

  function connect() {
    if (keyInput.trim().length < 10) return;
    tokenStore.set(provider, keyInput);
    setKeyInput("");
    setDialog(false);
    force((n) => n + 1);
    void run();
  }
  function disconnect() {
    tokenStore.clear(provider);
    setStatus({ kind: "idle" });
    force((n) => n + 1);
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4" data-testid="ai-studio">
      <h3 className="font-display-slant text-2xl">AI mockup studio</h3>
      <p className="mt-1 text-sm text-muted-foreground">Preview your build as a studio photo using your own ChatGPT or Gemini account.</p>
      <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="AI provider">
        {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
          <button key={p} role="radio" aria-checked={provider === p} onClick={() => { setProvider(p); setStatus({ kind: "idle" }); }} className={`rounded-md border px-3 py-2 text-sm ${provider === p ? "border-primary text-primary" : "border-border"}`}>
            {PROVIDERS[p].name}
            <span className="block text-xs text-muted-foreground">{connected(p) ? "Connected" : "Not connected"}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={run} disabled={status.kind === "working"} className="font-display-slant inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60">
          {status.kind === "working" ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          {connected(provider) ? "Generate mockup" : `Connect ${PROVIDERS[provider].name.split(" ")[0]} & generate`}
        </button>
        {connected(provider) && (
          <button onClick={disconnect} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <LogOut className="h-4 w-4" /> Disconnect
          </button>
        )}
      </div>
      {status.kind === "working" && <p className="mt-3 text-sm text-muted-foreground" role="status">{status.msg}</p>}
      {status.kind === "error" && (
        <div role="alert" className="mt-3 rounded-md border border-warning/50 bg-warning/10 p-3 text-sm text-warning">
          {status.msg}
          {status.auth && (
            <button className="ml-2 underline" onClick={() => { disconnect(); setDialog(true); }}>Reconnect</button>
          )}
        </div>
      )}
      {status.kind === "done" && (
        <figure className="mt-3">
          <img src={status.url} alt="AI-generated mockup of your build" className="w-full rounded-md border border-border" />
          <figcaption className="mt-2 text-xs text-muted-foreground">AI-generated illustration. Final build follows your saved spec.{status.note ? ` ${status.note}` : ""}</figcaption>
          <Button
            variant="outline"
            type="button"
            data-testid="download-image"
            onClick={async () => {
              try {
                const marked = await watermarkedImageUrl(status.url, logo.url);
                const a = document.createElement("a");
                a.href = marked;
                a.download = `vavavoom-${configHash(config)}.png`;
                a.click();
                setTimeout(() => URL.revokeObjectURL(marked), 10000);
              } catch {
                toast.error("Couldn't prepare the download. Please try generating the mockup again.");
              }
            }}
            className="mt-2 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
          >
            <Download className="h-4 w-4" /> Download image
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">Downloads carry a VaVa Voom watermark.</p>
        </figure>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display-slant text-2xl">Connect {PROVIDERS[provider].name}</DialogTitle>
            <DialogDescription>Paste your own API key. Image generation is billed to your account.</DialogDescription>
          </DialogHeader>
          <label className="text-sm" htmlFor="ai-key">API key</label>
          <input id="ai-key" type="password" autoComplete="off" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder={PROVIDERS[provider].keyHint} className="w-full rounded-md border border-input bg-background px-3 py-2" />
          <a href={PROVIDERS[provider].keyUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline">Where do I find my key?</a>
          <p className="flex gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            Your key stays in this browser tab only and is sent directly to {PROVIDERS[provider].name}. We never see, store or log it, and it's cleared when you close the tab or tap Disconnect.
          </p>
          <button onClick={connect} disabled={keyInput.trim().length < 10} className="font-display-slant rounded-md bg-primary py-2.5 text-primary-foreground disabled:opacity-50">Connect & generate</button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
