import Sidebar from '@/components/admin/sidebar'
import NavAdmin from '@/components/admin/nav-admin'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="grid grid-cols-[20%_80%] min-h-screen">
            <Sidebar />
            <div className="flex justify-center items-center">
                <div className="p-[10px] w-[98%] h-[96%] rounded-[15px] dark:bg-[#171717] bg-[#EEEEEE]">
                    <NavAdmin />
                    <div className="m-[10px_0px] h-[0.5px] w-full bg-black/20 dark:bg-white/30"></div>
                    {children}
                </div>
            </div>
        </div>
    )
}
