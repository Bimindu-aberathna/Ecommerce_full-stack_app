import { useState, useCallback } from 'react'

// Types and interfaces
export interface UploadFile {
  id: number
  file: File
  name: string
  size: number
  type: string
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
}

export interface UploadResult {
  fileId: number
  success: boolean
  data?: any
  error?: string
}

export interface UseImageUploadReturn {
  files: UploadFile[]
  uploading: boolean
  errors: string[]
  addFiles: (files: FileList | File[]) => void
  removeFile: (fileId: number) => void
  clearFiles: () => void
  uploadFiles: (uploadEndpoint?: string) => Promise<UploadResult[]>
  clearErrors: () => void
  updateFileProgress: (fileId: number, progress: number, status: UploadFile['status']) => void
  getFilesByStatus: (status: UploadFile['status']) => UploadFile[]
  hasFiles: boolean
  canAddMore: boolean
  remainingSlots: number
  maxFiles: number
  maxSizeInMB: number
  acceptedTypes: string
}

/**
 * Custom hook for handling image file uploads
 * @param maxFiles - Maximum number of files allowed (default: 5)
 * @param maxSizeInMB - Maximum file size in MB (default: 5)
 * @returns Hook state and methods
 */
export const useImageUpload = (maxFiles: number = 5, maxSizeInMB: number = 5): UseImageUploadReturn => {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])

  // Accepted image types
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024

  // Validate file type and size
  const validateFile = useCallback((file: File): string[] => {
    const errors: string[] = []
    
    if (!acceptedTypes.includes(file.type)) {
      errors.push(`${file.name}: Only image files are allowed`)
    }
    
    if (file.size > maxSizeInBytes) {
      errors.push(`${file.name}: File size must be less than ${maxSizeInMB}MB`)
    }
    
    return errors
  }, [maxSizeInBytes, maxSizeInMB])

  // Add files to the state
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const allErrors: string[] = []
    const validFiles: UploadFile[] = []

    // Check if adding these files would exceed the limit
    if (files.length + fileArray.length > maxFiles) {
      allErrors.push(`Cannot upload more than ${maxFiles} files`)
      setErrors(allErrors)
      return
    }

    fileArray.forEach(file => {
      const fileErrors = validateFile(file)
      if (fileErrors.length === 0) {
        // Create file object with preview
        const fileObj: UploadFile = {
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: 'pending' // pending, uploading, success, error
        }
        validFiles.push(fileObj)
      } else {
        allErrors.push(...fileErrors)
      }
    })

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
    }
    
    setErrors(allErrors)
  }, [files.length, maxFiles, validateFile])

  // Remove a file by id
  const removeFile = useCallback((fileId: number) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }, [])

  // Clear all files
  const clearFiles = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setFiles([])
    setErrors([])
  }, [files])

  // Update file progress
  const updateFileProgress = useCallback((fileId: number, progress: number, status: UploadFile['status']) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, progress, status }
          : file
      )
    )
  }, [])

  // Upload files to server
  const uploadFiles = useCallback(async (uploadEndpoint: string = '/api/upload'): Promise<UploadResult[]> => {
    if (files.length === 0) return []

    setUploading(true)
    const results: UploadResult[] = []

    try {
      for (const fileObj of files) {
        if (fileObj.status !== 'pending') continue

        updateFileProgress(fileObj.id, 0, 'uploading')

        const formData = new FormData()
        formData.append('file', fileObj.file)

        try {
          const response = await fetch(uploadEndpoint, {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const result = await response.json()
            updateFileProgress(fileObj.id, 100, 'success')
            results.push({ fileId: fileObj.id, success: true, data: result })
          } else {
            const errorText = await response.text()
            updateFileProgress(fileObj.id, 0, 'error')
            results.push({ 
              fileId: fileObj.id, 
              success: false, 
              error: errorText || 'Upload failed' 
            })
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          updateFileProgress(fileObj.id, 0, 'error')
          results.push({ 
            fileId: fileObj.id, 
            success: false, 
            error: errorMessage
          })
        }
      }
    } finally {
      setUploading(false)
    }

    return results
  }, [files, updateFileProgress])

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  // Get files by status
  const getFilesByStatus = useCallback((status: UploadFile['status']): UploadFile[] => {
    return files.filter(file => file.status === status)
  }, [files])

  return {
    files,
    uploading,
    errors,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    clearErrors,
    updateFileProgress,
    getFilesByStatus,
    // Computed values
    hasFiles: files.length > 0,
    canAddMore: files.length < maxFiles,
    remainingSlots: Math.max(0, maxFiles - files.length),
    // Configuration
    maxFiles,
    maxSizeInMB,
    acceptedTypes: acceptedTypes.join(', ')
  }
}