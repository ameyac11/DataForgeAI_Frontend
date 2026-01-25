import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Settings2, FolderOpen, Download, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeLogo } from '@/components/ThemeLogo';
import { motion } from 'framer-motion';

const sections = [
  {
    title: 'What is DataForgeAI?',
    content: 'DataForgeAI is an AI-powered platform for generating high-quality synthetic, realistic, and hybrid datasets. Whether you need test data for development, training data for machine learning, or sample data for demonstrations, DataForgeAI can create exactly what you need in seconds.',
  },
  {
    title: 'Key Features',
    items: [
      {
        icon: MessageSquare,
        title: 'DataForge AI Chat',
        description: 'Describe your dataset needs in natural language. Our AI understands context, relationships, and data patterns.',
      },
      {
        icon: Settings2,
        title: 'Custom Generator',
        description: 'Build datasets visually with our drag-and-drop interface. Choose from 50+ data types and customize every column.',
      },
      {
        icon: FolderOpen,
        title: 'Sample Library',
        description: 'Access pre-built datasets for common use cases like e-commerce, healthcare, finance, and more.',
      },
      {
        icon: Download,
        title: 'Multiple Formats',
        description: 'Export in CSV, JSON, SQL, or Parquet. Direct download or API integration available.',
      },
    ],
  },
  {
    title: 'Getting Started Steps',
    steps: [
      {
        number: '01',
        title: 'Describe Your Data',
        description: 'Use natural language to tell DataForge AI what kind of data you need. Be specific about columns, data types, and relationships.',
      },
      {
        number: '02',
        title: 'Configure Options',
        description: 'Choose your output format, data mode (synthetic, realistic, or hybrid), and the number of rows to generate.',
      },
      {
        number: '03',
        title: 'Generate & Download',
        description: 'Click generate and download your dataset. Large datasets are processed asynchronously with progress updates.',
      },
    ],
  },
  {
    title: 'Best Practices',
    tips: [
      'Be specific about data types and formats when describing your needs',
      'Use realistic mode for demo data that needs to look authentic',
      'Use synthetic mode when you need statistically accurate distributions',
      'Start with smaller datasets to validate the structure before generating large volumes',
      'Save frequently used configurations as templates',
    ],
  },
];

const GettingStarted = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <ThemeLogo size="sm" />
            <span className="font-semibold">DataNestX</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app">Go to App</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Getting Started</h1>
            <p className="text-lg text-muted-foreground">
              Learn how to generate high-quality datasets with DataNestX
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <main className="container px-6 pb-24 max-w-4xl">
        {/* What is DataNestX */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-4">{sections[0].title}</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">{sections[0].content}</p>
        </motion.section>

        {/* Key Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8">{sections[1].title}</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {sections[1].items?.map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-card border border-border"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Steps */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-8">{sections[2].title}</h2>
          <div className="space-y-6">
            {sections[2].steps?.map((step, index) => (
              <div
                key={index}
                className="flex gap-6 p-6 rounded-xl bg-card border border-border"
              >
                <div className="text-3xl font-bold text-primary/30">{step.number}</div>
                <div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Best Practices */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-6">{sections[3].title}</h2>
          <div className="p-6 rounded-xl bg-card border border-border">
            <ul className="space-y-3">
              {sections[3].tips?.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button asChild size="lg" className="h-12 px-8">
            <Link to="/app">Start Generating Data</Link>
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default GettingStarted;
