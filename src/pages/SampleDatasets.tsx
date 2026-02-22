import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Database, FileSpreadsheet, FileJson, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { localDatasets } from '@/data/localDatasets';

const formatIcons: Record<string, typeof FileSpreadsheet> = {
  CSV: FileSpreadsheet,
  JSON: FileJson,
  SQL: FileCode,
  Parquet: Database,
};

const SampleDatasets = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Use local datasets directly
  const datasets = localDatasets;

  const categories = [...new Set(datasets.map((d: any) => d.category))];

  const filteredDatasets = datasets.filter((dataset: any) => {
    const matchesSearch = dataset.name.toLowerCase().includes(search.toLowerCase()) ||
      dataset.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || dataset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Compact Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Database className="w-5 h-5 text-purple-500" />
            <h1 className="text-2xl font-bold tracking-tight">Sample Datasets</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mb-4">
            Accelerate your workflow with our professionally curated collection of synthetic datasets. Ready to jumpstart your AI development.
          </p>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Dataset Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDatasets.map((dataset, index) => {
            const FormatIcon = formatIcons[dataset.format] || Database;
            return (
              <motion.div
                key={dataset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover-lift group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FormatIcon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                    {dataset.category}
                  </span>
                </div>

                <h3 className="font-semibold mb-2">{dataset.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {dataset.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{dataset.rows.toLocaleString()} rows</span>
                    <span>•</span>
                    <span>{dataset.format}</span>
                  </div>
                  <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                    <a href={dataset.path} download>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredDatasets.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No datasets found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SampleDatasets;
