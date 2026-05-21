'use client';
import React, { useState, useEffect } from "react";
import { User, UserCheck, TrendingUp, Eye, Shield, X, Monitor, Smartphone } from "lucide-react";
import { useSocket } from "@/providers/socket.provider";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";

export default function Analytics() {
    const { onlineUsers, onlineStats } = useSocket();
    const { user } = useAuthStore();
    const [showPopup, setShowPopup] = useState(false);
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    return (
        <React.Fragment>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Khách online', value: onlineStats.guests, icon: User },
                    { label: 'User online', value: onlineStats.users, icon: UserCheck },
                    // ... các item khác
                ].map((item, idx) => (
                    <div key={idx}
                        onClick={() => item.label === 'User online' && isAdmin && setShowPopup(true)}
                        className="p-4 bg-white border rounded-lg flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">{item.label}</p>
                            <h4 className="text-lg font-bold">{item.value}</h4>
                        </div>
                        <item.icon className="text-blue-500" />
                    </div>
                ))}
            </div>

            {isAdmin && showPopup && (
                <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPopup(false)}>
                    <div className="bg-white rounded-xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold">DANH SÁCH ONLINE ({onlineUsers.length})</h3>
                            <X className="cursor-pointer" onClick={() => setShowPopup(false)} />
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {onlineUsers.map((u, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 border-b">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                                        {u.avatar ? <Image src={u.avatar} alt="" width={40} height={40} /> : u.fullName[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{u.fullName} <span className="text-[10px] bg-red-500 text-white px-1 rounded">{u.role}</span></p>
                                        <p className="text-xs text-gray-400">{u.device}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}