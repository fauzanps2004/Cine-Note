import { User } from '../types';

const USERS_KEY = 'cinenote_users';
const SESSION_KEY = 'cinenote_session';

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
    return safeUser;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
};