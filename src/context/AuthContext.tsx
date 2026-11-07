import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  adminDisplayName: string;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const BOOTSTRAP_ADMIN_EMAIL = 'aa525458516@gmail.com';

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
  const [isAdminRoleInDb, setIsAdminRoleInDb] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Check if user is the authorized bootstrap admin or has role in /admins/{uid}
        if (user.email && user.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
          setIsAdminRoleInDb(true);
          // Ensure admin record in /admins/{uid} exists so rules checking exists(/admins/$(uid)) pass
          setDoc(
            doc(db, 'admins', user.uid),
            {
              email: user.email,
              role: 'admin',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch((e) => console.warn('Admin record sync notice:', e));
        } else {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            setIsAdminRoleInDb(adminDoc.exists());
          } catch {
            setIsAdminRoleInDb(false);
          }
        }
      } else {
        setIsAdminRoleInDb(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isGoogleAdmin = Boolean(currentUser && currentUser.email === BOOTSTRAP_ADMIN_EMAIL);
  const isAdmin = isGoogleAdmin || isAdminRoleInDb;

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
    setIsAdminRoleInDb(false);
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
