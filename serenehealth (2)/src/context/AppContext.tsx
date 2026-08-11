import React, { createContext, useContext, useEffect, useState } from 'react';

type Profile = { 
  id: string; 
  name: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
  medications?: string;
};
export type Finding = {
  title: string;
  value: string;
  reference: string;
  status: string;
  statusVariant: "normal" | "abnormal";
};
export type RecordType = {
  id: string;
  profileId: string;
  title: string;
  date: string;
  clinic: string;
  status: string;
  statusVariant: "normal" | "abnormal" | "warning";
  type: string;
  imageUrl?: string;
  findings: Finding[];
};
export type AppEvent = {
  id: string;
  profileId: string;
  type: string;
  name: string;
  date: string;
  time?: string;
  doctor?: string;
  notes?: string;
  completed: boolean;
};

type AppContextType = {
  profiles: Profile[];
  currentProfileId: string;
  records: RecordType[];
  events: AppEvent[];
  switchProfile: (id: string) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  addProfile: (name: string, relationship?: string) => Promise<void>;
  login: () => Promise<void>;
  signup: (name: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string>("");
  const [records, setRecords] = useState<RecordType[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshData = async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      setProfiles(data.profiles || []);
      setCurrentProfileId(data.currentProfileId || "");
      setRecords(data.records || []);
      setEvents(data.events || []);
    } catch (e) {
      console.error("Failed to load state", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const switchProfile = async (id: string) => {
    if (isGuest) {
      setCurrentProfileId(id);
      return;
    }
    try {
      await fetch('/api/state/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: id })
      });
      refreshData();
    } catch (e) {
      console.error("Failed to switch profile", e);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (isGuest) return;
    try {
      await fetch('/api/state/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      refreshData();
    } catch (e) {
      console.error("Failed to update profile", e);
    }
  };

  const addProfile = async (name: string, relationship?: string) => {
    if (isGuest) return;
    try {
      await fetch('/api/state/profile/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, relationship })
      });
      refreshData();
    } catch (e) {
      console.error("Failed to add profile", e);
    }
  };

  const signup = async (name: string) => {
    try {
      await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      setIsAuthenticated(true);
      setIsGuest(false);
    } catch (e) {
      console.error("Signup failed", e);
    }
  };

  const login = async () => {
    try {
      await fetch('/api/auth/login', { method: 'POST' });
      setIsAuthenticated(true);
      setIsGuest(false);
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const continueAsGuest = () => { setIsAuthenticated(true); setIsGuest(true); };
  const logout = () => { setIsAuthenticated(false); setIsGuest(false); };

  const uploadRecord = async (file: File) => {
    if (isGuest) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error("Upload failed");
      await refreshData();
    } catch (e) {
      console.error("Failed to upload", e);
    } finally {
      setIsUploading(false);
    }
  };

  const addEvent = async (event: Partial<AppEvent>) => {
    if (isGuest) return;
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      await refreshData();
    } catch (e) {
      console.error("Failed to add event", e);
    }
  };

  const updateEvent = async (id: string, updates: Partial<AppEvent>) => {
    if (isGuest) return;
    try {
      await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      await refreshData();
    } catch (e) {
      console.error("Failed to update event", e);
    }
  };

  const deleteEvent = async (id: string) => {
    if (isGuest) return;
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      await refreshData();
    } catch (e) {
      console.error("Failed to delete event", e);
    }
  };

  return (
    <AppContext.Provider value={{
      profiles,
      currentProfileId,
      records,
      events,
      switchProfile,
      updateProfile,
      addProfile,
      refreshData,
      isUploading,
      uploadRecord,
      addEvent,
      updateEvent,
      deleteEvent,
      isGuest,
      isAuthenticated,
      login,
      signup,
      continueAsGuest,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
