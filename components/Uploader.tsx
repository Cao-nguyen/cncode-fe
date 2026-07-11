'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Video, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

// Types
interface UploadFile {
    id: string;
    file: File;
    type: 'image' | 'video' | 'document';
    status: 'idle' | 'uploading' | 'processing' | 'done' | 'failed';
    progress: number;
    jobId?: string;
    url?: string;
    placeholder?: string;
    pdfPreviews?: Array<{ page: number; data: string }>;
    error?: string;
}

interface UploaderProps {
    apiUrl?: string;
    onUploadComplete?: (files: UploadFile[]) => void;
    maxFiles?: number;
    acceptedTypes?: {
        image?: boolean;
        video?: boolean;
        document?: boolean;
    };
}

const Uploader: React.FC<UploaderProps> = ({
    apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    onUploadComplete,
    maxFiles = 10,
    acceptedTypes = { image: true, video: true, document: true }
}) => {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize WebSocket connection
    const initSocket = useCallback(() => {
        if (!socketRef.current) {
            socketRef.current = io(`${apiUrl}/upload-progress`, {
                transports: ['websocket', 'polling']
            });

            socketRef.current.on('upload:progress', (data: { jobId: string; progress: number }) => {
                setFiles(prev => prev.map(f =>
                    f.jobId === data.jobId
                        ? { ...f, progress: data.progress, status: 'processing' as const }
                        : f
                ));
            });

            socketRef.current.on('upload:completed', (data: { jobId: string; url: string; pdfPreviews?: Array<{ page: number; data: string }> }) => {
                setFiles(prev => prev.map(f =>
                    f.jobId === data.jobId
                        ? { ...f, status: 'done' as const, progress: 100, url: data.url, pdfPreviews: data.pdfPreviews }
                        : f
                ));
            });

            socketRef.current.on('upload:failed', (data: { jobId: string; error: string }) => {
                setFiles(prev => prev.map(f =>
                    f.jobId === data.jobId
                        ? { ...f, status: 'failed', error: data.error }
                        : f
                ));
            });
        }
    }, [apiUrl]);

    // Determine file type
    const getFileType = (file: File): 'image' | 'video' | 'document' | null => {
        const mime = file.type;
        if (mime.startsWith('image/')) return acceptedTypes.image ? 'image' : null;
        if (mime.startsWith('video/')) return acceptedTypes.video ? 'video' : null;
        if (mime === 'application/pdf' || mime.includes('document')) return acceptedTypes.document ? 'document' : null;
        return null;
    };

    // Handle file selection
    const handleFileSelect = async (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        initSocket();

        const newFiles: UploadFile[] = Array.from(selectedFiles)
            .slice(0, maxFiles - files.length)
            .map(file => {
                const type = getFileType(file);
                return type ? {
                    id: Math.random().toString(36).substr(2, 9),
                    file,
                    type,
                    status: 'idle' as const,
                    progress: 0
                } : null;
            })
            .filter(Boolean) as UploadFile[];

        setFiles(prev => [...prev, ...newFiles]);

        // Upload each file
        for (const uploadFile of newFiles) {
            await uploadFileToServer(uploadFile);
        }
    };

    // Upload file to server
    const uploadFileToServer = async (uploadFile: UploadFile) => {
        const formData = new FormData();
        formData.append('file', uploadFile.file);

        const endpoint = uploadFile.type === 'image'
            ? '/api/test-up/image'
            : uploadFile.type === 'video'
                ? '/api/test-up/video'
                : '/api/test-up/document';

        try {
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
            ));

            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setFiles(prev => prev.map(f =>
                    f.id === uploadFile.id
                        ? {
                            ...f,
                            jobId: data.jobId,
                            placeholder: data.placeholder,
                            status: 'processing',
                            progress: 10
                        }
                        : f
                ));
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id
                    ? { ...f, status: 'failed', error: errorMessage }
                    : f
            ));
        }
    };

    // Drag & Drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    // Remove file
    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    // Get icon for file type
    const getIcon = (type: string) => {
        switch (type) {
            case 'image': return <Image className="w-5 h-5" />;
            case 'video': return <Video className="w-5 h-5" />;
            case 'document': return <FileText className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'uploading':
            case 'processing': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            default: return null;
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-4">
            {/* Upload Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                    }
        `}
            >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
                <p className="text-sm text-gray-500">
                    {acceptedTypes.image && 'Images, '}
                    {acceptedTypes.video && 'Videos, '}
                    {acceptedTypes.document && 'Documents'}
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={[
                        acceptedTypes.image && 'image/*',
                        acceptedTypes.video && 'video/*',
                        acceptedTypes.document && 'application/pdf,.doc,.docx'
                    ].filter(Boolean).join(',')}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map(file => (
                        <div
                            key={file.id}
                            className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                {/* Icon */}
                                <div className="flex-shrink-0">{getIcon(file.type)}</div>

                                {/* Preview/Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium truncate">{file.file.name}</p>
                                        {getStatusIcon(file.status)}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>

                                    {/* Progress Bar */}
                                    {(file.status === 'uploading' || file.status === 'processing') && (
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${file.progress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{file.progress}%</p>
                                        </div>
                                    )}

                                    {/* Image Preview */}
                                    {file.type === 'image' && file.placeholder && (
                                        <img
                                            src={file.placeholder}
                                            alt="Preview"
                                            className="mt-2 w-32 h-32 object-cover rounded"
                                        />
                                    )}

                                    {/* PDF Previews */}
                                    {file.type === 'document' && file.pdfPreviews && (
                                        <div className="mt-2 flex gap-2 overflow-x-auto">
                                            {file.pdfPreviews.map(preview => (
                                                <img
                                                    key={preview.page}
                                                    src={preview.data}
                                                    alt={`Page ${preview.page}`}
                                                    className="w-24 h-32 object-cover rounded border"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Error */}
                                    {file.error && (
                                        <p className="text-sm text-red-500 mt-2">{file.error}</p>
                                    )}
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Uploader;