"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    showCloseButton?: boolean;
}

const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
};

export default function Modal({ isOpen, onClose, title, children, size = "md", showCloseButton = true }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className={`relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full mx-4 ${sizeClasses[size]} z-10`}>
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        {title && <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>}
                        {showCloseButton && (
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}