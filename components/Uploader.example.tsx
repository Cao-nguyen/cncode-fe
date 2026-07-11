/**
 * Uploader Component Usage Examples
 * 
 * Copy these examples to use the Uploader component in your pages
 */

import { useState } from 'react';
import Uploader from '@/components/Uploader';

interface UploadedFile {
    id: string;
    file: File;
    type: 'image' | 'video' | 'document';
    status: string;
    url?: string;
    placeholder?: string;
}

// ============================================
// Example 1: Basic Usage - Drop and Upload
// ============================================
export function BasicUploaderExample() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Upload Files</h1>
            <Uploader />
        </div>
    );
}

// ============================================
// Example 2: Images Only
// ============================================
export function ImageOnlyExample() {
    return (
        <Uploader
            maxFiles={5}
            acceptedTypes={{
                image: true,
                video: false,
                document: false
            }}
        />
    );
}

// ============================================
// Example 3: With Upload Callback
// ============================================
export function WithCallbackExample() {
    const handleUploadComplete = (files: UploadedFile[]) => {
        console.log('Upload complete:', files);

        // Get uploaded file URLs
        files.forEach(file => {
            if (file.status === 'done') {
                console.log('File URL:', file.url);
                console.log('File type:', file.type);

                // Use the URL in your app
                // e.g., save to database, display in gallery, etc.
            }
        });
    };

    return (
        <Uploader
            onUploadComplete={handleUploadComplete}
        />
    );
}

// ============================================
// Example 4: Custom API URL
// ============================================
export function CustomAPIExample() {
    return (
        <Uploader
            apiUrl="https://api.yourdomain.com"
        />
    );
}

// ============================================
// Example 5: Profile Picture Upload
// ============================================
export function ProfilePictureExample() {
    const [avatarUrl, setAvatarUrl] = useState('');

    const handleAvatarUpload = (files: UploadedFile[]) => {
        if (files[0]?.url) {
            setAvatarUrl(files[0].url);
            // Save to user profile
            updateUserProfile({ avatar: files[0].url });
        }
    };

    return (
        <div>
            <h2>Upload Profile Picture</h2>
            <Uploader
                maxFiles={1}
                acceptedTypes={{ image: true, video: false, document: false }}
                onUploadComplete={handleAvatarUpload}
            />
            {avatarUrl && (
                <img src={avatarUrl} alt="Profile" className="mt-4 w-32 h-32 rounded-full" />
            )}
        </div>
    );
}

// ============================================
// Example 6: Course Materials Upload
// ============================================
export function CourseMaterialsExample() {
    const [materials, setMaterials] = useState<UploadedFile[]>([]);

    const handleMaterialsUpload = (files: UploadedFile[]) => {
        const uploaded = files.filter(f => f.status === 'done');
        setMaterials((prev) => [...prev, ...uploaded]);

        // Save to database
        uploaded.forEach(file => {
            saveMaterialToDB({
                courseId: 'course-123',
                url: file.url,
                type: file.type,
                name: file.file.name
            });
        });
    };

    return (
        <div>
            <h2>Upload Course Materials</h2>
            <Uploader
                maxFiles={10}
                acceptedTypes={{
                    image: false,
                    video: true,
                    document: true
                }}
                onUploadComplete={handleMaterialsUpload}
            />

            <div className="mt-6">
                <h3>Uploaded Materials ({materials.length})</h3>
                <ul>
                    {materials.map((m) => (
                        <li key={m.id}>{m.file.name} - {m.type}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

// ============================================
// Example 7: Blog Post Cover Image
// ============================================
export function BlogCoverImageExample() {
    const [coverImage, setCoverImage] = useState('');
    const [placeholder, setPlaceholder] = useState('');

    return (
        <div>
            <h2>Blog Post Cover</h2>

            {/* Show blur placeholder while uploading */}
            {placeholder && !coverImage && (
                <img src={placeholder} alt="Uploading..." className="blur-sm" />
            )}

            {/* Show final image when done */}
            {coverImage && (
                <img src={coverImage} alt="Cover" />
            )}

            <Uploader
                maxFiles={1}
                acceptedTypes={{ image: true, video: false, document: false }}
                onUploadComplete={(files) => {
                    if (files[0]) {
                        setCoverImage(files[0].url || '');
                        setPlaceholder(files[0].placeholder || '');
                    }
                }}
            />
        </div>
    );
}

// ============================================
// Helper Functions (example)
// ============================================

async function updateUserProfile(data: { avatar: string }) {
    // Your API call here
    await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

async function saveMaterialToDB(data: {
    courseId: string;
    url?: string;
    type: string;
    name: string;
}) {
    // Your API call here
    await fetch('/api/course/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}