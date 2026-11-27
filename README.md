# VaVa Voom Bike Builder

Build the full e-commerce online store and custom bicycle builder web application for VaVa Voom Cycles, a custom bicycle builder in Willowmore, Western Cape, South Africa (123 Victoria Street, Willowmore, 6445).

1. BRAND & POSITIONING
- Full e-commerce online store where the custom bike configurator (/build) is a signature, interactive buying experience alongside direct-to-cart shopping.
- Brand name: VaVa Voom Cycles.
- Dark neon garage-studio aesthetic:
  - Background: #0E1117
  - Panel: #151A23 (secondary #1B212C), border #2B3340
  - Accent: Electric lime #A3E635, text cream/studio white #F4F6F8, muted #8D96A5, extrusion black #000000, warning #FFB020
- Typography: Bold, slanted, uppercase display headings (Impact-style) paired with clean system sans body text and tabular numerals for currency.
- Header & Favicon: Display the slanted white 3D VaVa Voom Cycles logo (black extrusion, electric lime glow) in the header and as the favicon.
- Voice: "Built Different. Ride Different." — confident, plain, friendly, inclusive of kids and adults.
- Mobile-first e-commerce layout: persistent navigation with cart indicator/count, storefront browsing/filtering, and a sticky bottom bar on the configurator displaying live price, selected model, and Back / Next controls.

2. ARCHITECTURE & STATE
- Use TanStack Start v1 (React 19, Vite, Tailwind CSS v4).
- Store configurator state in URL search parameters (e.g., ?step=…&config=…) and validate with Zod on every load.
- Centralize all pricing, catalog items, and configuration constraints in a single shared Zod schema + rule matrix used by the storefront, pricing engine, cart/order spec generator, and AI prompt builder.
- Represent all prices in integer cents from a dated price table, inclusive of 15% VAT.

3. PRICING & RULE ENGINE
- Base models (standard fork, standard brakes, medium-fat tyres; frames and handlebars cost R0 extra):
  - 12": R380.00 (single-speed, training wheels available)
  - 14": R520.00 (single-speed, training wheels available)
  - 16": R720.00 (single-speed, training wheels available)
  - 18": R920.00 (21-speed 3x7)
  - 20": R1,290.00 (21-speed 3x7)
  - 22": R1,490.00 (21-speed 3x7)
  - 24": R1,690.00 (21-speed 3x7)
  - 26": R1,890.00 (21-speed 3x7)
  - 27.5" Flagship: R3,250.00 (12-speed 10:51, all upgrades included; no upgrade step shown)
- Upgrades (18"–26" / 50% off on 12"–16"):
  - Single-crown fork with shocks: R350 / R175
  - Double-crown fork with shocks: R450 / R225
  - Disc brakes: R300 / R150
  - Tyre upgrade: R250 / R125
  - Full package (double-crown + discs + tyres): R750 / R375 (saves R250 / R125 vs. separate)
  - 28-speed drivetrain: R350 (26" only, outside the package)
  - Personalised decal (name, word, or nickname): R50 (all bikes)
- Automatically skip inapplicable steps and clamp any shared/pasted configuration URLs to legal combinations. Include clear TODO/config placeholders for open items (decal length/character rules, training wheels price, 12"–16" package confirmation, mechanical vs. hydraulic disc brake spec, frame/silhouette art for Feminine Curved and Y-frame, and WhatsApp vs. EFT order flow).

4. E-COMMERCE STOREFRONT, ROUTES & PAGES
- / (Home): Storefront landing page with dark neon hero, "Build Your Bike" CTA + shop entry, pillars (South African assembled, custom paint mixing, matching family builds), featured builds, and cart access.
- /collection: E-commerce collection featuring the 26" Dirt Jumper, 28-Speed Trail Cruiser, and Matching Mini-Hardtail, supporting direct shopping actions and "Customise this build" deep-linking into /build with pre-selected options.
- /build (Build Studio): Signature 10-step buying wizard with silhouette cards and plain descriptions:
  1) Wheel size (12"–27.5")
  2) Frame style (Standard MTB Hardtail, Sloping Dirt-Jump, Cruiser-Sport Hybrid, Feminine Curved; plus Classic Kiddies Y-frame for 12"–16"; R0)
  3) Front fork (Standard, Single-crown, Double-crown; hidden on Flagship)
  4) Handlebars (Flat Trail, Riser Moto, Swept Cruiser; R0)
  5) Wheels & brakes (Medium-fat standard, Tyre upgrade, Disc brakes, Full Package shortcut)
  6) Drivetrain (Auto by size; +R350 28-speed option on 26")
  7) Mixed paint studio (Gloss Deep Black or Arctic White base, accent via colour wheel/hex input, White-on-Black or Black-on-White decal scheme)
  8) Personalised decal (+R50, live typographic preview)
  9) Extras (Training wheels for 12"–16")
  10) Summary & AI mockup (VAT-itemised breakdown, AI mockup preview, image download, shareable link, Add to Cart / Request Build)
- /cart: Full e-commerce cart supporting multiple builds, live VAT-itemised breakdown (device-only storage), build reference IDs, and "Send build to WhatsApp" (plus email/order spec option) exporting the full spec.
- /story: The VaVa Voom philosophy — a custom bike built to your taste.
- /contact: WhatsApp enquiry, build support FAQ, and workshop consultation request.
- Legal pages: POPIA privacy policy, store terms, and made-to-order cancellation wording.

5. IN-SITE AI STUDIO MOCKUP (CHATGPT / GEMINI WITH USER'S OWN TOKENS)
- After the client completes the build configurator, allow choosing ChatGPT or Gemini for bike mockup generation.
- Clicking the build/generate action opens a sign-in / token-connection flow directly inside the site (do NOT redirect the user to the external ChatGPT/Gemini app or website).
- Run requests using the signed-in user's own tokens/credentials rather than a site-wide pool, with clear UI states for connecting, disconnecting, switching providers, and handling auth/token/quota errors.
- Never store user tokens in URL params or analytics logs; scope token storage strictly to the user's session/device storage with clear privacy notice.
- Edit a reference render per frame/size family using the validated configuration state and exact hex colours.
- Overlay rider text and official branding client-side so text is never garbled by image generation.
- Validate accent colour against the chosen hex (with 1 retry and a recoloured reference fallback), cache results by configuration hash, and display: "AI-generated illustration. Final build follows your saved spec." (Order/build spec always uses the saved config).
- If EFT proof-of-payment admin features are included, use signed, expiring session tokens rather than static cookies.

6. TESTING & QUALITY GATE
- Include Vitest unit tests covering all 9 base prices, every upgrade, the package discount, the 50% kids' discount, the 26" 28-speed rule, decal pricing, cart VAT calculations, and URL clamping.
- Include Playwright mobile end-to-end tests for storefront browsing, configurator steps, in-site AI sign-in/mockup flow, and cart/WhatsApp flow.
- Ensure typecheck, unit tests, E2E tests, production build, provider/auth error handling, and mobile Lighthouse >= 80 all pass.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f62de39f-7723-4711-8784-6569a84f4e2a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
