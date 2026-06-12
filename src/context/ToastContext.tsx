import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />;
      case 'error':
        return <AlertOctagon className="w-5 h-5 shrink-0 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />;
      case 'info':
        return <Info className="w-5 h-5 shrink-0 text-blue-400" />;
    }
  };

  const getToastClasses = (type: ToastType) => {
    const base = "flex items-center gap-3.5 p-4 rounded-2xl border backdrop-blur-md min-w-[320px] max-w-sm pointer-events-auto shadow-2xl relative overflow-hidden group";
    switch (type) {
      case 'success':
        return `${base} bg-emerald-500/10 border-emerald-500/20 text-emerald-300 shadow-emerald-950/20`;
      case 'error':
        return `${base} bg-red-500/10 border-red-500/20 text-red-300 shadow-red-950/20`;
      case 'warning':
        return `${base} bg-amber-500/10 border-amber-500/20 text-amber-300 shadow-amber-950/20`;
      case 'info':
        return `${base} bg-blue-500/10 border-blue-500/20 text-blue-300 shadow-blue-950/20`;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none max-w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 50, transition: { duration: 0.2 } }}
              layout
              className={getToastClasses(toast.type)}
            >
              {/* Left Colored Accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                toast.type === 'success' ? 'bg-emerald-500' :
                toast.type === 'error' ? 'bg-red-500' :
                toast.type === 'warning' ? 'bg-amber-500' :
                'bg-blue-500'
              }`} />

              {/* Icon */}
              {getToastIcon(toast.type)}

              {/* Message */}
              <span className="text-xs font-semibold leading-relaxed tracking-wide pr-6">{toast.message}</span>

              {/* Close Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
