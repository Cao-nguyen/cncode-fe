import { useState } from "react"
import { EyeIcon, EyeOffIcon } from 'lucide-react'

export default function InputPassword({ ...props }) {
    const [show, setShow] = useState(false)

    return (
        <div className="relative mt-[10px]">
            <input
                type={show ? "text" : "password"}
                {...props}
                className="w-full p-[10px_15px] rounded-[10px] text-black outline-none"
            />

            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
            >
                {show ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
        </div>
    )
}