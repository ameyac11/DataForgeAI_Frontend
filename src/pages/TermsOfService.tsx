import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeLogo } from '@/components/ThemeLogo';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <ThemeLogo size="sm" />
            <span className="font-semibold">DataForgeAI</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container px-6 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using DataForgeAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              DataForgeAI is an AI-powered platform that generates synthetic, realistic, and hybrid datasets based on user specifications. Our service enables developers, researchers, and organizations to create test data, training datasets, and sample data for various purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
              <p>You must provide accurate and complete information when creating an account.</p>
              <p>You are responsible for all activities that occur under your account.</p>
              <p>You must notify us immediately of any unauthorized use of your account.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">You agree NOT to use DataForgeAI to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Generate data for illegal activities or purposes</li>
              <li>Create datasets that could be used for fraud or deception</li>
              <li>Impersonate real individuals or organizations</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to reverse-engineer or extract our AI models</li>
              <li>Overload or disrupt our systems or infrastructure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Intellectual Property</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-foreground">Platform IP:</strong> DataForgeAI, including our AI models, algorithms, and interface, is protected by intellectual property laws. You may not copy, modify, or distribute our platform.</p>
              <p><strong className="text-foreground">Generated Content:</strong> Datasets you generate using DataForgeAI are yours to use. We do not claim ownership of your generated data, but we may use anonymized usage patterns to improve our service.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted service. We may perform maintenance, updates, or experience outages. We will make reasonable efforts to notify users of planned downtime.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Data Retention</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Generated datasets are available for download for 24 hours unless saved to your account</li>
              <li>Saved datasets are retained until you delete them or close your account</li>
              <li>We may retain anonymized usage data for analytics purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              DataForgeAI is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform, including but not limited to direct, indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account for violation of these terms. You may terminate your account at any time by contacting support. Upon termination, your data will be deleted in accordance with our data retention policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms of Service from time to time. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@dataforgeai.com" className="text-primary hover:underline">
                legal@dataforgeai.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
