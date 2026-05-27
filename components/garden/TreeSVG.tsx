'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface TreeSVGProps {
    stage: number;
    growth: number;
}

export const TreeSVG = ({ stage, growth }: TreeSVGProps) => {
    return (
        <div className="relative flex items-center justify-center min-h-[350px]">
            {}
            <div className="absolute w-64 h-64 bg-green-200/20 blur-[100px] rounded-full" />

            <svg width="300" height="350" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {}
                    <linearGradient id="trunk_grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4E342E" />
                        <stop offset="50%" stopColor="#6D4C41" />
                        <stop offset="100%" stopColor="#3E2723" />
                    </linearGradient>

                    {}
                    <linearGradient id="leaf_grad_dark" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2E7D32" />
                        <stop offset="100%" stopColor="#1B5E20" />
                    </linearGradient>

                    {}
                    <linearGradient id="leaf_grad_light" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#81C784" />
                        <stop offset="100%" stopColor="#4CAF50" />
                    </linearGradient>
                </defs>

                {}
                <ellipse cx="100" cy="215" rx="60" ry="15" fill="#EEEEEE" opacity="0.5" />
                <path d="M40 215C40 205 160 205 160 215C160 225 100 235 40 215Z" fill="#A5D6A7" />
                <path d="M55 218C70 225 130 225 145 218" stroke="#81C784" strokeWidth="2" strokeLinecap="round" />

                {}
                <AnimatePresence mode="wait">
                    <motion.g
                        key={stage}
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.6, type: 'spring' }}
                    >
                        {}
                        {stage === 1 && (
                            <g transform="translate(100, 215)">
                                {}
                                <path d="M0 0C-2 -15 -5 -25 -2 -40" stroke="url(#trunk_grad)" strokeWidth="4" strokeLinecap="round" />
                                {}
                                <path d="M-2 -40C-15 -45 -20 -30 -2 -40Z" fill="#81C784" />
                                <path d="M-2 -40C12 -55 25 -40 -2 -40Z" fill="#A5D6A7" />
                            </g>
                        )}

                        {}
                        {stage === 2 && (
                            <g transform="translate(100, 215)">
                                {}
                                <path d="M-4 0C-4 -20 -2 -50 0 -80L4 -80C6 -50 4 -20 4 0H-4Z" fill="url(#trunk_grad)" />
                                {}
                                <path d="M0 -105C-25 -105 -40 -85 -35 -65C-30 -50 -10 -45 0 -45C15 -45 35 -55 35 -75C35 -95 20 -105 0 -105Z" fill="url(#leaf_grad_dark)" />
                                <path d="M-5 -110C-20 -110 -30 -95 -25 -85C-15 -75 5 -75 5 -75C15 -75 25 -85 25 -95C25 -105 10 -110 -5 -110Z" fill="url(#leaf_grad_light)" />
                            </g>
                        )}

                        {}
                        {stage >= 3 && (
                            <g transform="translate(100, 215)">
                                {}
                                <path d="M-8 0C-8 -30 -4 -70 2 -110H-4C-10 -70 -12 -30 -12 0H-8Z" fill="url(#trunk_grad)" />
                                {}
                                <path d="M0 -60C15 -70 25 -85 35 -100" stroke="url(#trunk_grad)" strokeWidth="6" strokeLinecap="round" />
                                {}
                                <path d="M-8 -40C-20 -50 -35 -55 -45 -65" stroke="url(#trunk_grad)" strokeWidth="4" strokeLinecap="round" />

                                {}
                                <path d="M-60 -100C-85 -100 -95 -70 -70 -55C-50 -45 -20 -50 0 -50C25 -50 60 -45 75 -65C90 -90 70 -115 40 -115C30 -135 -10 -140 -30 -130C-50 -120 -60 -110 -60 -100Z" fill="url(#leaf_grad_dark)" />

                                {}
                                <path d="M-40 -130C-60 -130 -70 -110 -60 -95C-50 -85 -20 -90 0 -90C20 -90 45 -85 55 -105C65 -130 40 -145 10 -145C0 -160 -30 -155 -40 -130Z" fill="url(#leaf_grad_light)" />

                                {}
                                <motion.circle animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} cx="40" cy="-80" r="2" fill="white" />
                                <motion.circle animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.7 }} cx="-30" cy="-110" r="2" fill="white" />
                                <motion.circle animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 1.3 }} cx="10" cy="-135" r="2" fill="white" />
                            </g>
                        )}
                    </motion.g>
                </AnimatePresence>
            </svg>

            {}
            <div className="absolute bottom-4 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Evolution</span>
                    <div className="h-[1px] w-8 bg-gray-200" />
                    <span className="text-xs font-serif italic text-green-700">Stage {stage}</span>
                </div>

                {}
                <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${growth}%` }}
                        className="h-full bg-gradient-to-r from-green-300 to-green-600 rounded-full"
                    />
                </div>
                <span className="mt-2 text-[9px] font-medium text-gray-400 tracking-widest">{growth}% GROWING</span>
            </div>
        </div>
    );
};
