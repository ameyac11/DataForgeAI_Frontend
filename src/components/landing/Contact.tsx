import { Mail, Clock, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });

    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-medium text-foreground mb-6">Contact</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out to our team.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto items-center">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-border group-hover:border-primary/30 transition-colors">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Email</h3>
                <a href="mailto:support@dataforgeai.com" className="text-lg text-foreground hover:text-primary transition-colors">
                  support@dataforgeai.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-border group-hover:border-primary/30 transition-colors">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Response Time</h3>
                <p className="text-lg text-foreground">Within 24 hours</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-border group-hover:border-primary/30 transition-colors">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Hours</h3>
                <p className="text-lg text-foreground">Mon-Fri, 9AM-6PM UTC</p>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="lg:col-span-3 bg-card p-8 md:p-12 rounded-[2rem] border border-border shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Name</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    required
                    className="bg-background border-border h-14 rounded-2xl focus:border-primary/50 transition-all px-6 text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    required
                    className="bg-background border-border h-14 rounded-2xl focus:border-primary/50 transition-all px-6 text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Message</label>
                <Textarea
                  placeholder="How can we help you?"
                  required
                  rows={5}
                  className="bg-background border-border rounded-2xl focus:border-primary/50 transition-all p-6 text-foreground resize-none"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-14 rounded-full text-lg font-medium shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}