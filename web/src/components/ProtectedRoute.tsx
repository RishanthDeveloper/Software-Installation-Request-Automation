import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import type { Role } from '../lib/mockUsers';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Treat it_manager as admin for simplicity in this demo if needed, but we check specific roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground">Your role ({user.role}) does not have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
};
