export default function ButtonIcon({ ...props }) {
    return (
        <button
            className="
                w-full 
                max-w-sm 
                mt-[10px] 
                p-[10px_15px] 
                bg-white 
                text-black 
                font-bold 
                rounded-[10px] 
                hover:bg-white/90 
                transition-colors 
                duration-300
                flex 
                items-center 
                justify-center
                gap-5
            "
        >
            {props.children}
        </button>
    )
}