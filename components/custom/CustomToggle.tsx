import React from 'react';

type ToggleColor = 'default' | 'success' | 'warning' | 'error';

interface CustomToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    color?: ToggleColor;
    status?: 'default' | 'hover' | 'active' | 'disabled';
}

export const CustomToggle: React.FC<CustomToggleProps> = ({
    checked,
    onChange,
    label,
    disabled = false,
    color = 'default',
    status = 'default',
}) => {
    const colors = {
        default: {
            on: 'bg-[var(--cn-primary)]',
            off: 'bg-[var(--cn-border)]',
        },
        success: {
            on: 'bg-[var(--cn-success)]',
            off: 'bg-[var(--cn-border)]',
        },
        warning: {
            on: 'bg-[var(--cn-warning)]',
            off: 'bg-[var(--cn-border)]',
        },
        error: {
            on: 'bg-[var(--cn-error)]',
            off: 'bg-[var(--cn-border)]',
        },
    };

    const getColorClasses = () => {
        if (disabled || status === 'disabled') return 'bg-[var(--cn-text-muted)] cursor-not-allowed';
        if (status === 'hover' && !checked) return 'bg-[var(--cn-text-muted)]/50';
        if (status === 'active') return colors[color].on;
        return checked ? colors[color].on : colors[color].off;
    };

    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={() => !disabled && status !== 'disabled' && onChange(!checked)}
                disabled={disabled || status === 'disabled'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${disabled || status === 'disabled'
                    ? 'focus:ring-[var(--cn-text-muted)]'
                    : `focus:ring-[var(--cn-${color === 'default' ? 'primary' : color})]`
                    } ${getColorClasses()}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-[var(--cn-text-white)] transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
            {label && (
                <span className={`text-sm ${disabled ? 'text-[var(--cn-text-muted)]' : 'text-[var(--cn-text-sub)]'}`}>
                    {label}
                </span>
            )}
        </div>
    );
};