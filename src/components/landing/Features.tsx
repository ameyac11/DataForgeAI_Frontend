import { Bot, Wand2, FolderOpen, Zap, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Bot, title: 'AI Chat Interface', description: 'Generate datasets through natural conversation — describe what you need and get it instantly.', accent: 'purple' },
  { icon: Wand2, title: 'Visual Schema Builder', description: 'Drag-and-drop column editor with 50+ data types for precise control over every field.', accent: 'orange' },
  { icon: FolderOpen, title: 'Sample Library', description: 'Pre-built datasets for e-commerce, healthcare, finance, and more common use cases.', accent: 'blue' },
  { icon: Zap, title: 'Fast Generation', description: 'Optimized algorithms generate thousands of rows in seconds with intelligent batching.', accent: 'yellow' },
  { icon: Shield, title: 'Privacy Safe', description: 'All data is synthetic — no real personal information is ever used or exposed.', accent: 'emerald' },
  { icon: Globe, title: 'Live Web Data', description: 'Compound models use live internet search for up-to-date, real-world enriched datasets.', accent: 'purple' },
];

const accentColors: Record<string, string> = {
  purple: 'from-purple-500/20 to-purple-500/5 group-hover:from-purple-500/30',
  orange: 'from-orange-500/20 to-orange-500/5 group-hover:from-orange-500/30',
  blue: 'from-blue-500/20 to-blue-500/5 group-hover:from-blue-500/30',
  yellow: 'from-yellow-500/20 to-yellow-500/5 group-hover:from-yellow-500/30',
  emerald: 'from-emerald-500/20 to-emerald-500/5 group-hover:from-emerald-500/30',
};

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-muted/20" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="container max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create production-ready datasets
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group relative p-5 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm hover:bg-card/70 hover:border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/5"
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${accentColors[f.accent]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
