"use client"

import NotFoundAdmin from "./admin/not-found";
import NotFoundUser from "./(user)/not-found";
import { usePathname } from "next/navigation";

export default function NotFound() {
    const pathname = usePathname().split("/")[1]

    return (
        <>
            {pathname === "admin"
                ? <NotFoundAdmin />
                : <NotFoundUser />
            }
        </>
    )
}