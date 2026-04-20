import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    if (path.startsWith('/lk/')) {
        const slug = path.replace('/lk/', '');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        try {
            const res = await fetch(`${apiUrl}/shortlink/lk/${slug}`, { redirect: 'manual' });
            if (res.status === 302) {
                const location = res.headers.get('location');
                if (location) return NextResponse.redirect(location);
            }
        } catch { }

        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
};