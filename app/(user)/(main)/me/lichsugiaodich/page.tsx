'use client';

import { useState, useEffect } from 'react';
import { ReceiptText, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { useSocket } from '@/providers/socket.provider';

interface Transaction {
    _id: string;
    type: 'credit' | 'debit';
    amount: number;
    reason: string;
    balanceAfter: number;
    createdAt: string;
    relatedId?: string;
    relatedType?: string;
}

interface EnrollmentTransaction {
    _id: string;
    paymentMethod: 'payos' | 'coin' | 'free';
    paymentStatus: 'pending' | 'completed';
    orderCode?: number;
    enrolledAt: string;
    createdAt: string;
    course: {
        _id: string;
        title: string;
        thumbnail?: string;
        price: number;
        discountPrice?: number;
    };
}

export default function TransactionHistory() {
    const [coinTransactions, setCoinTransactions] = useState<Transaction[]>([]);
    const [enrollmentTransactions, setEnrollmentTransactions] = useState<EnrollmentTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'coins' | 'enrollments'>('all');
    const { socket } = useSocket();

    useEffect(() => {
        loadTransactions();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewCoinTransaction = (data: { transaction: Transaction; currentBalance: number }) => {
            console.log('[TransactionHistory] New coin transaction:', data);
            setCoinTransactions(prev => [data.transaction, ...prev]);
        };

        const handleEnrollmentUpdated = (data: { enrollmentId: string; status: string }) => {
            console.log('[TransactionHistory] Enrollment updated:', data);
            // Reload enrollment transactions when enrollment status changes
            loadTransactions();
        };

        socket.on('new_coin_transaction', handleNewCoinTransaction);
        socket.on('enrollment_updated', handleEnrollmentUpdated);

        return () => {
            socket.off('new_coin_transaction', handleNewCoinTransaction);
            socket.off('enrollment_updated', handleEnrollmentUpdated);
        };
    }, [socket]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Load coin transactions
            const coinRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coins/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const coinData = await coinRes.json();
            if (coinData.success) {
                setCoinTransactions(coinData.data || []);
            }

            // Load enrollment transactions
            const enrollRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enrollment/me/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const enrollData = await enrollRes.json();
            if (enrollData.success) {
                setEnrollmentTransactions(enrollData.data || []);
            }
        } catch (error) {
            console.error('Failed to load transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const allTransactions = [
        ...coinTransactions.map(t => ({ ...t, transactionType: 'coin' as const })),
        ...enrollmentTransactions.map(t => ({ ...t, transactionType: 'enrollment' as const }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const filteredTransactions = activeTab === 'all' 
        ? allTransactions 
        : activeTab === 'coins' 
            ? coinTransactions.map(t => ({ ...t, transactionType: 'coin' as const }))
            : enrollmentTransactions.map(t => ({ ...t, transactionType: 'enrollment' as const }));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (allTransactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-white p-6 rounded-full shadow-sm border border-gray-100">
                        <ReceiptText size={48} className="text-gray-400" strokeWidth={1.5} />
                    </div>
                </div>
                <div className="text-center max-w-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Chưa có giao dịch nào
                    </h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Có vẻ như bạn chưa thực hiện giao dịch nào trong khoảng thời gian này.
                        Các giao dịch mới sẽ được hiển thị tại đây.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử giao dịch</h1>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-200">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            activeTab === 'all' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => setActiveTab('coins')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            activeTab === 'coins' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Xu
                    </button>
                    <button
                        onClick={() => setActiveTab('enrollments')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            activeTab === 'enrollments' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Đăng ký khóa học
                    </button>
                </div>

                {/* Transaction List */}
                <div className="space-y-3">
                    {filteredTransactions.map((transaction: any) => {
                        if (transaction.transactionType === 'coin') {
                            const isCredit = transaction.type === 'credit';
                            return (
                                <div key={transaction._id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${
                                                isCredit ? 'bg-green-100' : 'bg-red-100'
                                            }`}>
                                                {isCredit ? (
                                                    <ArrowUpCircle className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <ArrowDownCircle className="w-5 h-5 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{transaction.reason}</p>
                                                <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                                {isCredit ? '+' : '-'}{transaction.amount} xu
                                            </p>
                                            <p className="text-sm text-gray-500">Số dư: {transaction.balanceAfter} xu</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        } else {
                            const isPayOS = transaction.paymentMethod === 'payos';
                            const isCompleted = transaction.paymentStatus === 'completed';
                            const price = transaction.course?.discountPrice || transaction.course?.price || 0;
                            return (
                                <div key={transaction._id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${
                                                isPayOS ? 'bg-blue-100' : 'bg-purple-100'
                                            }`}>
                                                <ReceiptText className={`w-5 h-5 ${isPayOS ? 'text-blue-600' : 'text-purple-600'}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{transaction.course?.title || 'Khóa học'}</p>
                                                <p className="text-sm text-gray-500">
                                                    {isPayOS ? 'Chuyển khoản PayOS' : transaction.paymentMethod === 'coin' ? 'Thanh toán bằng xu' : 'Miễn phí'}
                                                    {transaction.orderCode && ` • Mã: ${transaction.orderCode}`}
                                                </p>
                                                <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {isCompleted ? 'Hoàn thành' : 'Đang xử lý'}
                                            </p>
                                            {isPayOS && isCompleted && (
                                                <p className="text-sm text-gray-500">{price.toLocaleString()} VNĐ</p>
                                            )}
                                            {transaction.paymentMethod === 'coin' && isCompleted && (
                                                <p className="text-sm text-gray-500">{price} xu</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
}
