import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { firebaseService } from '../services/firebase';
import { useForm } from 'react-hook-form';
import { Users, UserPlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: 'worker' | 'president';
  area?: string;
}

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserForm>();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await firebaseService.queryDocuments('users', []);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UserForm) => {
    const toastId = toast.loading('Creating user...');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      await firebaseService.setDocument('users', userCredential.user.uid, {
        name: data.name,
        email: data.email,
        role: data.role,
        area: data.area || null,
        createdAt: new Date().toISOString()
      });

      toast.success('User created successfully', { id: toastId });
      reset();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user', { id: toastId });
    }
  };

  return (
    <Layout>
      {/* Rest of the AdminDashboard component remains the same */}
    </Layout>
  );
}

export default AdminDashboard;