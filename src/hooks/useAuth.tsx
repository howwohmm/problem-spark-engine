import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Placeholder for future Farcaster auth integration
interface User {
  id: string;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  fid?: number; // Farcaster ID
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user;

  const signIn = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with Farcaster SDK auth
      // Example: const user = await farcasterAuth.signIn();
      
      // Placeholder for development
      console.log('Auth placeholder - ready for Farcaster integration');
      
      // Mock user for development (remove when Farcaster is integrated)
      const mockUser: User = {
        id: 'dev-user',
        username: 'developer',
        displayName: 'Dev User',
        fid: 12345
      };
      setUser(mockUser);
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('auth-user');
  };

  // Persist auth state
  useEffect(() => {
    const savedUser = localStorage.getItem('auth-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('auth-user');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth-user', JSON.stringify(user));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Farcaster Integration Guide (for later):
// 
// 1. Install Farcaster SDK: npm install @farcaster/auth-kit
// 2. Replace signIn function with:
//    const farcasterConfig = { ... };
//    const { signIn: farcasterSignIn } = useFarcasterAuth(farcasterConfig);
// 3. Update User interface to match Farcaster user data
// 4. Add Farcaster-specific auth components