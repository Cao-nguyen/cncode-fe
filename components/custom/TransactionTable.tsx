import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, CreditCard, Gift, Wallet } from 'lucide-react';

interface Transaction {
    id: string;
    description: string;
    time: string;
    method: string;
    amount: number;
    status: 'success' | 'pending' | 'failed';
}

interface TransactionTableProps {
    transactions: Transaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
    const getMethodIcon = (method: string) => {
        switch (method.toLowerCase()) {
            case 'momo':
                return <CreditCard className="w-4 h-4" />;
            case 'voucher':
                return <Gift className="w-4 h-4" />;
            default:
                return <Wallet className="w-4 h-4" />;
        }
    };

    const getAmountColor = (amount: number) => {
        return amount > 0 ? 'text-green-600' : 'text-red-600';
    };

    const formatAmount = (amount: number) => {
        const sign = amount > 0 ? '+' : '';
        return `${sign}${amount.toLocaleString()}đ`;
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giao dịch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phương thức</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                                    <p className="text-xs text-gray-500">{transaction.id}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {transaction.time}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    {getMethodIcon(transaction.method)}
                                    <span className="text-sm text-gray-700">{transaction.method}</span>
                                </div>
                            </td>
                            <td className={`px-6 py-4 text-right text-sm font-medium ${getAmountColor(transaction.amount)} whitespace-nowrap`}>
                                {formatAmount(transaction.amount)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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