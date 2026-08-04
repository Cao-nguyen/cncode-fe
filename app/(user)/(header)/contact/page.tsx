'use client';

import { useState } from 'react';
import { Search, Users, UserPlus, UserCheck, Menu, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Friend {
    _id: string;
    fullName: string;
    avatar?: string;
}

// Data giả
const mockFriends: Friend[] = [
    { _id: '1', fullName: 'Thành An', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1' },
    { _id: '2', fullName: 'Minh An', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2' },
    { _id: '3', fullName: 'Liên Bình', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3' },
    { _id: '4', fullName: 'Cao Cường', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4' },
    { _id: '5', fullName: 'Đức Duy', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5' },
    { _id: '6', fullName: 'Giang Hà', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user6' },
    { _id: '7', fullName: 'Hoàng Hùng', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user7' },
    { _id: '8', fullName: 'Khánh Linh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user8' },
    { _id: '9', fullName: 'Lâm Minh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user9' },
    { _id: '10', fullName: 'Nam Nguyên', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user10' },
    { _id: '11', fullName: 'Phương Phương', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user11' },
    { _id: '12', fullName: 'Quốc Quân', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user12' },
];

type TabType = 'friends' | 'groups' | 'requests';

export default function ContactPage() {
    const [friends, setFriends] = useState<Friend[]>(mockFriends);
    const [activeTab, setActiveTab] = useState<TabType>('friends');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showSidebar, setShowSidebar] = useState(true);

    const handleTabClick = (tab: TabType) => {
        setActiveTab(tab);
        // On mobile, hide sidebar when a tab is selected
        if (window.innerWidth < 768) {
            setShowSidebar(false);
        }
    };

    const filteredFriends = friends.filter(friend =>
        friend.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedFriends = [...filteredFriends].sort((a, b) => {
        const comparison = a.fullName.localeCompare(b.fullName, 'vi');
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Group by first letter
    const groupedFriends = sortedFriends.reduce((acc, friend) => {
        const firstLetter = friend.fullName.charAt(0).toUpperCase();
        if (!acc[firstLetter]) {
            acc[firstLetter] = [];
        }
        acc[firstLetter].push(friend);
        return acc;
    }, {} as Record<string, Friend[]>);

    return (
        <div className="flex bg-gray-100 h-[calc(100vh-100px)] md:h-[calc(100vh-65px)]">
            {/* Sidebar - Navigation */}
            <div className={`${showSidebar ? 'w-full md:w-64' : 'w-0'} border-r bg-white flex flex-col py-4 gap-2 pl-4 md:pl-7 pr-3 transition-all duration-300 overflow-hidden md:overflow-visible ${!showSidebar ? 'hidden md:flex' : ''}`}>
                <Button
                    variant="ghost"
                    className={`flex items-center gap-3 h-auto py-3 px-4 justify-start ${activeTab === 'friends' ? 'bg-gray-200' : ''}`}
                    onClick={() => handleTabClick('friends')}
                >
                    <Users className="h-5 w-5" />
                    <span>Danh sách bạn bè</span>
                </Button>
                <Button
                    variant="ghost"
                    className={`flex items-center gap-3 h-auto py-3 px-4 justify-start ${activeTab === 'groups' ? 'bg-gray-200' : ''}`}
                    onClick={() => handleTabClick('groups')}
                >
                    <Users className="h-5 w-5" />
                    <span>Danh sách nhóm</span>
                </Button>
                <Button
                    variant="ghost"
                    className={`flex items-center gap-3 h-auto py-3 px-4 justify-start ${activeTab === 'requests' ? 'bg-gray-200' : ''}`}
                    onClick={() => handleTabClick('requests')}
                >
                    <UserCheck className="h-5 w-5" />
                    <span>Lời mời kết bạn</span>
                </Button>
            </div>

            {/* Main Content */}
            <div className={`${showSidebar ? 'hidden' : 'flex'} md:flex flex-1 bg-white flex flex-col`}>
                {/* Mobile Header */}
                <div className="md:hidden p-4 border-b flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSidebar(!showSidebar)}
                    >
                        {showSidebar ? <ArrowLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                    <h1 className="text-lg font-bold">Danh bạ</h1>
                </div>
                {activeTab === 'friends' && (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b md:p-4 p-2">
                            <h1 className="text-xl font-bold mb-4">Bạn bè ({filteredFriends.length})</h1>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Tìm kiếm..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                >
                                    {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                                </Button>
                            </div>
                        </div>

                        {/* Friend List */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-4 p-0">
                            {Object.keys(groupedFriends).sort().map((letter) => (
                                <div key={letter} className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-700 mb-3">{letter}</h3>
                                    {groupedFriends[letter].map((friend) => (
                                        <div
                                            key={friend._id}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={friend.avatar} />
                                                <AvatarFallback>{friend.fullName[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{friend.fullName}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {filteredFriends.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <p>Không tìm thấy bạn bè</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'groups' && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p>Danh sách nhóm</p>
                        </div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <UserCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p>Lời mời kết bạn</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
