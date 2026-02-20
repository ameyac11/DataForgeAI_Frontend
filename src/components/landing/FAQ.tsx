import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  { question: 'What types of data can DataForgeAI generate?', answer: 'Over 50 data types including personal information, financial data, dates, geographic data, and custom patterns. All data is synthetic and privacy-safe.' },
  { question: 'Is the generated data truly synthetic?', answer: 'Yes, all data is algorithmically generated. No real personal information is used, making it ideal for development and testing.' },
  { question: 'What export formats are supported?', answer: 'CSV, JSON, SQL, and Parquet formats are supported.' },
  { question: 'How many rows can I generate?', answer: 'Up to 1 million rows per request with batch processing for larger datasets.' },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-muted/20" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      <div className="container max-w-3xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">FAQ</h2>
          <p className="text-muted-foreground">Common questions about DataForgeAI</p>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-border/30 rounded-xl px-5 bg-card/40 backdrop-blur-sm">
              <AccordionTrigger className="text-left py-4 hover:no-underline text-sm"><span className="font-medium">{faq.question}</span></AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}