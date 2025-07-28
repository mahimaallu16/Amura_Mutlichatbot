import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import HomePage from "./pages/HomePage";
import QABot from "./pages/QABot";
import PDFBot from "./pages/PDFBot";
import ExcelBot from "./pages/ExcelBot";
import NotebookBot from "./pages/NotebookBot";
import PremiumFeatures from "./pages/PremiumFeatures";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import "./App.css";

// Create premium theme
const createPremiumTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f8fafc',
      paper: mode === 'dark' ? '#1e293b' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#f1f5f9' : '#1e293b',
      secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default function App() {
  const [mode, setMode] = useState('light');
  const [isPremium, setIsPremium] = useState(true); // Set to true for premium features
  const [user, setUser] = useState({
    name: 'Premium User',
    email: 'premium@example.com',
    plan: 'premium',
    usage: {
      chats: 150,
      files: 25,
      storage: '2.5GB'
    }
  });

  useEffect(() => {
    // Load user preferences from localStorage
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode) {
      setMode(savedMode);
    }
    
    // Load user data
    const savedUser = localStorage.getItem('user-data');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const theme = createPremiumTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      }}>
        <Router>
          <Routes>
            <Route path="/" element={
              <HomePage 
                mode={mode} 
                setMode={handleModeChange} 
                isPremium={isPremium}
                user={user}
              />
            } />
            <Route path="/qa" element={
              <QABot 
                mode={mode} 
                setMode={handleModeChange} 
                isPremium={isPremium}
                user={user}
              />
            } />
            <Route path="/pdf" element={
              <PDFBot 
                mode={mode} 
                setMode={handleModeChange} 
                isPremium={isPremium}
                user={user}
              />
            } />
            <Route path="/excel" element={
              <ExcelBot 
                mode={mode} 
                setMode={handleModeChange} 
                isPremium={isPremium}
                user={user}
              />
            } />
            <Route path="/notebook" element={
              <NotebookBot 
                mode={mode} 
                setMode={handleModeChange} 
                isPremium={isPremium}
                user={user}
              />
            } />
            <Route path="/premium" element={
              <PremiumFeatures 
                mode={mode} 
                setMode={handleModeChange} 
                isPremium={isPremium}
                user={user}
              />
            } />
            <Route path="/settings" element={
              <Settings 
                mode={mode} 
                setMode={handleModeChange} 
                isPremium={isPremium}
                user={user}
                setUser={setUser}
              />
            } />
            <Route path="/analytics" element={
              <Analytics 
                mode={mode} 
                setMode={handleModeChange} 
                isPremium={isPremium}
                user={user}
              />
            } />
          </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  );
}
