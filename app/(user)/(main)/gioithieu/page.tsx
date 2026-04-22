// app/(user)/(none)/gioithieu/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { systemSettingsApi } from '@/lib/api/system-settings.api';
import { Loader2 } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';

declare global {
    interface Window {
        MathJax: {
            typesetPromise: () => Promise<void>;
            startup: {
                promise: Promise<void>;
            };
        };
    }
}

export default function GioithieuPage() {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, []);

    useEffect(() => {
        if (content && !loading) {
            // Highlight code blocks
            setTimeout(() => {
                Prism.highlightAll();
            }, 100);

            // Load and render MathJax for math formulas
            if (typeof window !== 'undefined' && !window.MathJax) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
                script.async = true;
                script.onload = () => {
                    if (window.MathJax) {
                        window.MathJax.startup.promise.then(() => {
                            window.MathJax.typesetPromise();
                        });
                    }
                };
                document.head.appendChild(script);
            } else if (window.MathJax) {
                window.MathJax.typesetPromise();
            }
        }
    }, [content, loading]);

    const fetchContent = async () => {
        try {
            const result = await systemSettingsApi.getPublicContent('gioithieu');
            if (result.success) {
                setTitle(result.data.title);
                setContent(result.data.content);
            }
        } catch (error) {
            console.error('Failed to fetch content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-8 sm:py-10">
            <div className="container mx-auto px-4 sm:px-5 lg:px-10 max-w-5xl">
                <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div
                            dangerouslySetInnerHTML={{ __html: content }}
                            className="static-content"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}