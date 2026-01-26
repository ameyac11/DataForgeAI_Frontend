import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Settings2, FolderOpen, Download, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeLogo } from '@/components/ThemeLogo';

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
    <div className="min-h-screen bg-[#18181b] text-gray-200 font-sans selection:bg-primary/30 relative overflow-hidden">
      {/* Background Decoration */}
      {/* Background Decoration */}

      {/* Header */}
      <header className="border-b border-white/5 sticky top-0 bg-[#18181b]/80 backdrop-blur-md z-50">
        <div className="container px-6 h-20 flex items-center justify-between max-w-6xl mx-auto">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <ThemeLogo size="sm" forceTheme="dark" />
            <span className="font-medium text-white tracking-wide">DataNestX</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full px-5">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <Button size="sm" asChild className="rounded-full px-6 shadow-lg shadow-primary/20 bg-white text-black hover:bg-gray-100 border-0">
              <Link to="/app">Launch App</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-6 py-12 md:py-20 max-w-5xl mx-auto relative z-10">

        {/* Hero Section */}
        <section className="mb-20 text-center">
          <h1 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">
            Getting Started
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Master the art of synthetic data generation with DataNestX. Simple, powerful, and efficient.
          </p>
        </section>

        {/* Hero Banner Image */}
        <section className="mb-20">
          <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden border border-white/5 relative bg-[#232326]">
            <img
              src="/src/assets/purple-cubes-multiple.png"
              alt="Getting Started Banner"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#18181b]/20 to-transparent pointer-events-none" />
          </div>
        </section>

        {/* Introduction Card */}
        <section className="mb-12">
          <div className="bg-[#232326] p-8 md:p-10 rounded-3xl border border-white/5 shadow-2xl">
            <h2 className="text-2xl font-medium text-white mb-4 tracking-tight">{sections[0].title}</h2>
            <p className="text-gray-400 leading-8 text-lg">{sections[0].content}</p>
          </div>
        </section>

        {/* Key Features Grid */}
        <section className="mb-20">
          <h2 className="text-2xl font-medium text-white mb-8 px-2">{sections[1].title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {sections[1].items?.map((item, index) => (
              <div
                key={index}
                className="group p-8 rounded-3xl bg-[#232326] border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-[#2a2a2d]"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-medium text-white mb-8 px-2">{sections[2].title}</h2>
          <div className="space-y-4">
            {sections[2].steps?.map((step, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-6 md:gap-8 p-8 rounded-3xl bg-[#232326] border border-white/5 items-start md:items-center"
              >
                <div className="text-4xl font-medium text-white/10 select-none min-w-[3rem]">{step.number}</div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-20">
          <div className="p-10 rounded-3xl bg-gradient-to-br from-[#232326] to-[#1c1c1f] border border-white/5">
            <h2 className="text-2xl font-medium text-white mb-8">{sections[3].title}</h2>
            <ul className="grid gap-4">
              {sections[3].tips?.map((tip, index) => (
                <li key={index} className="flex items-start gap-4 text-gray-400 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2.5 group-hover:bg-white/60 transition-colors" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center pb-12">
          <Button asChild size="lg" className="h-14 px-10 rounded-full bg-white text-black hover:bg-gray-200 text-base font-medium transition-all hover:scale-105 shadow-xl shadow-white/5 border-0">
            <Link to="/app">Start Generating Now</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GettingStarted;
