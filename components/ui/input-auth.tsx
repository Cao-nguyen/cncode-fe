"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function InputAuth(
    { label, error, type, className = "", ...p }: {
        label: string;
        error?: string;
        type?: string;
        className?: string;
    } & React.InputHTMLAttributes<HTMLInputElement>
) {
    const [show, setShow] = useState(false);
    const pwd = type === "password";

    return (
        <div className="mb-3 w-full">
            <label className="block text-xs text-zinc-400 mb-1 ml-1">{label}</label>

            <div className="relative">
                <input
                    {...p}
                    type={pwd && show ? "text" : type}
                    className={`w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-sm text-white
                                focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all
                                ${error ? "border-red-500" : ""} ${className}`
                    }
                />

                {pwd && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    >
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}