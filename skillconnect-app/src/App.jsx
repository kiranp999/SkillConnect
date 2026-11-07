import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BookingProvider>
              <AppRoutes />
            </BookingProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
