'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Key, Copy, RefreshCw, Code, Check, ChevronDown, ChevronRight, Globe, Bot } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CopyButton } from '@/components/common/CopyButton';
import { userApi } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth.store';

type TabType = 'basic' | 'web' | 'zalo';

export function ApiKeySection() {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('basic');
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

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('basic')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'basic'
                                    ? 'text-[var(--cn-primary)] border-b-2 border-[var(--cn-primary)]'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Cơ bản
                        </button>
                        <button
                            onClick={() => setActiveTab('web')}
                            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                                activeTab === 'web'
                                    ? 'text-[var(--cn-primary)] border-b-2 border-[var(--cn-primary)]'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <Globe size={14} />
                            Website
                        </button>
                        <button
                            onClick={() => setActiveTab('zalo')}
                            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                                activeTab === 'zalo'
                                    ? 'text-[var(--cn-primary)] border-b-2 border-[var(--cn-primary)]'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <Bot size={14} />
                            Bot Zalo
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                        {activeTab === 'basic' && (
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">📌 Cách sử dụng API Key</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                        Thêm API Key vào URL với tham số <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">?apiKey=xxx</code>
                                    </p>
                                </div>

                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">🔗 Endpoint cơ bản</p>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lấy danh sách link:</p>
                                            <code className="block text-xs text-[var(--cn-primary)] bg-white dark:bg-gray-900 p-2 rounded">
                                                GET https://api.cncode.io.vn/api/rutgonlink/links?apiKey={apiKey}
                                            </code>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tạo link mới:</p>
                                            <code className="block text-xs text-[var(--cn-primary)] bg-white dark:bg-gray-900 p-2 rounded">
                                                POST https://api.cncode.io.vn/api/rutgonlink/batch?apiKey={apiKey}
                                            </code>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">📦 Body mẫu (POST)</p>
                                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-white dark:bg-gray-900 p-3 rounded">
{`{
  "links": [
    {
      "originalUrl": "https://example.com",
      "customAlias": "my-link"
    }
  ],
  "expiresInHours": 24
}`}
                                    </pre>
                                </div>

                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">✅ Response mẫu</p>
                                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-white dark:bg-gray-900 p-3 rounded">
{`{
  "success": true,
  "created": 1,
  "failed": 0,
  "results": [
    {
      "shortUrl": "https://cncode.io.vn/s/my-link"
    }
  ]
}`}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {activeTab === 'web' && (
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">📱 Bước 1: Copy API Key</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Copy API Key ở trên và lưu vào biến trong code của bạn
                                    </p>
                                </div>

                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">📝 Bước 2: Tạo function rút gọn link</p>
                                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-white dark:bg-gray-900 p-3 rounded">
{`// Thay YOUR_API_KEY bằng API Key của bạn
const API_KEY = '${apiKey}';

async function createShortLink(url, alias, hours = 24) {
  try {
    const response = await fetch(
      'https://api.cncode.io.vn/api/rutgonlink/batch?apiKey=' + API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          links: [{ originalUrl: url, customAlias: alias }],
          expiresInHours: hours
        })
      }
    );
    const data = await response.json();
    if (data.success) {
      return data.results[0].shortUrl;
    } else {
      throw new Error(data.message || 'Lỗi không xác định');
    }
  } catch (error) {
    console.error('Lỗi:', error);
    throw error;
  }
}`}
                                    </pre>
                                </div>

                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">🚀 Bước 3: Sử dụng function</p>
                                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-white dark:bg-gray-900 p-3 rounded">
{`// Tạo link rút gọn
const shortUrl = await createShortLink(
  'https://example.com/very-long-url',
  'my-custom-alias',
  24  // hết hạn sau 24 giờ
);

console.log('Link rút gọn:', shortUrl);
// Output: https://cncode.io.vn/rutgonlink/my-custom-alias`}
                                    </pre>
                                </div>

                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">💡 Bước 4: Tích hợp vào form</p>
                                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-white dark:bg-gray-900 p-3 rounded">
{`// Trong form submit handler
document.getElementById('myForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('urlInput').value;
  
  try {
    const shortUrl = await createShortLink(url);
    alert('Link rút gọn: ' + shortUrl);
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
});`}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {activeTab === 'zalo' && (
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">📦 Bước 1: Cài đặt axios</p>
                                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-white dark:bg-gray-900 p-3 rounded">
{`npm install axios`}
                                    </pre>
                                </div>

                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">📝 Bước 2: Tạo function rút gọn link</p>
                                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-white dark:bg-gray-900 p-3 rounded">
{`const axios = require('axios');

// Thay YOUR_API_KEY bằng API Key của bạn
const API_KEY = '${apiKey}';

async function createShortLink(url, alias, hours = 24) {
  try {
    const response = await axios.post(
      'https://api.cncode.io.vn/api/rutgonlink/batch',
      {
        links: [{ originalUrl: url, customAlias: alias }],
        expiresInHours: hours
      },
      {
        params: { apiKey: API_KEY }
      }
    );
    
    if (response.data.success) {
      return response.data.results[0].shortUrl;
    } else {
      throw new Error(response.data.message || 'Lỗi không xác định');
    }
  } catch (error) {
    console.error('Lỗi:', error.response?.data || error.message);
    throw error;
  }
}`}
                                    </pre>
                                </div>

                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">🤖 Bước 3: Tích hợp vào Bot Zalo</p>
                                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-white dark:bg-gray-900 p-3 rounded">
{`// Trong handler của bot Zalo
async function handleMessage(userMessage, senderId) {
  // Kiểm tra nếu user gửi link
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = userMessage.match(urlRegex);
  
  if (urls && urls.length > 0) {
    try {
      // Rút gọn link đầu tiên
      const shortUrl = await createShortLink(urls[0]);
      
      // Gửi link rút gọn cho user
      await sendZaloMessage(senderId, 
        'Link rút gọn của bạn: ' + shortUrl
      );
    } catch (error) {
      await sendZaloMessage(senderId, 
        'Lỗi khi rút gọn link: ' + error.message
      );
    }
  } else {
    // Xử lý message bình thường
    await sendZaloMessage(senderId, 'Vui lòng gửi link để rút gọn');
  }
}`}
                                    </pre>
                                </div>

                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">📋 Bước 4: Batch rút gọn nhiều link</p>
                                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-white dark:bg-gray-900 p-3 rounded">
{`// Rút gọn nhiều link cùng lúc
async function batchShortenLinks(urls) {
  const links = urls.map((url, index) => ({
    originalUrl: url,
    customAlias: 'link-' + index
  }));
  
  const response = await axios.post(
    'https://api.cncode.io.vn/api/rutgonlink/batch',
    { links, expiresInHours: 24 },
    { params: { apiKey: API_KEY } }
  );
  
  return response.data.results;
}

// Sử dụng
const urls = [
  'https://example.com/1',
  'https://example.com/2',
  'https://example.com/3'
];
const results = await batchShortenLinks(urls);
console.log(results);`}
                                    </pre>
                                </div>
                            </div>
                        )}
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
