import { User } from '../types';

const USERS_KEY = 'cinenote_users';
const SESSION_KEY = 'cinenote_session';
const SAVED_ACCOUNTS_KEY = 'cinenote_saved_accounts';

// Helper to generate ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const authService = {
  login: async (username: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const safeUser: User = { id: user.id, username: user.username };
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    
    // Auto-save to local accounts for quick login
    authService.saveAccountLocally(safeUser);
    
    return safeUser;
  },

  signup: async (username: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.some(u => u.username === username)) {
      throw new Error('Username already exists');
    }

    const newUser = {
      id: generateId(),
      username,
      password // In a real app, use hashing!
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const safeUser: User = { id: newUser.id, username: newUser.username };
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    
    // Auto-save to local accounts for quick login
    authService.saveAccountLocally(safeUser);

    return safeUser;
  },

  quickLogin: async (user: User): Promise<User> => {
    // Log in a saved user directly
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  // --- Saved Accounts Management ---

  getSavedAccounts: (): User[] => {
    const savedRaw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    return savedRaw ? JSON.parse(savedRaw) : [];
  },

  saveAccountLocally: (user: User) => {
    const savedRaw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    const saved: User[] = savedRaw ? JSON.parse(savedRaw) : [];
    
    // Avoid duplicates
    if (!saved.some(u => u.id === user.id)) {
      saved.push(user);
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(saved));
    }
  },

  removeSavedAccount: (userId: string) => {
    const savedRaw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (savedRaw) {
      const saved: User[] = JSON.parse(savedRaw);
      const newSaved = saved.filter(u => u.id !== userId);
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(newSaved));
    }
  }
};
