import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { VasudhUser } from '../types';

interface AuthState {
  user: FirebaseUser | null;
  profile: VasudhUser | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Start real-time listener for profile
        const docRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setState({
              user: firebaseUser,
              profile: docSnap.data() as VasudhUser,
              loading: false,
            });
          } else {
            setState({
              user: firebaseUser,
              profile: null,
              loading: false,
            });
          }
        }, (error) => {
          console.error("Error listening to user profile:", error);
          setState({ user: firebaseUser, profile: null, loading: false });
        });
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setState({ user: null, profile: null, loading: false });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  return state;
}
