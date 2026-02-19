import { Bot, Wand2, FolderOpen, Zap, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Bot,
    title: 'DataForge AI Chat',
    description: 'Intelligent chatbot that understands your data needs and generates datasets through natural conversation.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: Wand2,
    title: 'Custom Generator',
    description: 'Visual drag-and-drop interface for precise control over every column and data type.',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: FolderOpen,
    title: 'Sample Library',
    description: 'Curated ready-to-use datasets for common use cases like e-commerce, healthcare, and finance.',
    gradient: 'from-orange-500/20 to-red-500/20',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate millions of rows in seconds with optimized algorithms and parallel processing.',
    gradient: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'All data is synthetic. No real personal information is used or exposed in any generated dataset.',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    icon: Globe,
    title: 'Global Data',
    description: 'Localized data for any region or market with proper formatting and cultural context.',
    gradient: 'from-indigo-500/20 to-blue-500/20',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-24 md:py-32 lg:py-36 bg-muted/30">
      <div className="container px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-4 sm:mb-6 text-foreground">
            Powerful Features
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Everything you need to create and export high-quality datasets
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="group p-8 rounded-3xl bg-card border border-border hover:border-primary/20 transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
