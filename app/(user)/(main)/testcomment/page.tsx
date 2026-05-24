// app/testcomment/page.tsx
'use client';

import { useState } from 'react';
import CommentSection from '@/components/comment/CommentSection';

type TargetType = 'post' | 'lesson' | 'workspace' | 'task' | 'feedback' | 'feed' | 'short_video';

const DEMO_POSTS = [
    { id: 'post-1', title: 'Bài viết về React 19' },
    { id: 'post-2', title: 'Hướng dẫn sử dụng Next.js 15' },
    { id: 'post-3', title: 'Tối ưu performance cho web app' },
];

const DEMO_LESSONS = [
    { id: 'lesson-1', title: 'Bài 1: Giới thiệu về TypeScript' },
    { id: 'lesson-2', title: 'Bài 2: Cài đặt và cấu hình' },
    { id: 'lesson-3', title: 'Bài 3: Kiểu dữ liệu cơ bản' },
];

export default function TestCommentPage() {
    const [targetType, setTargetType] = useState<TargetType>('post');
    const [selectedId, setSelectedId] = useState('post-1');

    const currentItems = targetType === 'post' ? DEMO_POSTS : DEMO_LESSONS;

    const handleTypeChange = (type: TargetType) => {
        setTargetType(type);
        if (type === 'post') {
            setSelectedId('post-1');
        } else {
            setSelectedId('lesson-1');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">🧪 Test Comment System</h1>

                {/* Select Type */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => handleTypeChange('post')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${targetType === 'post'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        📝 Bài viết
                    </button>
                    <button
                        onClick={() => handleTypeChange('lesson')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${targetType === 'lesson'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        📚 Bài học
                    </button>
                </div>

                {/* Select Item */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chọn nội dung:</label>
                    <div className="flex flex-wrap gap-2">
                        {currentItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedId(item.id)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition ${selectedId === item.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {item.title}
                            </button>
                        ))}
                    </div>
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                            🔍 Đang xem: <strong>{currentItems.find(i => i.id === selectedId)?.title}</strong>
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                            Target Type: {targetType} | Target ID: {selectedId}
                        </p>
                    </div>
                </div>
            </div>

            {/* Comment Section */}
            <CommentSection
                targetType={targetType}
                targetId={selectedId}
            />
        </div>
    );
}