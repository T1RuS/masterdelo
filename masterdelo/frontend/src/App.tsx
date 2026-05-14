import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './components/ui/Toast'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { NewOrderPage } from './pages/NewOrderPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { ClientsPage } from './pages/ClientsPage'
import { ClientDetailPage } from './pages/ClientDetailPage'
import { FinancePage } from './pages/FinancePage'
import { ProfilePage } from './pages/ProfilePage'
import { CalendarPage } from './pages/CalendarPage'
import { LandingPage } from './pages/LandingPage'
import { EditOrderPage } from './pages/EditOrderPage'
import { PublicOrderPage } from './pages/PublicOrderPage'
import { useAuthStore } from './store/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/share/:token" element={<PublicOrderPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="orders/new" element={<NewOrderPage />} />
            <Route path="orders/:id/edit" element={<EditOrderPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:id" element={<ClientDetailPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </QueryClientProvider>
)

export default App
