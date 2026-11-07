import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      style={{
        background: 'var(--bg-surface-secondary)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-main)',
        borderRadius: '50%',
        width: '42px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: 'var(--card-shadow)',
        transition: 'var(--transition-normal)'
      }}
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <FiMoon size={20} style={{ color: '#4b5563' }} />
      ) : (
        <FiSun size={20} style={{ color: '#f59e0b' }} />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
