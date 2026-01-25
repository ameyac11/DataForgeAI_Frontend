import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="sidebar"]',
    title: 'Navigation Sidebar',
    description: 'Access all main features from here - DataForge AI, Custom Generator, Sample Datasets, and History.',
    position: 'right',
  },
  {
    target: '[data-tour="detnest"]',
    title: 'DataForgeAI Chat',
    description: 'Describe your dataset needs in natural language. Our AI will generate exactly what you need.',
    position: 'bottom',
  },
  {
    target: '[data-tour="format-selector"]',
    title: 'Output Format',
    description: 'Choose your preferred format - CSV, JSON, SQL, or Parquet.',
    position: 'top',
  },
  {
    target: '[data-tour="help-menu"]',
    title: 'Need Help?',
    description: 'Click here anytime for guides, tutorials, or to contact support.',
    position: 'left',
  },
];

interface GuideTourProps {
  open: boolean;
  onComplete: () => void;
}

export function GuideTour({ open, onComplete }: GuideTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const step = tourSteps[currentStep];

  const calculatePosition = useCallback(() => {
    if (!open) return;

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 150;
      const offset = 16;
      const pos = { top: 0, left: 0 };

      switch (step.position) {
        case 'right':
          pos.top = Math.max(20, Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - 20));
          pos.left = Math.min(rect.right + offset, window.innerWidth - tooltipWidth - 20);
          break;
        case 'left':
          pos.top = Math.max(20, Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - 20));
          pos.left = Math.max(20, rect.left - tooltipWidth - offset);
          break;
        case 'bottom':
          pos.top = Math.min(rect.bottom + offset, window.innerHeight - tooltipHeight - 20);
          pos.left = Math.max(20, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 20));
          break;
        case 'top':
          pos.top = Math.max(20, rect.top - tooltipHeight - offset);
          pos.left = Math.max(20, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 20));
          break;
        default:
          pos.top = Math.min(rect.bottom + offset, window.innerHeight - tooltipHeight - 20);
          pos.left = Math.max(20, rect.left);
      }

      setPosition(pos);
    }
  }, [open, step]);

  useEffect(() => {
    if (!open) return;

    const element = document.querySelector(step.target);
    if (element) {
      calculatePosition();

      // Highlight element
      element.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background', 'relative', 'z-50');
      return () => {
        element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background', 'relative', 'z-50');
      };
    }
  }, [open, currentStep, step, calculatePosition]);

  // Recalculate on resize
  useEffect(() => {
    if (!open) return;
    
    const handleResize = () => calculatePosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, calculatePosition]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />

      {/* Tour Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          style={{ top: position.top, left: position.left }}
          className="fixed z-[60] w-80 bg-card border border-border rounded-xl p-5 shadow-xl"
        >
          <button
            onClick={onComplete}
            className="absolute top-3 right-3 p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <h3 className="font-semibold mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} of {tourSteps.length}
            </span>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="ghost" size="sm" onClick={handlePrev}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
