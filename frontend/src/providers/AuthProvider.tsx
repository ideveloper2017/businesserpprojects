import { ReactNode } from 'react';
import { AuthProvider as AuthProviderBase } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthProviderBase>
      {children}
    </AuthProviderBase>
  );
}
