import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, AlertCircle, ServerCrash, Wifi, Clock, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ErrorType = 
  | 'server_error' 
  | 'api_limit' 
  | 'quota_exceeded' 
  | 'server_down' 
  | 'model_unavailable' 
  | 'network_error'
  | 'validation_error'
  | 'auth_error';

interface ErrorToastConfig {
  icon: typeof AlertTriangle;
  title: string;
  iconColorClass: string;
  progressClass: string;
}

const errorConfigs: Record<ErrorType, ErrorToastConfig> = {
  server_error: {
    icon: ServerCrash,
    title: 'Server Error',
    iconColorClass: 'text-red-500',
    progressClass: 'bg-red-500',
  },
  api_limit: {
    icon: Clock,
    title: 'API Limit Reached',
    iconColorClass: 'text-amber-500',
    progressClass: 'bg-amber-500',
  },
  quota_exceeded: {
    icon: Ban,
    title: 'Quota Exceeded',
    iconColorClass: 'text-orange-500',
    progressClass: 'bg-orange-500',
  },
  server_down: {
    icon: ServerCrash,
    title: 'Server Unavailable',
    iconColorClass: 'text-red-600',
    progressClass: 'bg-red-600',
  },
  model_unavailable: {
    icon: AlertCircle,
    title: 'Model Unavailable',
    iconColorClass: 'text-purple-500',
    progressClass: 'bg-purple-500',
  },
  network_error: {
    icon: Wifi,
    title: 'Network Error',
    iconColorClass: 'text-red-500',
    progressClass: 'bg-red-500',
  },
  validation_error: {
    icon: AlertTriangle,
    title: 'Validation Error',
    iconColorClass: 'text-yellow-500',
    progressClass: 'bg-yellow-500',
  },
  auth_error: {
    icon: AlertCircle,
    title: 'Authentication Error',
    iconColorClass: 'text-red-500',
    progressClass: 'bg-red-500',
  },
};

interface ErrorToast {
  id: string;
  type: ErrorType;
  message: string;
  timeout?: number;
}

interface ErrorToastItemProps {
  toast: ErrorToast;
  onClose: (id: string) => void;
}

const ErrorToastItem = ({ toast, onClose }: ErrorToastItemProps) => {
  const [progress, setProgress] = useState(100);
  const config = errorConfigs[toast.type];
  const Icon = config.icon;
  const timeout = toast.timeout || 5000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / timeout) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        onClose(toast.id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.id, timeout, onClose]);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      className={cn(
        "relative w-[400px] rounded-xl shadow-xl overflow-hidden",
        "bg-background border border-border"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={cn("shrink-0 mt-0.5", config.iconColorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold text-foreground")}>
            {config.title}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {toast.message}
          </p>
        </div>
        
        {/* Close button */}
        <button
          onClick={() => onClose(toast.id)}
          className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar - reverse countdown at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
        <motion.div
          className={cn("h-full", config.progressClass)}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
};

// Toast store
let toastListeners: ((toasts: ErrorToast[]) => void)[] = [];
let toasts: ErrorToast[] = [];

const notify = () => {
  toastListeners.forEach(listener => listener([...toasts]));
};

export const showErrorToast = (type: ErrorType, message: string, timeout?: number) => {
  const id = Date.now().toString() + Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, type, message, timeout }];
  notify();
  return id;
};

export const dismissErrorToast = (id: string) => {
  toasts = toasts.filter(t => t.id !== id);
  notify();
};

export const ErrorToastContainer = () => {
  const [localToasts, setLocalToasts] = useState<ErrorToast[]>([]);

  useEffect(() => {
    const listener = (newToasts: ErrorToast[]) => setLocalToasts(newToasts);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const handleClose = useCallback((id: string) => {
    dismissErrorToast(id);
  }, []);

  return (
    <div 
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none"
    >
      <AnimatePresence mode="sync">
        {localToasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ErrorToastItem toast={toast} onClose={handleClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};