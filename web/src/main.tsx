import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { ProtectedRoute } from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewRequest from './pages/NewRequest'
import Approvals from './pages/Approvals'
import Queue from './pages/Queue'
import MyRequests from './pages/MyRequests'
import './index.css'

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'employee') return <Navigate to="/requests" replace />;
  return <Navigate to="/dashboard" replace />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter basename="/Software-Installation-Request-Automation/">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />
          
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['it_support', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/requests" element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            } />
            <Route path="/requests/new" element={
              <ProtectedRoute>
                <NewRequest />
              </ProtectedRoute>
            } />
            <Route path="/approvals" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <Approvals />
              </ProtectedRoute>
            } />
            <Route path="/queue" element={
              <ProtectedRoute allowedRoles={['it_support', 'admin']}>
                <Queue />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
