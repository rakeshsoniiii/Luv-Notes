import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { FirebaseNotesProvider } from "./contexts/FirebaseNotesContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import "./styles/theme.css";

function AppContent() {
  const { theme, isDark } = useTheme();
  
  return (
    <div className={`App fade-in love-gradient-bg love-theme-transition ${theme} ${isDark ? 'dark' : ''}`}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--card-bg)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            boxShadow: "0 8px 25px var(--shadow-color)",
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <FirebaseNotesProvider>
            <AppContent />
          </FirebaseNotesProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
