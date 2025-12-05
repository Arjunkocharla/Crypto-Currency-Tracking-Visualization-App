/**
 * Main App component with routing
 * Uses Supabase Auth for authentication
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import Layout from './components/Layout';
import Home from './components/Home';
import Analysis from './components/Analysis';
import Login from './components/Login';
import SignUp from './components/SignUp';
import theme from './theme';
import { supabase } from './services/supabase';

// Protected Route Component
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
      
      // Sync with localStorage for backward compatibility
      if (session) {
        localStorage.setItem('authToken', session.access_token);
        localStorage.setItem('userEmail', session.user.email);
        localStorage.setItem('userId', session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      
      if (session) {
        // Clear sessionStorage when user changes (login or signup)
        if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
          sessionStorage.removeItem('portfolioSummary');
          sessionStorage.removeItem('portfolioHoldings');
        }
        
        localStorage.setItem('authToken', session.access_token);
        localStorage.setItem('userEmail', session.user.email);
        localStorage.setItem('userId', session.user.id);
      } else {
        // Clear everything on logout
        sessionStorage.removeItem('portfolioSummary');
        sessionStorage.removeItem('portfolioHoldings');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('authProvider');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  // Handle OAuth callback - Supabase will automatically parse hash fragments
  useEffect(() => {
    // Supabase client is configured with detectSessionInUrl: true
    // This will automatically handle the OAuth callback and create a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Session is already handled by Supabase, but we ensure localStorage is synced
        localStorage.setItem('authToken', session.access_token);
        localStorage.setItem('userEmail', session.user.email);
        localStorage.setItem('userId', session.user.id);
        
        // Clean up URL hash after processing
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    });
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
