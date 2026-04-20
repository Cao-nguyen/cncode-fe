import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Đổi tên hàm từ "middleware" thành "proxy"
export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // ... toàn bộ logic xử lý short link của bạn giữ nguyên
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

// Cấu hình matcher vẫn giữ nguyên
export const config = {
    matcher: '/((?!api|_next|favicon.ico|images).*)',
};