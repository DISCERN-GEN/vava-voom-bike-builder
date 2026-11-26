import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { MessageCircle, MapPin } from "lucide-react";
import { BUSINESS } from "@/lib/catalog";
import { whatsappUrl } from "@/lib/cart";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => seo("Contact & Build Support — VaVa Voom Cycles", "WhatsApp us, read the build FAQ, or book a workshop consultation in Willowmore."),
  component: Contact,
});

const FAQ = [
  ["How long does a build take?", "Most builds are ready in 2–4 weeks once your spec and payment are confirmed."],
  ["Which size is right for my child?", "Roughly: 12\" for ages 2–4, 14\" for 3–5, 16\" for 4–7, 18–20\" for 6–10. Pop in and we'll fit them."],
  ["Can I change my build after ordering?", "Yes, until we start painting. After that the frame is made for you."],
  ["Do you deliver?", "We can arrange courier delivery across South Africa, or you can collect in Willowmore."],
];

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(80),
  when: z.string().trim().max(80),
  message: z.string().trim().min(1, "Tell us a little about your build").max(600),
});

function Contact() {
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="font-display-slant text-5xl">Let's talk bikes</h1>
        <p className="mt-3 flex gap-2 text-muted-foreground"><MapPin className="h-5 w-5 shrink-0 text-primary" />{BUSINESS.address}</p>
        <a href={whatsappUrl("Hi VaVa Voom! I have a question about a build.")} target="_blank" rel="noreferrer" className="font-display-slant mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-primary-foreground"><MessageCircle className="h-5 w-5" /> WhatsApp us</a>
        <h2 className="font-display-slant mt-10 text-3xl">Build support FAQ</h2>
        <Accordion type="single" collapsible className="mt-2">
          {FAQ.map(([q, a]) => (
            <AccordionItem key={q} value={q!}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>
          ))}
        </Accordion>
      </div>
      <form
        className="h-fit rounded-lg border border-border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const r = schema.safeParse(Object.fromEntries(fd));
          if (!r.success) return setErr(r.error.issues[0]?.message ?? "Check the form");
          setErr(null);
          window.open(whatsappUrl(`Workshop consultation request\nName: ${r.data.name}\nPreferred time: ${r.data.when || "Any"}\n${r.data.message}`), "_blank");
        }}
      >
        <h2 className="font-display-slant text-2xl">Book a workshop consultation</h2>
        <label className="mt-4 block text-sm">Name<input name="name" maxLength={80} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" /></label>
        <label className="mt-3 block text-sm">Preferred day/time<input name="when" maxLength={80} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" /></label>
        <label className="mt-3 block text-sm">What are you dreaming of?<textarea name="message" maxLength={600} rows={4} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" /></label>
        {err && <p role="alert" className="mt-2 text-sm text-warning">{err}</p>}
        <button className="font-display-slant mt-4 w-full rounded-md bg-primary py-3 text-primary-foreground">Send via WhatsApp</button>
      </form>
    </div>
  );
}
