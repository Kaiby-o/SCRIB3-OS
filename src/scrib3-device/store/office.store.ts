import { create } from 'zustand';

export interface OfficeDesk {
  id: string;
  claimedBy: string | null;
  claimedAt: string | null;
  label: string | null;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface RemoteUser {
  userId: string;
  username: string;
  x: number;
  y: number;
  direction: string;
  color: string;
}

interface OfficeStore {
  isConnected: boolean;
  onlineUsers: Record<string, RemoteUser>;
  desks: OfficeDesk[];
  messages: ChatMessage[];
  chatVisible: boolean;
  chatFocused: boolean;
  interactionPrompt: string | null;

  setConnected: (v: boolean) => void;
  setOnlineUsers: (users: Record<string, RemoteUser>) => void;
  updateUser: (userId: string, data: Partial<RemoteUser>) => void;
  removeUser: (userId: string) => void;
  setDesks: (desks: OfficeDesk[]) => void;
  updateDesk: (id: string, update: Partial<OfficeDesk>) => void;
  addMessage: (msg: ChatMessage) => void;
  toggleChat: () => void;
  setChatFocused: (v: boolean) => void;
  setInteractionPrompt: (prompt: string | null) => void;
}

export const useOfficeStore = create<OfficeStore>((set) => ({
  isConnected: false,
  onlineUsers: {},
  desks: [],
  messages: [],
  chatVisible: false,
  chatFocused: false,
  interactionPrompt: null,

  setConnected: (v) => set({ isConnected: v }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  updateUser: (userId, data) =>
    set((s) => ({
      onlineUsers: {
        ...s.onlineUsers,
        [userId]: { ...s.onlineUsers[userId], ...data } as RemoteUser,
      },
    })),

  removeUser: (userId) =>
    set((s) => {
      const { [userId]: _, ...rest } = s.onlineUsers;
      return { onlineUsers: rest };
    }),

  setDesks: (desks) => set({ desks }),

  updateDesk: (id, update) =>
    set((s) => ({
      desks: s.desks.map((d) => (d.id === id ? { ...d, ...update } : d)),
    })),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages.slice(-99), msg] })),

  toggleChat: () => set((s) => ({ chatVisible: !s.chatVisible })),

  setChatFocused: (v) => set({ chatFocused: v }),

  setInteractionPrompt: (prompt) => set({ interactionPrompt: prompt }),
}));
