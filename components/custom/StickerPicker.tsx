'use client';

import { useState } from 'react';
import { X, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Sticker {
    id: string;
    url: string;
}

interface StickerCategory {
    id: string;
    name: string;
    emoji: string;
    stickers: Sticker[];
}

interface StickerPickerProps {
    onSelect: (stickerUrl: string) => void;
    onClose: () => void;
}

export function StickerPicker({ onSelect, onClose }: StickerPickerProps) {
    // LINE Sticker packages based on official documentation
    const lineStickerPackages: StickerCategory[] = [
        {
            id: '1',
            name: 'Happy',
            emoji: '😊',
            stickers: Array.from({ length: 17 }, (_, i) => ({
                id: `1-${i + 1}`,
                url: `https://stickershop.line-scdn.net/stickershop/v1/sticker/${i + 1}/android/sticker.png`
            }))
        },
        {
            id: '2',
            name: 'Love',
            emoji: '❤️',
            stickers: Array.from({ length: 15 }, (_, i) => ({
                id: `2-${i + 1}`,
                url: `https://stickershop.line-scdn.net/stickershop/v1/sticker/${i + 18}/android/sticker.png`
            }))
        },
        {
            id: '3',
            name: 'Cute',
            emoji: '🥰',
            stickers: Array.from({ length: 20 }, (_, i) => ({
                id: `3-${i + 1}`,
                url: `https://stickershop.line-scdn.net/stickershop/v1/sticker/${i + 58}/android/sticker.png`
            }))
        },
        {
            id: '4',
            name: 'Cool',
            emoji: '😎',
            stickers: Array.from({ length: 12 }, (_, i) => ({
                id: `4-${i + 1}`,
                url: `https://stickershop.line-scdn.net/stickershop/v1/sticker/${i + 98}/android/sticker.png`
            }))
        },
        {
            id: '5',
            name: 'Funny',
            emoji: '😂',
            stickers: Array.from({ length: 18 }, (_, i) => ({
                id: `5-${i + 1}`,
                url: `https://stickershop.line-scdn.net/stickershop/v1/sticker/${i + 138}/android/sticker.png`
            }))
        },
        {
            id: '6',
            name: 'Surprised',
            emoji: '😲',
            stickers: Array.from({ length: 14 }, (_, i) => ({
                id: `6-${i + 1}`,
                url: `https://stickershop.line-scdn.net/stickershop/v1/sticker/${i + 178}/android/sticker.png`
            }))
        },
        {
            id: '7',
            name: 'Sad',
            emoji: '😢',
            stickers: Array.from({ length: 16 }, (_, i) => ({
                id: `7-${i + 1}`,
                url: `https://stickershop.line-scdn.net/stickershop/v1/sticker/${i + 218}/android/sticker.png`
            }))
        },
        {
            id: '8',
            name: 'Party',
            emoji: '🎉',
            stickers: Array.from({ length: 10 }, (_, i) => ({
                id: `8-${i + 1}`,
                url: `https://stickershop.line-scdn.net/stickershop/v1/sticker/${i + 258}/android/sticker.png`
            }))
        }
    ];

    const [categories] = useState<StickerCategory[]>(lineStickerPackages);
    const [selectedCategory, setSelectedCategory] = useState<string>(lineStickerPackages[0]?.id || '');
    const [searchQuery, setSearchQuery] = useState('');

    const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

    return (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Chọn sticker</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Thể hiện cảm xúc của bạn</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-9 w-9 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex h-[480px]">
                {/* Sidebar - Categories */}
                <div className="w-72 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Tìm sticker..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    {/* Category List */}
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${selectedCategory === category.id
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                                        : 'hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <span className="text-2xl">{category.emoji}</span>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-sm">{category.name}</div>
                                        <div className={`text-xs ${selectedCategory === category.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {category.stickers.length} sticker
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Footer suggestion */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
                        <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-gray-900 dark:text-white">Thích sticker này?</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Gửi ngay cho bạn bè!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Stickers Grid */}
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
                    {/* Category Header */}
                    <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{selectedCategoryData?.emoji}</span>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{selectedCategoryData?.name}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg"
                                    title="Xem dạng lưới"
                                >
                                    <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                                        <div className="bg-current rounded-sm"></div>
                                        <div className="bg-current rounded-sm"></div>
                                        <div className="bg-current rounded-sm"></div>
                                        <div className="bg-current rounded-sm"></div>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stickers Grid */}
                    <ScrollArea className="flex-1">
                        <div className="grid grid-cols-6 gap-1 p-3">
                            {selectedCategoryData?.stickers.map((sticker) => (
                                <button
                                    key={sticker.id}
                                    onClick={async () => {
                                        await onSelect(sticker.url);
                                        setTimeout(() => onClose(), 100);
                                    }}
                                    className="aspect-square rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 p-2 transition-all duration-200 hover:scale-110 active:scale-95 group relative"
                                >
                                    <img
                                        src={sticker.url}
                                        alt="Sticker"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="40" fill="%23e5e7eb"/%3E%3Ctext x="50" y="60" font-size="40" text-anchor="middle" fill="%239ca3af"%3E😊%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                    <div className="absolute inset-0 rounded-xl border-2 border-blue-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Bottom Info */}
                    <div className="px-5 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                                Click vào sticker để gửi
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">
                                Powered by LINE
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}