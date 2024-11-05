import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Loader2, MapPin } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { storage, db } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface WorkReportFormProps {
  onSuccess?: () => void;
}

interface FormInputs {
  description: string;
  image: FileList;
}

export function WorkReportForm({ onSuccess }: WorkReportFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { latitude, longitude, error: locationError, isLoading: locationLoading } = useGeolocation();

  const onSubmit = async (data: FormInputs) => {
    if (!latitude || !longitude) {
      toast.error('Location is required to start work');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Starting work...');

    try {
      // Upload image
      const imageFile = data.image[0];
      const storageRef = ref(storage, `work-reports/${Date.now()}-${imageFile.name}`);
      const uploadResult = await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // Create work report
      const workReport = {
        userId: user?.uid,
        description: data.description,
        startTime: new Date().toISOString(),
        status: 'in-progress',
        startImage: imageUrl,
        location: {
          lat: latitude,
          lng: longitude,
        },
      };

      await addDoc(collection(db, 'workReports'), workReport);

      toast.success('Work started successfully', { id: toastId });
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error starting work:', error);
      toast.error('Failed to start work. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (locationLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="animate-spin" />
        <span className="ml-2">Getting location...</span>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <MapPin className="text-red-500" />
          <span className="ml-2 text-red-700">{locationError}</span>
        </div>
        <p className="mt-2 text-sm text-red-600">
          Location access is required to report work. Please enable location services and refresh the page.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Work Description
        </label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          placeholder="Describe the work you're starting..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Start Image
        </label>
        <div className="mt-1 flex items-center">
          <input
            type="file"
            {...register('image', {
              required: 'Start image is required',
              validate: {
                isImage: (files) => 
                  files[0]?.type.startsWith('image/') || 'Please upload an image file',
              }
            })}
            accept="image/*"
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            <Camera className="h-5 w-5 mr-2" />
            Upload Photo
          </label>
        </div>
        {errors.image && (
          <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
        )}
      </div>

      <div className="flex items-center text-sm text-gray-600">
        <MapPin className="h-4 w-4 mr-1" />
        <span>
          Location: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
        </span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !latitude || !longitude}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Starting Work...
          </>
        ) : (
          'Start Work'
        )}
      </button>
    </form>
  );
}