import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Settings2, FolderOpen, Download, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeLogo } from '@/components/ThemeLogo';
import { Database } from 'lucide-react';

const features = [
  { icon: MessageSquare, title: 'AI Chat', description: 'Describe your dataset in natural language. The AI understands context, relationships, and patterns.', accent: 'from-purple-500/10 to-purple-500/5' },
  { icon: Settings2, title: 'Custom Generator', description: 'Build datasets visually with 50+ data types and full control over every column.', accent: 'from-orange-500/10 to-orange-500/5' },
  { icon: FolderOpen, title: 'Sample Library', description: 'Pre-built datasets for e-commerce, healthcare, finance, and more.', accent: 'from-blue-500/10 to-blue-500/5' },
  { icon: Database, title: 'My Datasets', description: 'Manage, search, and download all your previously generated datasets in one place.', accent: 'from-rose-500/10 to-rose-500/5' },
  { icon: Download, title: 'Multiple Formats', description: 'Export in CSV, JSON, SQL, or Parquet.', accent: 'from-emerald-500/10 to-emerald-500/5' },
];

const steps = [
  { n: '01', title: 'Describe Your Data', description: 'Use natural language to specify columns, data types, and relationships.' },
  { n: '02', title: 'Configure Options', description: 'Choose format, data mode (synthetic/realistic/hybrid), and row count.' },
  { n: '03', title: 'Generate & Download', description: 'Click generate and download your dataset instantly.' },
];

const tips = [
  'Be specific about data types and formats',
  'Use realistic mode for demo data that needs to look authentic',
  'Use synthetic mode for statistically accurate distributions',
  'Start small to validate structure before generating large volumes',
  'Compound models use live internet data for real-world accuracy',
];

const GettingStarted = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors relative">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/3 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none transform-gpu" />
      </div>

      {/* Header */}
      <header className="border-b border-border/30 sticky top-0 bg-background/80 backdrop-blur-2xl z-50">
        <div className="container max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ThemeLogo size="sm" />
            <span className="text-sm font-semibold">DataForgeAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-foreground rounded-lg">
              <Link to="/"><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Link>
            </Button>
            <Button size="sm" asChild className="rounded-xl px-4 text-xs font-semibold bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white border-0 shadow-sm shadow-purple-500/10">
              <Link to="/app">Launch App</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-6 py-16 relative z-10">
        {/* Hero */}
        <section className="mb-16 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border border-border/30 bg-card/60 backdrop-blur-sm text-muted-foreground mb-4">
            <Sparkles className="w-3 h-3 text-purple-500" />
            Quick Start Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Getting Started</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Simple, powerful synthetic data generation.
          </p>
        </section>

        {/* What is it */}
        <section className="mb-14">
          <div className="p-6 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-lg font-bold mb-2">What is DataForgeAI?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An AI-powered platform for generating high-quality synthetic, realistic, and hybrid datasets. Whether you need test data for development, training data for ML, or sample data for demos — generate exactly what you need in seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-14">
          <h2 className="text-lg font-bold mb-5">Key Features</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="group p-5 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm hover:bg-card/70 hover:border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/15 to-orange-500/15 flex items-center justify-center mb-3">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="mb-14">
          <h2 className="text-lg font-bold mb-5">How to Start</h2>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={i} className="group flex gap-5 p-5 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm items-start hover:bg-card/70 hover:border-border/50 transition-all duration-300">
                <span className="text-2xl font-bold bg-gradient-to-br from-purple-500/30 to-orange-500/30 bg-clip-text text-transparent select-none group-hover:from-purple-500/50 group-hover:to-orange-500/50 transition-all">{s.n}</span>
                <div>
                  <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-14">
          <div className="p-6 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-lg font-bold mb-4">Best Practices</h2>
              <ul className="space-y-3">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pb-8">
          <Button asChild size="lg" className="rounded-xl px-8 text-sm font-semibold bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white border-0 shadow-lg shadow-purple-500/15">
            <Link to="/app">
              Start Generating
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GettingStarted;
