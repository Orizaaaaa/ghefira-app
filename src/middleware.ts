// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('token')?.value;

    // Skip middleware untuk file static, API routes, dan halaman login
    if (pathname.startsWith('/_next/') ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/static/') ||
        pathname.includes('.') ||
        pathname === '/') {
        return NextResponse.next();
    }

    // Jika tidak ada token, redirect ke login
    if (!token) {
        console.log('No token found, redirecting to login');
        const url = req.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // Cek sederhana apakah token ada (tanpa verifikasi JWT)
    // Jika hanya perlu memastikan token exists, tidak perlu verify signature
    if (token) {
        console.log('Token found, allowing access');
        return NextResponse.next();
    }

    // Fallback: jika somehow token ada tapi tidak valid
    console.log('Token problem, redirecting to login');
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('token');
    response.cookies.delete('role');
    return response;
}

// Konfigurasi matcher
export const config = {
    matcher: [
        /*
         * Match semua request paths kecuali:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login page
         * - file dengan extension (seperti .css, .js, dll)
         */
        '/((?!_next/static|_next/image|favicon.ico|login|.*\\.).*)',
    ],
};