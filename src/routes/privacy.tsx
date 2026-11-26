import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => seo("Privacy Policy (POPIA) — VaVa Voom Cycles", "How VaVa Voom Cycles handles your personal information under POPIA."),
  component: () => (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-12 text-muted-foreground">
      <h1 className="font-display-slant text-4xl text-foreground">Privacy policy (POPIA)</h1>
      <p>VaVa Voom Cycles, 123 Victoria Street, Willowmore, 6445, is the responsible party for personal information you share with us, in line with the Protection of Personal Information Act 4 of 2013.</p>
      <h2 className="font-display-slant text-2xl text-foreground">What stays on your device</h2>
      <p>Your cart and saved builds are stored only in your browser. We don't receive them until you choose to send your order via WhatsApp or email.</p>
      <p>If you connect ChatGPT or Gemini for mockups, your API key is kept only in this browser tab's session storage and sent directly to that provider. We never receive, store or log it. Closing the tab or tapping Disconnect removes it. The provider's own privacy terms apply to those requests.</p>
      <h2 className="font-display-slant text-2xl text-foreground">What we collect</h2>
      <p>When you contact us we receive your name, phone number or email and your build details, used only to quote, build and deliver your bike. We keep order records as required by tax law and don't sell your information.</p>
      <h2 className="font-display-slant text-2xl text-foreground">Cookies and site statistics</h2>
      <p>Our hosting provider sets one strictly necessary cookie. It makes sure every page you load comes from the same version of the site. It holds no information about you and expires within 7 days.</p>
      <h2 className="font-display-slant text-2xl text-foreground">Your rights</h2>
      <p>You may ask to see, correct or delete your information, and you may complain to the Information Regulator (inforegulator.org.za). Contact us via WhatsApp or the contact page.</p>
    </article>
  ),
});
