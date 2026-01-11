import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface ChildSession {
  studentId: string;
  studentName: string;
  niveauScolaire: string;
  isActive: boolean;
  expiresAt: Date;
}

interface ChildSessionContextType {
  childSession: ChildSession | null;
  startChildSession: (studentId: string, studentName: string, niveauScolaire: string) => void;
  endChildSession: () => void;
  isChildMode: boolean;
  timeRemaining: number; // en minutes
}

const ChildSessionContext = createContext<ChildSessionContextType | undefined>(undefined);

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 heures
const STORAGE_KEY = 'oumi_child_session';

export function ChildSessionProvider({ children }: { children: React.ReactNode }) {
  const [childSession, setChildSession] = useState<ChildSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Charger la session depuis le localStorage au démarrage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const session = JSON.parse(stored) as ChildSession;
        session.expiresAt = new Date(session.expiresAt);
        
        if (session.expiresAt > new Date()) {
          setChildSession(session);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Mettre à jour le temps restant toutes les minutes
  useEffect(() => {
    if (!childSession) {
      setTimeRemaining(0);
      return;
    }

    const updateTimeRemaining = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((childSession.expiresAt.getTime() - now.getTime()) / 60000));
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        endChildSession();
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [childSession]);

  const startChildSession = useCallback((studentId: string, studentName: string, niveauScolaire: string) => {
    const session: ChildSession = {
      studentId,
      studentName,
      niveauScolaire,
      isActive: true,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    };

    setChildSession(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, []);

  const endChildSession = useCallback(() => {
    setChildSession(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isChildMode = childSession?.isActive ?? false;

  return (
    <ChildSessionContext.Provider
      value={{
        childSession,
        startChildSession,
        endChildSession,
        isChildMode,
        timeRemaining,
      }}
    >
      {children}
    </ChildSessionContext.Provider>
  );
}

export function useChildSession() {
  const context = useContext(ChildSessionContext);
  if (context === undefined) {
    throw new Error('useChildSession must be used within a ChildSessionProvider');
  }
  return context;
}
