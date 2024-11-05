import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  setDoc, 
  where,
  QueryConstraint,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export const firebaseService = {
  async getDocument(collectionName: string, documentId: string) {
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  async setDocument(collectionName: string, documentId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, documentId);
      const timestamp = new Date().toISOString();
      const documentData = {
        ...data,
        updatedAt: timestamp,
        createdAt: data.createdAt || timestamp
      };
      await setDoc(docRef, documentData);
      return { id: documentId, ...documentData };
    } catch (error) {
      console.error('Error setting document:', error);
      throw error;
    }
  },

  async updateDocument(collectionName: string, documentId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, documentId);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(docRef, updateData);
      return { id: documentId, ...updateData };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  async deleteDocument(collectionName: string, documentId: string) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  async queryDocuments(collectionName: string, constraints: QueryConstraint[] = []) {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  },

  async checkSuperAdminExists() {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'superadmin'));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking superadmin:', error);
      throw error;
    }
  }
};