import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  { question: 'What types of data can DataForgeAI generate?', answer: 'DataForgeAI supports over 50 data types including personal information, financial data, dates, geographic data, and custom patterns. All data is synthetic and privacy-safe.' },
  { question: 'Is the generated data truly synthetic?', answer: 'Yes, all data is algorithmically generated. No real personal information is used, making it ideal for development and testing.' },
  { question: 'What export formats are supported?', answer: 'You can export data in CSV, JSON, SQL, and Parquet formats.' },
  { question: 'How many rows can I generate?', answer: 'DataForgeAI can generate up to 1 million rows per request with batch processing for larger datasets.' },
];

export function FAQ() {
  return (
    <section id="faq" className="py-28 md:py-36 bg-muted/30">
      <div className="container px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to know about DataForgeAI</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-xl px-6 bg-card">
                <AccordionTrigger className="text-left py-5 hover:no-underline"><span className="font-medium">{faq.question}</span></AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}