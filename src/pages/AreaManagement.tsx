import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Area {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

function AreaManagement() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newArea, setNewArea] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'areas'));
      const areasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Area[];
      setAreas(areasData);
    } catch (error) {
      console.error('Error fetching areas:', error);
      toast.error('Failed to fetch areas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Creating area...');

    try {
      await addDoc(collection(db, 'areas'), {
        ...newArea,
        createdAt: new Date().toISOString()
      });
      
      toast.success('Area created successfully', { id: toastId });
      setNewArea({ name: '', description: '' });
      fetchAreas();
    } catch (error) {
      console.error('Error creating area:', error);
      toast.error('Failed to create area', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (areaId: string) => {
    const toastId = toast.loading('Deleting area...');

    try {
      await deleteDoc(doc(db, 'areas', areaId));
      toast.success('Area deleted successfully', { id: toastId });
      fetchAreas();
    } catch (error) {
      console.error('Error deleting area:', error);
      toast.error('Failed to delete area', { id: toastId });
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Area Management</h1>
          <p className="text-gray-600">Create and manage work areas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Area Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-6">
              <Plus className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold">Create New Area</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area Name
                </label>
                <input
                  type="text"
                  value={newArea.name}
                  onChange={(e) => setNewArea(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Enter area name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newArea.description}
                  onChange={(e) => setNewArea(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter area description"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  'Create Area'
                )}
              </button>
            </form>
          </div>

          {/* Areas List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Work Areas</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              </div>
            ) : areas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No areas created yet</p>
            ) : (
              <div className="space-y-4">
                {areas.map((area) => (
                  <div
                    key={area.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{area.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{area.description}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(area.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AreaManagement;