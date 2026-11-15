import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { verifyUserIsAdmin, BOOTSTRAP_ADMIN_EMAIL } from '../services/adminService';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  adminDisplayName: string;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  adminDisplayName: '',
  loading: true,
  loginWithGoogle: async () => {},
  loginWithEmailPassword: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Enforce email_verified and database check
        const isVerifiedAdmin = await verifyUserIsAdmin(user.email, user.uid, user.emailVerified);
        setIsAdmin(isVerifiedAdmin);

        // Sync admin doc for authorized bootstrap owner
        if (isVerifiedAdmin && user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
          setDoc(
            doc(db, 'admins', user.uid),
            {
              email: user.email.toLowerCase(),
              role: 'owner',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch((e) => console.warn('Admin record sync notice:', e));
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const adminDisplayName = currentUser?.displayName || currentUser?.email || 'Administrator';

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Failed to sign in with Google:', err);
      throw err;
    }
  };

  const loginWithEmailPassword = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err) {
      console.error('Failed to sign in with email/password:', err);
      throw err;
    }
  };

  const logout = async () => {
    setIsAdmin(false);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        adminDisplayName,
        loading,
        loginWithGoogle,
        loginWithEmailPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
