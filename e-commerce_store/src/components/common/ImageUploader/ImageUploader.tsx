'use client';
import React from 'react';
import { useImageUpload, UploadFile } from '@/src/hooks/useImageUpload';

interface ImageUploaderProps {
  maxFiles: number;
  maxSizeInMB?: number;
  onFilesChange?: (files: UploadFile[]) => void;
  className?: string;
  title?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  maxFiles,
  maxSizeInMB = 2,
  onFilesChange,
  className = "",
  title = "Upload Images"
}) => {
  const {
    files,
    uploading,
    errors,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    clearErrors,
    hasFiles,
    canAddMore,
    remainingSlots,
  } = useImageUpload(maxFiles, maxSizeInMB);

  // Notify parent component when files change
  React.useEffect(() => {
    if (onFilesChange) {
      onFilesChange(files);
    }
  }, [files, onFilesChange]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    const results = await uploadFiles("/api/upload");
    console.log("Upload results:", results);
  };

  const getStatusColor = (status: UploadFile["status"]): string => {
    switch (status) {
      case "pending":
        return "bg-gray-200";
      case "uploading":
        return "bg-blue-200";
      case "success":
        return "bg-green-200";
      case "error":
        return "bg-red-200";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">
        {title} ({files.length}/{maxFiles})
      </h3>

      {/* Drop Zone */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        >
          <div className="space-y-2">
            <div className="text-gray-600">
              Drag & drop images here, or{' '}
              <label className="text-blue-500 cursor-pointer hover:text-blue-600">
                browse
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-sm text-gray-500">
              {remainingSlots} slots remaining • Max {maxSizeInMB}MB per file
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-red-800 font-medium">Upload Errors:</h4>
              <ul className="text-red-700 text-sm mt-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={clearErrors}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* File List */}
      {hasFiles && (
        <div className="mt-4 space-y-2">
          {files.map((fileObj) => (
            <div
              key={fileObj.id}
              className={`flex items-center p-3 rounded-lg ${getStatusColor(fileObj.status)}`}
            >
              {/* Preview */}
              <img
                src={fileObj.preview}
                alt={fileObj.name}
                className="w-12 h-12 object-cover rounded"
              />
              
              {/* File Info */}
              <div className="ml-3 flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {fileObj.name}
                </div>
                <div className="text-xs text-gray-600">
                  {(fileObj.size / (1024 * 1024)).toFixed(2)} MB
                </div>
                
                {/* Progress Bar */}
                {fileObj.status === 'uploading' && (
                  <div className="w-full bg-gray-300 rounded-full h-1 mt-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${fileObj.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Status & Remove Button */}
              <div className="ml-2 flex items-center space-x-2">
                <span className="text-xs capitalize font-medium">
                  {fileObj.status}
                </span>
                <button
                  onClick={() => removeFile(fileObj.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {hasFiles && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleUpload}
            disabled={uploading || files.every(f => f.status === 'success')}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
          
          <button
            onClick={clearFiles}
            disabled={uploading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;