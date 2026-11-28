<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- All catalog, prices and build rules live in `src/lib/catalog.ts` (Zod schema + clamp); storefront, cart, spec and AI prompt must import from it — one source of truth.
- Configurator state lives only in `/build` search params (`step`, `config`), decoded via `decodeConfig` which clamps to legal combos — shareable links must never produce illegal builds.
- Cart is device-only localStorage (`src/lib/cart.ts`) — no backend yet; orders go out via WhatsApp/email.
- AI mockups call OpenAI/Gemini from the browser with the shopper's own key in sessionStorage only — keys must never hit URLs, our server, or logs.
- Unit tests in `src/test`, mobile Playwright E2E in `e2e/` (`bun run test:e2e`).

- Bike imagery uses the owner's catalogue photos (one per wheel size) via `src/lib/photos.ts`; the size photo is also the AI mockup reference — no drawn SVG bikes.

- `/catalogue` owns rider collections; `/collection` redirects to it so existing links remain usable.
- Mockup downloads must pass through `src/lib/watermark.ts` and reject stamping failures; on-screen images remain unchanged.
- Package pricing is derived from fork/discs/tyres in the shared catalog, never stored as a separate flag, so every cart/spec/link agrees.
