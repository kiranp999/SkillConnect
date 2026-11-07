import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { motion } from 'framer-motion';

const MainLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--bg-body)' }}>
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="flex-grow-1"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};

export default MainLayout;
