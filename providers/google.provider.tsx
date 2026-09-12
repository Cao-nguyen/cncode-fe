'use client';

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useRef } from "react";

interface GoogleProviderProps {
  children: React.ReactNode;
  clientId: string;
}

export default function GoogleProvider({ children, clientId }: GoogleProviderProps) {
  const isInitialized = useRef(false);

  // Prevent multiple Google initialization
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized.current) {
      isInitialized.current = true;
    }
  }, []);

  if (!clientId) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
