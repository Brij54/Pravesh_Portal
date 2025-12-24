import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface User{
    id: string;
    name: string,
    role: string, 
}

interface UserStoreState{
    currentUser: User | null;
    setCurrentUser: (user: User) => void;
}

export const useUserStore = create<UserStoreState>()(
  devtools((set) => ({
    currentUser: null,
    setCurrentUser: (user: User) => set({ currentUser: user }),
  }))
);