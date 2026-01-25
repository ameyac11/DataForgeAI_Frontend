import { MessageSquare, Settings2, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export function About() {
  return (
    <section id="about" className="py-20 sm:py-24 md:py-32 lg:py-36">
      <div className="container px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 px-4">
            What is <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">DataForgeAI</span>?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-4">
            A powerful platform for generating high-quality datasets using natural language.
            Create synthetic, realistic, or hybrid data for testing, development, or machine learning.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: MessageSquare,
              title: 'Chat-Based Generation',
              description: 'Describe what you need in plain English. Our AI understands context, relationships, and data patterns to generate exactly what you need.',
            },
            {
              icon: Settings2,
              title: 'Full Control',
              description: 'Fine-tune every column with our visual generator. Over 50 data types available with complete customization options.',
            },
            {
              icon: Download,
              title: 'Multiple Formats',
              description: 'Export in CSV, JSON, SQL, or Parquet. Ready for any workflow, with direct download or API integration.',
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
