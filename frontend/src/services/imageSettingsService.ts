import apiClient from '../config/api';

export interface ImageSizeSetting {
  id: number;
  image_size: string;
  image_size_value: number;
  status: 'active' | 'inactive';
}

export const getActiveImageSize = async (): Promise<ImageSizeSetting | null> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: ImageSizeSetting[] }>('/settings/image-size');
    if (response.data.success && Array.isArray(response.data.data)) {
      const activeSetting = response.data.data.find(setting => setting.status === 'active');
      return activeSetting || null;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const resizeImage = (file: File, resizePercentage: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleFactor = resizePercentage / 100;
        
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(resizedFile);
          },
          file.type,
          0.95
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
