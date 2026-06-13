import { useState } from 'react';
import { toast } from '../utils/toast';

const ImageUpload = ({ onImageSelect, currentImages = [], label = "Upload Images", multiple = true }) => {
  const [preview, setPreview] = useState(currentImages);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate file size (max 5MB per image)
    const maxSize = 5 * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return;
      }
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`);
        return;
      }
    }

    setUploading(true);
    const imageUrls = [];
    
    try {
      for (const file of files) {
        // Convert image to base64 for preview and storage
        const reader = new FileReader();
        
        const base64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // For external URLs (when editing), optimize through Cloudinary
        // For base64 images, store them directly (they'll be optimized on display)
        imageUrls.push(base64);
      }

      const newImages = multiple ? [...preview, ...imageUrls] : imageUrls;
      setPreview(newImages);
      onImageSelect(newImages);
      toast.success(`${imageUrls.length} image${imageUrls.length > 1 ? 's' : ''} uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = preview.filter((_, i) => i !== index);
    setPreview(newImages);
    onImageSelect(newImages);
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="mt-2">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple={multiple}
            onChange={handleImageChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed
              cursor-pointer"
          />
          {uploading && (
            <p className="mt-2 text-sm text-blue-600">Uploading images...</p>
          )}
        </div>
      </label>

      {/* Image Preview */}
      {preview.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {preview.map((img, index) => {
            // Display images directly (base64 or URL)
            const displayUrl = img;
            
            return (
              <div key={index} className="relative group">
                <img
                  src={displayUrl}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={uploading}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                  aria-label="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
