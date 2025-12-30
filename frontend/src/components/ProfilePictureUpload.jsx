import { useState, useRef } from 'react';
import { FiUpload, FiTrash2, FiUser, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProfilePictureUpload = ({ currentPictureUrl, onUpload, onDelete }) => {
  const [preview, setPreview] = useState(currentPictureUrl);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Validation constants
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_DIMENSION = 2048;
  const MIN_DIMENSION = 100;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const validateFile = (file) => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return false;
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      toast.error(`Image too large. Max size is ${MAX_SIZE / (1024 * 1024)}MB`);
      return false;
    }

    return true;
  };

  const validateDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const { width, height } = img;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          reject(new Error(`Image too large. Max ${MAX_DIMENSION}x${MAX_DIMENSION}px`));
        } else if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
          reject(new Error(`Image too small. Min ${MIN_DIMENSION}x${MIN_DIMENSION}px`));
        } else {
          resolve(true);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };

      img.src = objectUrl;
    });
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Basic validation
    if (!validateFile(file)) {
      return;
    }

    try {
      // Validate dimensions
      await validateDimensions(file);

      // Set file and preview
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to upload profile picture');
      // Revert preview on error
      setPreview(currentPictureUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPictureUrl) {
      toast.error('No profile picture to delete');
      return;
    }

    setUploading(true);
    try {
      await onDelete();
      setPreview(null);
      setSelectedFile(null);
      toast.success('Profile picture deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(currentPictureUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Preview */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FiUser className="w-16 h-16 text-gray-400" />
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div className="flex-1">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <div className="text-sm text-gray-600 mb-2">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
              >
                <span>Upload a file</span>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileInputChange}
                  disabled={uploading}
                />
              </label>
              <span className="pl-1">or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500">
              JPEG, PNG or WebP up to 5MB
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Min: {MIN_DIMENSION}x{MIN_DIMENSION}px, Max: {MAX_DIMENSION}x{MAX_DIMENSION}px
            </p>
          </div>

          {/* Actions */}
          {selectedFile && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiUpload className="mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={handleCancel}
                disabled={uploading}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiX className="inline-block mr-1" />
                Cancel
              </button>
            </div>
          )}

          {!selectedFile && currentPictureUrl && (
            <div className="mt-4">
              <button
                onClick={handleDelete}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiTrash2 className="mr-2" />
                {uploading ? 'Deleting...' : 'Delete Picture'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
