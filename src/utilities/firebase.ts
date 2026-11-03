import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref } from 'firebase/database';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAarMVhsPVIxfLw4cqiQWWir-51apbn-FU",
  authDomain: "cs392-react-challenges.firebaseapp.com",
  databaseURL: "https://cs392-react-challenges-default-rtdb.firebaseio.com",
  projectId: "cs392-react-challenges",
  storageBucket: "cs392-react-challenges.firebasestorage.app",
  messagingSenderId: "1088275209127",
  appId: "1:1088275209127:web:a37eb641abb770bce37482"
};

const firebase = initializeApp(firebaseConfig);
export const database = getDatabase(firebase);
export const auth = getAuth(firebase);

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (error) {
    console.error('Sign-in error:', error);
    alert(error instanceof Error ? error.message : String(error));
  }
};

const firebaseSignOut = () => signOut(auth);
export { firebaseSignOut as signOut };

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean;
}

export const useAuthState = (): AuthState => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsInitialLoading(false);
    });
  }, []);

  return { user, isAuthenticated: Boolean(user), isInitialLoading };
};

export const useDataQuery = <T = unknown>(path: string): [T | undefined, boolean, Error | undefined] => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    return onValue(
      ref(database, path),
      (snapshot) => {
        setData(snapshot.val());
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );
  }, [path]);

  return [data, loading, error];
};
