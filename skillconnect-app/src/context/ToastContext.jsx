import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: '100%'
        }}
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '12px',
                background:
                  toast.type === 'success'
                    ? '#10b981'
                    : toast.type === 'error'
                    ? '#ef4444'
                    : toast.type === 'warning'
                    ? '#f59e0b'
                    : '#2563eb',
                color: '#ffffff',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                fontSize: '0.92rem',
                fontWeight: '500'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {toast.type === 'success' && <FiCheckCircle size={20} />}
                {toast.type === 'error' && <FiAlertCircle size={20} />}
                {toast.type === 'warning' && <FiAlertCircle size={20} />}
                {toast.type === 'info' && <FiInfo size={20} />}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex'
                }}
              >
                <FiX size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
