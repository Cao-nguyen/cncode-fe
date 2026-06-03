'use client';

import { useState } from 'react';
import { Check, Users, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PollVotersModal } from './PollVotersModal';

interface User {
    _id: string;
    fullName: string;
    avatar?: string;
}

interface PollOption {
    text: string;
    votes: string[]; // Array of user IDs who voted
}

interface PollData {
    question: string;
    options: PollOption[];
    allowMultiple: boolean;
    totalVotes: number;
    voters: string[]; // Array of user IDs who voted
}

interface PollDisplayProps {
    poll: PollData;
    currentUserId: string;
    allParticipants: User[];
    onVote: (optionIndices: number[]) => void;
    disabled?: boolean;
}

export function PollDisplay({ poll, currentUserId, allParticipants, onVote, disabled }: PollDisplayProps) {
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [showVotersModal, setShowVotersModal] = useState(false);
    const [isChangingVote, setIsChangingVote] = useState(false);
    const hasVoted = poll.voters.includes(currentUserId);

    const handleOptionClick = (index: number) => {
        if ((hasVoted && !isChangingVote) || disabled) return;

        if (poll.allowMultiple) {
            setSelectedOptions(prev =>
                prev.includes(index)
                    ? prev.filter(i => i !== index)
                    : [...prev, index]
            );
        } else {
            setSelectedOptions([index]);
        }
    };

    const handleSubmitVote = () => {
        if (selectedOptions.length === 0) return;
        onVote(selectedOptions);
        setSelectedOptions([]);
        setIsChangingVote(false);
    };

    const handleChangeVote = () => {
        // Pre-select current user's votes
        const currentVotes: number[] = [];
        poll.options.forEach((option, index) => {
            if (option.votes.includes(currentUserId)) {
                currentVotes.push(index);
            }
        });
        setSelectedOptions(currentVotes);
        setIsChangingVote(true);
    };

    const handleCancelChange = () => {
        setSelectedOptions([]);
        setIsChangingVote(false);
    };

    const getPercentage = (votes: number) => {
        if (poll.totalVotes === 0) return 0;
        return Math.round((votes / poll.totalVotes) * 100);
    };

    return (
        <>
            <div className="bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-lg p-4 w-[400px] max-w-full">
                {/* Question */}
                <h4 className="font-semibold text-[var(--cn-text-main)] mb-3">
                    {poll.question}
                </h4>

                {/* Options */}
                <div className="space-y-2 mb-3">
                    {poll.options.map((option, index) => {
                        const voteCount = option.votes.length;
                        const percentage = getPercentage(voteCount);
                        const isSelected = selectedOptions.includes(index);
                        const userVoted = option.votes.includes(currentUserId);

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(index)}
                                disabled={(hasVoted && !isChangingVote) || disabled}
                                className={`w-full text-left p-3 rounded-lg border transition relative overflow-hidden ${(hasVoted && !isChangingVote)
                                    ? 'cursor-default'
                                    : disabled
                                        ? 'cursor-not-allowed opacity-50'
                                        : 'cursor-pointer hover:border-[var(--cn-primary)]'
                                    } ${isSelected
                                        ? 'border-[var(--cn-primary)] bg-[var(--cn-primary-light)]'
                                        : 'border-[var(--cn-border)]'
                                    } ${userVoted && !isChangingVote
                                        ? 'border-[var(--cn-primary)] bg-[var(--cn-primary-light)]'
                                        : ''
                                    }`}
                            >
                                {/* Progress bar background */}
                                {hasVoted && !isChangingVote && (
                                    <div
                                        className="absolute inset-0 bg-[var(--cn-primary-light)] opacity-30 transition-all"
                                        style={{ width: `${percentage}%` }}
                                    />
                                )}

                                {/* Content */}
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                        {(!hasVoted || isChangingVote) && (
                                            <div
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                                                    ? 'border-[var(--cn-primary)] bg-[var(--cn-primary)]'
                                                    : 'border-gray-300'
                                                    }`}
                                            >
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        )}
                                        <span className="text-sm text-[var(--cn-text-main)]">
                                            {option.text}
                                        </span>
                                        {userVoted && !isChangingVote && (
                                            <Check className="w-4 h-4 text-[var(--cn-primary)] flex-shrink-0" />
                                        )}
                                    </div>
                                    {hasVoted && !isChangingVote && (
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-sm font-medium text-[var(--cn-text-main)]">
                                                {percentage}%
                                            </span>
                                            <span className="text-xs text-[var(--cn-text-sub)]">
                                                ({voteCount})
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--cn-border)]">
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-[var(--cn-text-sub)]">
                            {poll.totalVotes} {poll.totalVotes === 1 ? 'lượt bình chọn' : 'lượt bình chọn'}
                            {poll.allowMultiple && ' • Chọn nhiều đáp án'}
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowVotersModal(true)}
                            className="h-6 px-2 text-xs text-[var(--cn-primary)] hover:text-[var(--cn-primary-hover)] hover:bg-[var(--cn-primary-light)]"
                        >
                            <Users className="w-3 h-3 mr-1" />
                            Chi tiết
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasVoted && !isChangingVote && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleChangeVote}
                                disabled={disabled}
                                className="h-7 text-xs gap-1"
                            >
                                <Edit className="w-3 h-3" />
                                Thay đổi
                            </Button>
                        )}
                        {isChangingVote && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelChange}
                                    className="h-7 text-xs"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSubmitVote}
                                    disabled={disabled || selectedOptions.length === 0}
                                    className="bg-[var(--cn-primary)] hover:bg-[var(--cn-primary-hover)] h-7 text-xs"
                                >
                                    Cập nhật
                                </Button>
                            </>
                        )}
                        {!hasVoted && selectedOptions.length > 0 && (
                            <Button
                                size="sm"
                                onClick={handleSubmitVote}
                                disabled={disabled}
                                className="bg-[var(--cn-primary)] hover:bg-[var(--cn-primary-hover)] h-7 text-xs"
                            >
                                Bình chọn
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Voters Modal */}
            {showVotersModal && (
                <PollVotersModal
                    question={poll.question}
                    options={poll.options}
                    allParticipants={allParticipants}
                    voters={poll.voters}
                    onClose={() => setShowVotersModal(false)}
                />
            )}
        </>
    );
}