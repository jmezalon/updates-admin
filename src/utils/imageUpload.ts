export interface ImageUploadOptions {
  maxSizeInMB?: number;
  acceptedTypes?: string[];
  onUploadStart?: () => void;
  onUploadSuccess?: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  onUploadComplete?: () => void;
}

export interface ImageUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Validates an image file before upload
 */
export const validateImageFile = (
  file: File, 
  maxSizeInMB: number = 5,
  acceptedTypes: string[] = ['image/']
): { isValid: boolean; error?: string } => {
  // Validate file type
  const isValidType = acceptedTypes.some(type => file.type.startsWith(type));
  if (!isValidType) {
    return { isValid: false, error: 'Please select a valid image file' };
  }

  // Validate file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return { isValid: false, error: `Image file size must be less than ${maxSizeInMB}MB` };
  }

  return { isValid: true };
};

import { BASE_URL } from '../constants/config';

/**
 * Uploads an image file to the server
 */
export const uploadImageFile = async (
  file: File,
  authToken: string,
  endpoint: string = `${BASE_URL}/upload/image`
): Promise<ImageUploadResult> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        imageUrl: result.url || result.imageUrl
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Failed to upload image'
      };
    }
  } catch (err) {
    return {
      success: false,
      error: 'Network error while uploading image. Please try again.'
    };
  }
};

/**
 * Complete image upload process with validation and upload
 */
export const handleImageUpload = async (
  file: File,
  authToken: string,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> => {
  const {
    maxSizeInMB = 5,
    acceptedTypes = ['image/'],
    onUploadStart,
    onUploadSuccess,
    onUploadError,
    onUploadComplete
  } = options;

  // Validate file
  const validation = validateImageFile(file, maxSizeInMB, acceptedTypes);
  if (!validation.isValid) {
    const error = validation.error!;
    onUploadError?.(error);
    return { success: false, error };
  }

  // Start upload
  onUploadStart?.();

  try {
    const result = await uploadImageFile(file, authToken);
    
    if (result.success && result.imageUrl) {
      onUploadSuccess?.(result.imageUrl);
    } else {
      onUploadError?.(result.error || 'Upload failed');
    }
    
    return result;
  } finally {
    onUploadComplete?.();
  }
};
