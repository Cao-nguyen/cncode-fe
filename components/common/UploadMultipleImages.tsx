'use client';

import { useState, useRef, useCallback } from 'react';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface UploadResult {
    jobId: string;
    placeholder: string;
    fileName: string;
    fileSize: number;
    url?: string;
}

interface UploadMultipleImagesProps {
    onUploadComplete?: (results: UploadResult[]) => void;
    maxFiles?: number;
    className?: string;
}

export default function UploadMultipleImages({
    onUploadComplete,
    maxFiles = 10,
    className = ''
}: UploadMultipleImagesProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [progress, setProgress] = useState<number[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            (file) => file.type.startsWith('image/')
        );

        if (droppedFiles.length > 0) {
            setFiles((prev) => {
                const newFiles = [...prev, ...droppedFiles];
                return newFiles.slice(0, maxFiles);
            });
        }
    }, [maxFiles]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []).filter(
            (file) => file.type.startsWith('image/')
        );

        if (selectedFiles.length > 0) {
            setFiles((prev) => {
                const newFiles = [...prev, ...selectedFiles];
                return newFiles.slice(0, maxFiles);
            });
        }
    }, [maxFiles]);

    const removeFile = useCallback((index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setProgress((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const uploadFiles = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        setProgress(new Array(files.length).fill(0));

        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('files', file);
            });

            const response = await fetch('/api/upload/encrypted/images/multiple', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();

            if (data.success && data.uploads) {
                const results: UploadResult[] = data.uploads.map((upload: UploadResult) => ({
                    jobId: upload.jobId,
                    placeholder: upload.placeholder,
                    fileName: upload.fileName,
                    fileSize: upload.fileSize,
                    url: getImageUrl(upload.jobId)
                }));

                onUploadComplete?.(results);
                setFiles([]);
                setProgress([]);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={className}>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />
                <p className="text-gray-600">
                    {files.length > 0
                        ? `${files.length} file(s) selected`
                        : 'Click or drag images here to upload'}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                    Max {maxFiles} files
                </p>
            </div>

            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                            <div className="flex items-center space-x-3">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-12 h-12 object-cover rounded"
                                />
                                <div>
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700"
                                disabled={isUploading}
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={uploadFiles}
                        disabled={isUploading}
                        className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'Uploading...' : 'Upload All'}
                    </button>
                </div>
            )}
        </div>
    );
}
