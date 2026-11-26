import { createFileRoute } from "@tanstack/react-router";
import { PRICE_TABLE_EFFECTIVE } from "@/lib/catalog";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => seo("Store Terms & Cancellations — VaVa Voom Cycles", "Pricing, made-to-order and cancellation terms for VaVa Voom custom bikes."),
  component: () => (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-12 text-muted-foreground">
      <h1 className="font-display-slant text-4xl text-foreground">Store terms</h1>
      <p>All prices are in South African Rand and include 15% VAT, per our price table effective {PRICE_TABLE_EFFECTIVE}. Your order is confirmed only once we've agreed your spec and received payment.</p>
      <h2 className="font-display-slant text-2xl text-foreground">Made-to-order & cancellations</h2>
      <p>Every bike is built and painted to your personal specification. You may cancel for a full refund before we start building. Once paint mixing or decal cutting has started, the bike is personalised to you and, as allowed by section 44 of the Consumer Protection Act for goods made to the consumer's specification, cooling-off cancellation does not apply. Your statutory rights for defective goods are not affected.</p>
      <h2 className="font-display-slant text-2xl text-foreground">AI mockups</h2>
      <p>AI images are illustrations only. The final build always follows your saved spec.</p>
    </article>
  ),
});
