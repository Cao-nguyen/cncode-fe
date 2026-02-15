"use client"

import Sidebar from '@/components/layouts/sidebar'
import NavAdmin from '@/components/layouts/nav-admin'
import { Providers } from '@/context/providers'
import { useState } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
            <AdminLayoutUI>
                {children}
            </AdminLayoutUI>
        </Providers>
    )
}



function AdminLayoutUI({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="relative overflow-x-hidden h-screen">
            <Sidebar open={open} />

            <div className={`transition-all duration-300 ${open ? 'ml-0 w-full' : 'ml-[17%] w-[83%]'}`}>
                <div className="m-[10px] rounded-[20px] h-[calc(100vh-20px)] bg-[#EEEEEE] dark:bg-[#171717] p-[10px]">
                    <NavAdmin setOpen={setOpen} open={open} />
                    <div className="m-[10px_0px] h-[0.5px] w-full bg-black/20 dark:bg-white/30"></div>
                    {children}
                </div>
            </div>
        </div>
    )
}