import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
        style={{
          zIndex: 2000,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="card-custom p-4 shadow-lg w-100"
          style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
        >
          <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
            <h5 className="fw-bold m-0 text-main">{title}</h5>
            <button
              onClick={onClose}
              className="btn btn-sm btn-icon rounded-circle bg-body-secondary text-main"
            >
              <FiX size={18} />
            </button>
          </div>

          <div>{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
