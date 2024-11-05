import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { firebaseService } from './firebase';

interface UserData {
  email: string;
  name: string;
  role: 'superadmin' | 'president' | 'admin' | 'worker';
  area?: string;
  createdAt: string;
}

export const authService = {
  async signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userData = await firebaseService.getDocument('users', userCredential.user.uid);
    return { user: userCredential.user, userData };
  },

  async createUserWithRole(email: string, password: string, userData: UserData) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await firebaseService.setDocument('users', userCredential.user.uid, userData);
    return { user: userCredential.user, userData };
  },

  async signOut() {
    await firebaseSignOut(auth);
  },

  async getCurrentUser(): Promise<{ user: User; userData: UserData } | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    const userData = await firebaseService.getDocument('users', user.uid);
    return userData ? { user, userData: userData as UserData } : null;
  }
};