export default function Button({ ...props }) {
    return (
        <button className="w-full max-w-sm mt-[10px] p-[10px_15px] bg-blue-500 text-white font-bold rounded-[10px] hover:bg-blue-600 transition-colors duration-300">
            {props.children}
        </button>
    )
}