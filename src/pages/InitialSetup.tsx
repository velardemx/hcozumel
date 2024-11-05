import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';
import { firebaseService } from '../services/firebase';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

function InitialSetup() {
  const [isChecking, setIsChecking] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  
  const navigate = useNavigate();
  const { setUser, setUserRole } = useAuthStore();

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const hasSuperAdmin = await firebaseService.checkSuperAdminExists();
      if (hasSuperAdmin) {
        toast.success('System is already set up');
        navigate('/login', { replace: true });
        return;
      }
    } catch (error) {
      console.error('Setup check error:', error);
      toast.error('Failed to check system status');
    } finally {
      setIsChecking(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    
    setIsCreating(true);
    const toastId = toast.loading('Creating admin account...');

    try {
      const { email, password, name } = formData;
      const userData = {
        email,
        name,
        role: 'superadmin' as const,
        createdAt: new Date().toISOString()
      };

      const { user } = await authService.createUserWithRole(email, password, userData);
      
      setUser(user);
      setUserRole('superadmin');
      
      toast.success('Admin account created!', { id: toastId });
      
      // Force a small delay to ensure Firebase auth state is updated
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error(error.message || 'Failed to create account', { id: toastId });
      setIsCreating(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
          <span className="text-gray-600">Checking system status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Initial Setup</h1>
        <p className="text-gray-600 text-center mb-8">Create the super admin account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              required
              minLength={2}
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              required
              minLength={6}
              disabled={isCreating}
            />
            <p className="mt-1 text-sm text-gray-500">Minimum 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Creating Account...
              </>
            ) : (
              'Create Admin Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InitialSetup;