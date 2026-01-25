import { Database, ShoppingCart, HeartPulse, TrendingUp, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const useCases = [
  {
    icon: Database,
    title: 'Testing & QA',
    description: 'Generate realistic test data for databases, APIs, and applications. Ensure edge cases and data variations are covered.',
  },
  {
    icon: ShoppingCart,
    title: 'E-commerce',
    description: 'Create product catalogs, customer data, order histories, and inventory datasets for online retail platforms.',
  },
  {
    icon: HeartPulse,
    title: 'Healthcare',
    description: 'Generate synthetic patient records, medical data, and clinical datasets while maintaining privacy compliance.',
  },
  {
    icon: TrendingUp,
    title: 'Financial Services',
    description: 'Build transaction histories, portfolio data, and financial metrics for banking and fintech applications.',
  },
  {
    icon: Users,
    title: 'Machine Learning',
    description: 'Create training datasets with balanced distributions, proper labeling, and realistic feature correlations.',
  },
  {
    icon: MapPin,
    title: 'Geospatial',
    description: 'Generate location data, addresses, coordinates, and geographic information for mapping applications.',
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-28 md:py-36">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Use Cases</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            DataForgeAI adapts to your industry and workflow
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {useCases.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
