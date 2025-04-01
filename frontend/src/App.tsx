import { ThemeProvider } from './providers/theme-provider'
import { Toaster } from '@/components/ui/sonner';
import {  Route, Routes, Navigate } from 'react-router'
import DashboardPage from './pages/DashboardPage'
import { supabaseClient } from '@/config/supabase-client';
import { JotaiProvider } from './providers/jotai-provider';
import CodeEditorPage from './pages/CodeEditorPage'
import AuthPage from './pages/AuthPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/protected-route';
import { CreateTeamModal } from './components/dashboard/create-team-modal';
import { AuthProvider } from '@/providers/auth-context-provider';



function App() {
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
      <ThemeProvider defaultTheme="system" >
        <JotaiProvider>
        <Toaster position="top-center" />
        <CreateTeamModal />
          <Routes>
            <Route path="/" element={
              session ? <Navigate to="/dashboard" /> : <AuthPage />
      } />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            
            {/* Protected routes */}

              <Route 
                path="/dashboard" 
                element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
                } 
              />
              <Route 
                path="/code" 
                element={
                  <ProtectedRoute>
                    <CodeEditorPage />
                  </ProtectedRoute>
                } 
              />

          </Routes>
          </JotaiProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
