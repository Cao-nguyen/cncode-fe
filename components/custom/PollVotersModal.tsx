'use client';

import { useState, useRef } from 'react';
import { X, Users as UsersIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
    _id: string;
    fullName: string;
    avatar?: string;
}

interface PollVotersModalProps {
    question: string;
    options: Array<{
        text: string;
        votes: string[];
    }>;
    allParticipants: User[];
    voters: string[];
    onClose: () => void;
}

export function PollVotersModal({ question, options, allParticipants, voters, onClose }: PollVotersModalProps) {
    const [activeTab, setActiveTab] = useState(0);
    const tabsRef = useRef<HTMLDivElement>(null);

    // Get users who haven't voted
    const nonVoters = allParticipants.filter(p => !voters.includes(p._id));

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsRef.current) {
            const scrollAmount = 200;
            tabsRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Get user details for each option
    const optionsWithUsers = options.map(option => ({
        ...option,
        users: option.votes.map(userId =>
            allParticipants.find(p => p._id === userId)
        ).filter(Boolean) as User[]
    }));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
            <div className="bg-[var(--cn-bg-card)] rounded-xl shadow-2xl max-w-2xl w-full h-[600px] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[var(--cn-border)]">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-[var(--cn-text-main)]">Chi tiết bình chọn</h3>
                        <p className="text-sm text-[var(--cn-text-sub)] mt-1">{question}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex items-center border-b border-[var(--cn-border)] flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => scrollTabs('left')}
                        className="flex-shrink-0 h-full rounded-none border-r border-[var(--cn-border)] hover:bg-[var(--cn-bg-hover)]"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div ref={tabsRef} className="no-scrollbar flex overflow-x-auto flex-1">
                        {optionsWithUsers.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTab(index)}
                                className={`flex-1 min-w-[140px] px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === index
                                    ? 'text-[var(--cn-primary)]'
                                    : 'text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)]'
                                    }`}
                            >
                                {option.text} ({option.votes.length})
                                {activeTab === index && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--cn-primary)]" />
                                )}
                            </button>
                        ))}
                        <button
                            onClick={() => setActiveTab(options.length)}
                            className={`flex-1 min-w-[140px] px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === options.length
                                ? 'text-[var(--cn-primary)]'
                                : 'text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)]'
                                }`}
                        >
                            Chưa bình chọn ({nonVoters.length})
                            {activeTab === options.length && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--cn-primary)]" />
                            )}
                        </button>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => scrollTabs('right')}
                        className="flex-shrink-0 h-full rounded-none border-l border-[var(--cn-border)] hover:bg-[var(--cn-bg-hover)]"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab < options.length ? (
                        // Option voters
                        <div>
                            {optionsWithUsers[activeTab].users.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {optionsWithUsers[activeTab].users.map(user => (
                                        <div
                                            key={user._id}
                                            className="flex items-center gap-2 p-2"
                                        >
                                            <Avatar className="w-8 h-8 flex-shrink-0">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback className="text-xs font-medium">
                                                    {user.fullName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-[var(--cn-text-main)] truncate">
                                                    {user.fullName}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <UsersIcon className="w-12 h-12 mx-auto mb-3 text-[var(--cn-text-sub)] opacity-30" />
                                    <p className="text-[var(--cn-text-sub)]">
                                        Chưa có ai chọn lựa chọn này
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Non-voters
                        <div>
                            {nonVoters.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {nonVoters.map(user => (
                                        <div
                                            key={user._id}
                                            className="flex items-center gap-2 p-2"
                                        >
                                            <Avatar className="w-8 h-8 flex-shrink-0">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback className="text-xs font-medium">
                                                    {user.fullName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-[var(--cn-text-sub)] truncate">
                                                    {user.fullName}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <UsersIcon className="w-12 h-12 mx-auto mb-3 text-[var(--cn-primary)] opacity-30" />
                                    <p className="text-[var(--cn-text-main)] font-medium mb-1">
                                        Tuyệt vời! 🎉
                                    </p>
                                    <p className="text-[var(--cn-text-sub)] text-sm">
                                        Tất cả mọi người đã bình chọn
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}