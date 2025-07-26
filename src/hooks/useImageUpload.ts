import { useState } from 'react';
import { handleImageUpload, type ImageUploadOptions } from '../utils/imageUpload';

export interface UseImageUploadReturn {
  uploading: boolean;
  error: string;
  success: string;
  uploadImage: (file: File) => Promise<string | null>;
  clearMessages: () => void;
}

export const useImageUpload = (
  authToken: string,
  options: Omit<ImageUploadOptions, 'onUploadStart' | 'onUploadSuccess' | 'onUploadError' | 'onUploadComplete'> = {}
): UseImageUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    clearMessages();

    const result = await handleImageUpload(file, authToken, {
      ...options,
      onUploadStart: () => setUploading(true),
      onUploadSuccess: () => {
        setSuccess('Image uploaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      },
      onUploadError: (errorMessage) => setError(errorMessage),
      onUploadComplete: () => setUploading(false)
    });

    return result.success ? result.imageUrl! : null;
  };

  return {
    uploading,
    error,
    success,
    uploadImage,
    clearMessages
  };
};
