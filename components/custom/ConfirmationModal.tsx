import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    warning?: string;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Xác nhận hủy',
    message = 'Bạn có chắc chắn muốn hủy thao tác này không?',
    warning = 'Dữ liệu đã nhập sẽ không được lưu lại.',
    confirmText = 'Xác nhận hủy',
    cancelText = 'Không, quay lại',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-slideUp">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-700 mb-2">{message}</p>
                    <p className="text-red-600 text-sm">{warning}</p>
                    <p className="text-xs text-gray-500 mt-3 italic">* Hành động này không thể hoàn tác.</p>
                </div>

                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};