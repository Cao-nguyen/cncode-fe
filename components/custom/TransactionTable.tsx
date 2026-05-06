// components/custom/TransactionTable.tsx
'use client';

import React from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Transaction {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    time: string;
    method: string;
    amount: number;
    status: 'success' | 'pending' | 'failed';
}

interface TransactionTableProps {
    transactions: Transaction[];
    isLoading?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
    transactions,
    isLoading = false,
}) => {
    const getAmountColor = (amount: number) => {
        return amount > 0 ? 'text-green-600' : 'text-red-600';
    };

    const getAmountIcon = (amount: number) => {
        return amount > 0
            ? <ArrowUpCircle className="w-4 h-4 text-green-600" />
            : <ArrowDownCircle className="w-4 h-4 text-red-600" />;
    };

    const formatAmount = (amount: number) => {
        const sign = amount > 0 ? '+' : '';
        return `${sign}${amount.toLocaleString()}đ`;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-main border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Chưa có giao dịch nào</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
                <thead className="border-b border-gray-100">
                    <tr>
                        <th className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Giao dịch</th>
                        <th className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Thời gian</th>
                        <th className="text-left pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Phương thức</th>
                        <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Số tiền</th>
                        <th className="text-center pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {transactions.map((transaction, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4">
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">
                                        {transaction.title}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {transaction.subtitle}
                                    </p>
                                </div>
                            </td>
                            <td className="py-4">
                                <div>
                                    <p className="text-sm text-gray-600">{transaction.date}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{transaction.time}</p>
                                </div>
                            </td>
                            <td className="py-4">
                                <span className="text-sm text-gray-600">{transaction.method}</span>
                            </td>
                            <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                    {getAmountIcon(transaction.amount)}
                                    <span className={`text-sm font-medium ${getAmountColor(transaction.amount)}`}>
                                        {formatAmount(transaction.amount)}
                                    </span>
                                </div>
                            </td>
                            <td className="py-4 text-center">
                                <span className="inline-block px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                                    {transaction.status === 'success' ? 'Thành công' : transaction.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};