import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import CodeEditorPage from "@/pages/CodeEditorPage";
import { Toaster } from '@/components/ui/sonner';
import DashboardPage from './pages/DashboardPage'
import { supabaseClient } from '@/config/supabase-client';
import { JotaiProvider } from './providers/jotai-provider';
import AuthPage from './pages/AuthPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/protected-route';
import { CreateTeamModal } from './components/dashboard/create-team-modal';
import { AuthProvider } from '@/providers/auth-context-provider';
import ProfilePage from './pages/ProfilePage';
import TeamCheckPage from './pages/TeamCheckPage';
import JoinPage from './pages/JoinPage';
import UserProfilePage from './pages/UserProfilePage';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthProvider>
      <ThemeProvider>
        <JotaiProvider>
          <Toaster position="top-center" />
          <Router>
            <CreateTeamModal />
            <Routes>
              <Route path="/" element={
                session ? <Navigate to="/team-check" /> : <AuthPage />
              } />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              
              {/* Team check route */}
              <Route 
                path="/team-check" 
                element={
                  <ProtectedRoute>
                    <TeamCheckPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard/:teamId" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={<Navigate to="/team-check" />} 
              />
              <Route 
                path="/code" 
                element={
                  <ProtectedRoute>
                    <CodeEditorPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/:username" 
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Team join route */}
              <Route 
                path="/join/:teamId" 
                element={
                  <ProtectedRoute>
                    <JoinPage />
                  </ProtectedRoute>
                } 
              />

            </Routes>
          </Router>
        </JotaiProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
