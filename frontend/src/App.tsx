import { ThemeProvider } from './providers/theme-provider'
import { Toaster } from '@/components/ui/sonner';
import {  Route, Routes } from 'react-router'
import DashboardPage from './pages/DashboardPage'
import CodePage from './pages/CodePage'
import AuthPage from './pages/AuthPage';
import EmailVerificationPage from './pages/EmailVerificationPage';


function App() {

  return (
    <>
      <ThemeProvider defaultTheme="system" >
        <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/code" element={<CodePage />} />
          </Routes>
      </ThemeProvider>
    </>
  )
}

export default App
