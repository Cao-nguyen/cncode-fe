'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Key, Copy, RefreshCw, Code, Check } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CopyButton } from '@/components/common/CopyButton';
import { userApi } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth.store';

export function ApiKeySection() {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        fetchApiKey();
    }, [token]);

    const fetchApiKey = async () => {
        if (!token) return;
        try {
            const response = await userApi.getApiKey(token);
            if (response.success) {
                setApiKey(response.data.apiKey);
            }
        } catch (error) {
            console.error('Fetch API key error:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateNewKey = async () => {
        if (!token) return;
        setGenerating(true);
        try {
            const response = await userApi.generateApiKey(token);
            if (response.success) {
                setApiKey(response.data.apiKey);
                toast.success('Đã tạo API Key mới');
            } else {
                toast.error(response.message || 'Lỗi khi tạo API Key');
            }
        } catch (error) {
            console.error('Generate API key error:', error);
            toast.error('Lỗi khi tạo API Key');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Key size={18} className="text-[var(--cn-primary)]" />
                    API Key
                </h3>
                <CustomButton
                    onClick={generateNewKey}
                    variant="outline"
                    size="small"
                    loading={generating}
                    disabled={generating}
                >
                    <RefreshCw size={14} />
                    Tạo mới
                </CustomButton>
            </div>

            {apiKey ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Code size={16} className="text-gray-500 dark:text-gray-400 shrink-0" />
                        <code className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-mono truncate">
                            {apiKey}
                        </code>
                        <CopyButton text={apiKey} />
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        <p className="mb-2">Sử dụng API Key này để gọi API từ website khác:</p>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-3 overflow-x-auto">
                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">GET - Lấy danh sách link:</p>
                                <code className="block text-xs text-[var(--cn-primary)]">GET /api/rutgonlink/links?page=1&limit=20&search=keyword</code>
                            </div>

                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">GET Headers:</p>
                                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
{`X-API-Key: ${apiKey || 'your-api-key'}`}
                                </pre>
                            </div>

                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">GET Response:</p>
                                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
{`{
  "success": true,
  "data": [
    {
      "_id": "...",
      "originalUrl": "https://example.com",
      "shortCode": "abc123",
      "clickCount": 10,
      "expiresAt": "2024-12-31T23:59:00.000Z",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}`}
                                </pre>
                            </div>

                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">POST - Tạo link hàng loạt:</p>
                                <code className="block text-xs text-[var(--cn-primary)]">POST /api/rutgonlink/batch</code>
                            </div>

                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">POST Headers:</p>
                                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
{`Content-Type: application/json
X-API-Key: ${apiKey || 'your-api-key'}`}
                                </pre>
                            </div>

                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">POST Body:</p>
                                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
{`{
  "links": [
    {
      "originalUrl": "https://drive.google.com/file/d/xxx/view",
      "customAlias": "my-drive-link"
    },
    {
      "originalUrl": "https://docs.google.com/document/d/xxx/edit"
    }
  ],
  "expiresInHours": 24
}`}
                                </pre>
                            </div>

                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">POST Response:</p>
                                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
{`{
  "success": true,
  "created": 2,
  "failed": 0,
  "results": [
    {
      "originalUrl": "https://drive.google.com/...",
      "shortCode": "my-drive-link",
      "shortUrl": "https://cncode.io.vn/rutgonlink/my-drive-link",
      "expiresAt": "2024-12-31T23:59:00.000Z"
    }
  ],
  "errors": []
}`}
                                </pre>
                            </div>

                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Example cURL (POST):</p>
                                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
{`curl -X POST https://cncode.io.vn/api/rutgonlink/batch \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey || 'your-api-key'}" \\
  -d '{
    "links": [{"originalUrl": "https://example.com"}],
    "expiresInHours": 24
  }'`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Bạn chưa có API Key
                    </p>
                    <CustomButton
                        onClick={generateNewKey}
                        variant="primary"
                        size="small"
                        loading={generating}
                        disabled={generating}
                    >
                        <Key size={14} />
                        Tạo API Key
                    </CustomButton>
                </div>
            )}
        </div>
    );
}
